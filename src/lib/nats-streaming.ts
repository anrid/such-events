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
    nc.on('close', () => L.info('NATS: action=close'))

    const clusterId = process.env.SUCH_EVENTS_NATS_CLUSTER_NAME
    L.info(`NATS: action=connecting cluster=${clusterId} id=${id} ..`) 
    _conn = Stan.connect(clusterId, id, { nc })

    _conn.on('connect', () => {
      L.info(`NATS: action=connected cluster=${clusterId} id=${id}`)
      resolve(_conn)
    })

    _conn.on('reconnecting', () => L.info.log(`NATS: action=reconnecting cluster=${clusterId} id=${id} ..`))
    _conn.on('reconnect', () => L.info(`NATS: action=reconnected cluster=${clusterId} id=${id}`))
    _conn.on('error', err => L.error('NATS: error=', err))

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

function createSubscription (
  conn: Stan.Stan,
  subject: string,
  queueGroup: string | null,
  onMessage: (msg: any) => Promise<void>,
  isDurable: boolean,
) {
  // Subscribe with a durable name.
  const opts = conn.subscriptionOptions()
  opts.setStartWithLastReceived()
  if (isDurable) opts.setDurableName(subject)

  const sub = conn.subscribe(subject, queueGroup, opts)

  sub.on('message', onMessage)
  sub.on('ready', () => L.info(`NATS: action=subscribe status=ready subject=${subject}`))
  sub.on('error', err => L.error('NATS: error=', err))
  sub.on('unsubscribed', () => L.info(`NATS: action=unsubscribe subject=${subject}`))
  sub.on('close', () => L.info(`NATS: action=subscription_closed subject=${subject}`))

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

      const handler = a.eventHandlers[e.event]
      if (!handler) return

      publisher = createPublisher(conn, a.source, e)
      await handler(e, publisher)

      L.info(
        `NATS: client=${conn['clientId']} action=sub ` +
        `event=${e.event} request=${e.requestId} took=${Date.now() - timer} ` +
        `total=${e.requestCreated ? Date.now() - e.requestCreated : 0}`
      )
    } catch (err) {
      const event = e ? e.event : 'none'
      const requestOrMessage = e ? `request=${e.requestId}` : `msg=${msgData}`
      L.error(
        `NATS: client=${conn['clientId']} action=sub ` +
        `event=${event} ${requestOrMessage} error=${err.message}`
      )
      if (publisher) {
        publisher(`${msg.getSubject()}:error`, { error: err.message })
      }
    }
  }

  const sub = createSubscription(
    conn,
    EVENT_SOURCE_SUBJECT,
    a.queueGroup,
    handler,
    false,
  )

  return sub
}

export function publishEvent (conn: Stan.Stan, e: EventMessage) {
  if (!e.requestId) e.requestId = createRequestId()
  if (!e.requestCreated) e.requestCreated = Date.now()
  const payload = JSON.stringify(e)
  L.info(
    `NATS: client=${conn['clientId']} action=pub event=${e.event} ` +
    `request=${e.requestId} total=${e.requestCreated ? Date.now() - e.requestCreated : 0}`
  )
  conn.publish(EVENT_SOURCE_SUBJECT, payload, (err, _guid) => {
    if (err) {
      L.error(`NATS: client=${conn['clientId']} error=`, err)
      return
    }
  })
}

async function testRecv (clientId: string) {
  const conn = await getConnection(clientId)
  const onMessage = async msg => console.log('Received a message from event source: ' + msg.getData())
  createSubscription(conn, EVENT_SOURCE_SUBJECT, null, onMessage, true)
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

export interface SubscriberOptions {
  source: string,
  queueGroup: string | null,
  eventHandlers: {
    [event: string]: EventMessageHandler,
  },
}

export interface EventMessage {
  source: string,                 // Source that published this event.
  requestId: string | null,       // Pass request id of the original request if we wish
                                  // to have it propagate.
  requestCreated: number | null,  // Pass created timestamp (millis) of the original request.
  event: string,                  // Event name.
  data: any,                      // Data object.
  credentials: any | null,        // Caller's credentials.
}
