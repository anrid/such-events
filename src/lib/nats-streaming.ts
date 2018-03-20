import * as Assert from 'assert'
import * as Nats from 'nats'
import * as Stan from 'node-nats-streaming'
import { generate } from 'shortid'
import { L } from './logger'
import * as Moment from 'moment'

Assert(process.env.SUCH_EVENTS_NATS_CLUSTER_NAME, 'Missing env SUCH_EVENTS_NATS_CLUSTER_NAME')
const EVENT_SOURCE_SUBJECT = 'tw-event-source'

export function getConnection (clientId: string | null): Promise<Stan.Stan> {
  return new Promise(resolve => {
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

    const conn = Stan.connect(clusterId, id, { nc })

    conn.on('connect', () => {
      L.info(`[NATS] action=connected cluster=${clusterId} client=${id}`)
      resolve(conn)
    })

    conn.on('reconnecting', () => L.info(`[NATS] action=reconnecting cluster=${clusterId} client=${id}`))
    conn.on('reconnect', () => L.info(`[NATS] action=reconnected cluster=${clusterId} client=${id}`))
    conn.on('error', err => L.error(`[NATS] action=connection-error cluster=${clusterId} client=${id} error=%s`, err))

    conn['clientId'] = id
    conn.close = () => {
      L.info(`[NATS] action=connection-closing cluster=${clusterId} client=${id}`)
      nc.close()
    }
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
  let optsLog = []
  let clientId = conn['clientId']

  if (a.durable) {
    opts.setDurableName(a.durable)
    optsLog.push(`durable=true`)
    clientId += `.${a.durable}`
  }
  if (a.fromTimeAgo) {
    let [value, unit] = a.fromTimeAgo.split(/\s+/)
    let v: any = parseInt(value, 10)
    if (isNaN(v)) v = 0
    const startTime = Moment().subtract(v, unit)
    opts.setStartTime(startTime.toDate())
    optsLog.push(`from=${startTime.format()}`)
  }
  if (a.fromBeginning) {
    opts.setDeliverAllAvailable()
    optsLog.push(`from=beginning`)
  }
  if (a.manualAckMode) {
    opts.setManualAckMode(true)
    optsLog.push('manualAckMode=true')
  }
  if (a.queueGroup) clientId += `.group.${a.queueGroup}`
  
  // Allow no more than <max> unacked message in-flight.
  const max = a.max || 100
  opts.setMaxInFlight(max)
  optsLog.push(`max=${max}`)

  // Wait no longer than 15 seconds for a message to be acked.
  opts.setAckWait(15 * 1000)

  const sub = conn.subscribe(a.subject, a.queueGroup || null, opts)
  
  sub.on('message', (msg: Stan.Message) => {
    a.onMessage(msg)
    .then(() => msg.ack())
    .catch(() => msg.ack())
  })
  sub.on('ready', () => (
    L.info(
      `[NATS] action=subscription-ready source=${a.source} client=${clientId} subject=${a.subject} ` +
      optsLog.join(' ')
    )
  ))
  sub.on('error', err => {
    L.error(`[NATS] action=subscription-error source=${a.source} client=${clientId} error=${err.message}`)
    L.error('[NATS]', err)
  })
  sub.on('unsubscribed', () => (
    L.info(`[NATS] action=unsubscribed source=${a.source} client=${clientId} subject=${a.subject}`)
  ))
  sub.on('close', () => (
    L.info(`NATS: action=subscription-closed source=${a.source} client=${clientId} subject=${a.subject}`)
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
    let data = null
    let clientId = conn['clientId']
    if (a.durable) clientId += `.${a.durable}`
    if (a.queueGroup) clientId += `.group.${a.queueGroup}`

    try {
      const timer = Date.now()
      data = msg.getData().toString()
      e = JSON.parse(data)

      const handler = a.eventHandlers[e.event] || a.eventHandlers['*']
      if (!handler) return

      publisher = createPublisher(conn, a.source, e)
      await handler(e, publisher)

      const took = Date.now() - timer
      let total = ((e.requestCreated ? Date.now() - e.requestCreated : 0) / 1000).toFixed(3)
      L.info(
        `[NATS] action=event event=${e.event} source=${e.source} seq=${msg.getSequence()} ` + 
        `client=${clientId} request=${e.requestId} took=${took} total=${total}`
      )
    } catch (err) {
      if (err instanceof SyntaxError) {
        L.error(`[NATS] malformed event message, data="${data}"`)  
      } else {
        const event = e ? e.event : 'unknown'
        const source = e ? e.source : 'unknown'
        const requestOrMessage = e ? `request=${e.requestId}` : `msg=${data}`
        L.error(
          `[NATS] action=event-error event=${event} source=${source} seq=${msg.getSequence()} ` +
          `client=${clientId} ${requestOrMessage} error=${err.message}`
        )
        L.error('[NATS]', err)
        if (publisher) {
          publisher(`${event}.error`, { error: err.message })
        }
      }
    }
  }

  const sub = createSubscription(conn, {
    source: a.source,
    subject: EVENT_SOURCE_SUBJECT,
    queueGroup: a.queueGroup,
    onMessage: handler,
    durable: a.durable,
    fromTimeAgo: a.fromTimeAgo,
    fromBeginning: a.fromBeginning,
    manualAckMode: true,
    max: a.max,
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
        `client=${conn['clientId']} request=${e.requestId} data=%j error=%s`, e.data, err
      )
    } else {
      L.info(
        `[NATS] action=publish-ack event=${e.event} source=${e.source} ` +
        `client=${conn['clientId']} request=${e.requestId} total=${total}`
      )  
    }
  })
}

export type Publisher = (event: string, data: any) => void
export type EventMessageHandler = (event: EventMessage, publisher: Publisher) => Promise<void>
export type EventHandlersMap = { [event: string]: EventMessageHandler }

export interface NatsSubscriberOptions {
  durable?: string                // Create a durable subscription with the given name.
  fromTimeAgo?: string            // Start processing messages since "<value> <unit>" ago,
                                  // e.g. "10 days", "2 hours", "30 seconds" etc.
  fromBeginning?: boolean         // Start processing messages from the beginning of the queue.
  max?: number                    // Max number of unack message in-flight for this subscription.
  manualAckMode?: boolean         // Enable manual ack mode.
}

export interface CreateSubscriptionOptions extends NatsSubscriberOptions {
  source: string                // Where this subscriber is located.  
  subject: string
  queueGroup: string | null
  onMessage: (msg: any) => Promise<void>
}

export interface SubscriberOptions extends NatsSubscriberOptions {
  source: string                  // Where this subscriber is located.
  queueGroup: string | null
  eventHandlers: EventHandlersMap
}

export interface EventMessage {
  source: string                  // Where this event was published.
  requestId?: string | null       // Pass request id of the original request if we wish
                                  // to have it propagate.
  requestCreated?: number | null  // Pass created timestamp (millis) of the original request.
  event: string                   // Event name.
  data: any                       // Data object.
  credentials: any | null         // Caller's credentials.
}
