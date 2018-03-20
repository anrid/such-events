import * as Assert from 'assert'
import * as Nats from 'nats'
import * as Stan from 'node-nats-streaming'
import { generate } from 'shortid'
import { L } from './logger'

Assert(process.env.SUCH_EVENTS_NATS_CLUSTER_NAME, 'Missing env SUCH_EVENTS_NATS_CLUSTER_NAME')
const EVENT_SOURCE_SUBJECT = 'tw-event-source'
let _conn: Stan.Stan

export function getConnection (clientId: string | null): Promise<Stan.Stan> {
  return new Promise(resolve => {
    if (_conn) return resolve(_conn)
    const id = clientId || createClientId()
    
    const nc = Nats.connect({
      reconnect: true,
      maxReconnectAttempts: 100,
      reconnectTimeWait: 3000,
      encoding: 'binary',
    })
    nc.on('close', () => L.info(`[NATS] action=connection-closed cluster=${clusterId} client=${id}`))

    const clusterId = process.env.SUCH_EVENTS_NATS_CLUSTER_NAME
    L.info(`[NATS] action=connecting cluster=${clusterId} client=${id}`) 
    _conn = Stan.connect(clusterId, id, { nc })

    _conn.on('connect', () => {
      L.info(`[NATS] action=connected cluster=${clusterId} client=${id}`)
      resolve(_conn)
    })

    _conn.on('reconnecting', () => L.info.log(`[NATS] action=reconnecting cluster=${clusterId} client=${id}`))
    _conn.on('reconnect', () => L.info(`[NATS] action=reconnected cluster=${clusterId} client=${id}`))
    _conn.on('error', err => L.error(`[NATS] action=connection-error cluster=${clusterId} client=${id} error=%s`, err))

    _conn['clientId'] = id
    _conn.close = () => nc.close()
  })
}

export function createRequestId () {
  return createId('r-')
}

export function createClientId () {
  return createId('client-')
}

function createId (prefix: string = '') {
  return `${prefix}${generate()}`
}

function createSubscription (conn: Stan.Stan, a: CreateSubscriptionOptions) {
  const opts = conn.subscriptionOptions()

  if (a.isDurable) opts.setDurableName(a.subject)
  if (a.fromMillisAgo) opts.setStartAtTimeDelta(a.fromMillisAgo)
  if (a.fromBeginning) opts.setDeliverAllAvailable()

  const sub = conn.subscribe(a.subject, a.queueGroup, opts)

  sub.on('message', a.onMessage)
  sub.on('ready', () => (
    L.info(`[NATS] action=subscription-ready source=${a.source} client=${conn['clientId']} subject=${a.subject}`)
  ))
  sub.on('error', err => {
    L.error(`[NATS] action=subscription-error source=${a.source} client=${conn['clientId']} error=${err.message}`)
    L.error('[NATS]', err)
  })
  sub.on('unsubscribed', () => (
    L.info(`[NATS] action=unsubscribed source=${a.source} client=${conn['clientId']} subject=${a.subject}`)
  ))
  sub.on('close', () => (
    L.info(`NATS: action=subscription-closed source=${a.source} client=${conn['clientId']} subject=${a.subject}`)
  ))

  return sub
}

function createPublisher (conn: Stan.Stan, source: string, parentEvent: EventMessage | null): Publisher {
  return (event: string, data: any) => {
    let requestId = null
    let requestCreated = null
    let credentials = null

    if (parentEvent) {
      requestId = parentEvent.requestId
      requestCreated = parentEvent.requestCreated
      credentials = parentEvent.credentials
    }

    publishEvent(conn, {
      source,
      requestId,
      requestCreated,
      credentials,
      event,
      data
    })
  }
}

export function subscribeToEvents (conn: Stan.Stan, a: SubscriberOptions) {
  const handler = async (msg: Stan.Message) => {
    let e: EventMessage
    let publisher: Publisher
    let msgData = null
    try {
      const timer = Date.now()
      msgData = msg.getData().toString()
      e = JSON.parse(msgData)

      const handler = a.eventHandlers[e.event] || a.eventHandlers['*']
      if (!handler) return

      publisher = createPublisher(conn, a.source, e)
      await handler(e, publisher)

      const took = Date.now() - timer
      const total = e.requestCreated ? Date.now() - e.requestCreated : 0
      L.info(
        `[NATS] action=event event=${e.event} source=${e.source} seq=${msg.getSequence()} ` + 
        `client=${conn['clientId']} request=${e.requestId} took=${took} total=${total}`
      )
    } catch (err) {
      const event = e ? e.event : 'unknown'
      const source = e ? e.source : 'unknown'
      const requestOrMessage = e ? `request=${e.requestId}` : `msg=${msgData}`
      L.error(
        `[NATS] action=event-error event=${event} source=${source} seq=${msg.getSequence()} ` +
        `client=${conn['clientId']} ${requestOrMessage} error=${err.message}`
      )
      L.error('[NATS]', err)

      if (publisher) {
        publisher(`${event}.error`, { error: err.message })
      }
    }
  }

  const sub = createSubscription(conn, {
    source: a.source,
    subject: EVENT_SOURCE_SUBJECT,
    queueGroup: a.queueGroup,
    onMessage: handler,
  })

  return sub
}

export function publishEvent (conn: Stan.Stan, e: EventMessage) {
  if (!e.requestId) e.requestId = createRequestId()
  if (!e.requestCreated) e.requestCreated = Date.now()
  const payload = JSON.stringify(e)
  const total = e.requestCreated ? Date.now() - e.requestCreated : 0

  L.info(
    `[NATS] action=publish event=${e.event} source=${e.source} ` +
    `client=${conn['clientId']} request=${e.requestId} total=${total}`
  )  

  conn.publish(EVENT_SOURCE_SUBJECT, payload, (err, _guid) => {
    if (err) {
      L.error(
        `[NATS] action=publish-ack-timeout-error event=${e.event} source=${e.source} ` + 
        `client=${conn['clientId']} data=%j error=%s`, e.data, err
      )
    }
  })
}

async function testRecv (clientId: string) {
  const conn = await getConnection(clientId)
  const onMessage = async msg => console.log('Received a message from event source: ' + msg.getData())
  createSubscription(conn, {
    source: 'test-receive-message',
    subject: EVENT_SOURCE_SUBJECT,
    queueGroup: null,
    onMessage,
  })
}

async function testSend (clientId: string) {
  const conn = await getConnection(clientId)
  let count = 0
  setInterval(() => {
    conn.publish(EVENT_SOURCE_SUBJECT, `hello #${++count} !`, (err, guid) => {
      if (err) {
        console.error('Publish failed:', err)
      } else {
        console.log(`Published message with guid: ${guid}`)
      }
    })
  }, 500)
}

if (require.main === module) {
  if (process.argv[2] === 'send' && process.argv[3]) testSend(process.argv[3])
  if (process.argv[2] === 'recv' && process.argv[3]) testRecv(process.argv[3])
}

export type Publisher = (event: string, data: any) => void
export type EventMessageHandler = (event: EventMessage, publisher: Publisher) => void

export interface CreateSubscriptionOptions {
  source: string,               // Where this subscriber is located.  
  subject: string,
  queueGroup: string | null,
  onMessage: (msg: any) => Promise<void>,
  isDurable?: boolean,          // Create a durable subscription. 
  fromMillisAgo?: number,       // Start processing messages since the given timestamp (millis).
  fromBeginning?: boolean,      // Start processing messages from the beginning of the queue.
}

export interface SubscriberOptions {
  source: string,               // Where this subscriber is located.
  queueGroup: string | null,
  eventHandlers: {
    [event: string]: EventMessageHandler,
  },
}

export interface EventMessage {
  source: string,                 // Where this event was published.
  requestId?: string | null,      // Pass request id of the original request if we wish
                                  // to have it propagate.
  requestCreated?: number | null, // Pass created timestamp (millis) of the original request.
  event: string,                  // Event name.
  data: any,                      // Data object.
  credentials: any | null,        // Caller's credentials.
}
