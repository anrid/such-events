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
      waitOnFirstConnect: true,
      encoding: 'binary',
    })

    nc.on('close', () => L.info({ tag: 'NATS', message: 'connection closed', cluster: clusterId, client: id }))

    const clusterId = process.env.SUCH_EVENTS_NATS_CLUSTER_NAME
    L.info({ tag: 'NATS', message: 'connecting', cluster: clusterId, client: id }) 

    const conn = Stan.connect(clusterId, id, { nc })

    conn.on('connect', () => {
      L.info({ tag: 'NATS', message: 'connected', cluster: clusterId, client: id })
      resolve(conn)
    })

    conn.on('reconnecting', () => L.info({ tag: 'NATS', message: 'reconnecting', cluster: clusterId, client: id }))
    conn.on('reconnect', () => L.info({ tag: 'NATS', message: 'reconnected', cluster: clusterId, client: id }))
    conn.on('error', err => L.error({
      tag: 'NATS', message: 'connection error', cluster: clusterId, client: id, error: err.message
    }))

    conn['clientId'] = id
    conn.close = () => {
      nc.close()
      L.info({ tag: 'NATS', message: 'connection closing', cluster: clusterId, client: id })
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
  let optsLog: any = { }
  let clientId = conn['clientId']

  if (a.durable) {
    opts.setDurableName(a.durable)
    optsLog.durable = true
    clientId += `.${a.durable}`
  }
  if (a.fromTimeAgo) {
    let [value, unit] = a.fromTimeAgo.split(/\s+/)
    let v: any = parseInt(value, 10)
    if (isNaN(v)) v = 0
    const startTime = Moment().subtract(v, unit)
    opts.setStartTime(startTime.toDate())
    optsLog.from = startTime.format()
  }
  if (a.fromBeginning) {
    opts.setDeliverAllAvailable()
    optsLog.from = 'beginning'
  }
  if (a.manualAckMode) {
    opts.setManualAckMode(true)
    optsLog.manualAckMode = true
  }
  if (a.queueGroup) clientId += `.group.${a.queueGroup}`
  
  // Allow no more than <max> unacked message in-flight.
  const max = a.max || 100
  opts.setMaxInFlight(max)
  optsLog.maxInFlight = max

  // Wait no longer than 15 seconds for a message to be acked.
  opts.setAckWait(15 * 1000)

  L.info({
    tag: 'NATS', message: 'subscribing',
    source: a.source, client: clientId, subject: a.subject, options: optsLog,
  })
  const sub = conn.subscribe(a.subject, a.queueGroup || null, opts)
  
  sub.on('message', (msg: Stan.Message) => {
    a.onMessage(msg)
    .then(() => msg.ack())
    .catch(() => msg.ack())
  })

  // Wrap ready event in a promise.
  // Users of the subscription are then able to just do `await sub.isReady`
  sub['isReady'] = new Promise(resolve => {
    sub.on('ready', () => {
      L.info({
        tag: 'NATS', message: 'subscription ready',
        source: a.source, client: clientId, subject: a.subject, options: optsLog,
      })
      resolve()
    })
  })

  sub.on('error', err => {
    L.error({
      tag: 'NATS', message: 'subscription error',
      source: a.source, client: clientId, error: err.message
    })
    L.error(err)
  })
  sub.on('unsubscribed', () => (
    L.info({
      tag: 'NATS', message: 'unsubscribed',
      source: a.source, client: clientId, subject: a.subject,
    })
  ))
  sub.on('close', () => (
    L.info({
      tag: 'NATS', message: 'subscription closed',
      source: a.source, client: clientId, subject: a.subject,
    })
  ))

  return sub
}

function createPublisher (conn: Stan.Stan, source: string, parentEvent: EventMessage | null): Publisher {
  return async (event: string, data: any) => {
    let requestId = null
    let requestCreated = null
    let credentials = null

    if (parentEvent) {
      requestId = parentEvent.requestId
      requestCreated = parentEvent.requestCreated
      credentials = parentEvent.credentials
    }

    // Retry publishing event X number of times.
    let retries = 10
    let retryDelay = 5000
    while (retries--) {
      try {
        await publishEvent(conn, {
          source,
          requestId,
          requestCreated,
          credentials,
          event,
          data
        })
        break
      } catch (err) {
        if (err.message !== 'publish ack timeout') break
        L.info({
          tag: 'NATS', message: 'retrying publish event', event, source,
          request: requestId, delay: retryDelay,
        })
        await new Promise(r => setTimeout(r, 5000))
      }
    }
  }
}

export function subscribeToEvents (conn: Stan.Stan, a: SubscriberOptions) {
  const handler = async (msg: Stan.Message) => {
    let e: EventMessage
    let publisher: Publisher
    let data = null
    let id = conn['clientId']
    if (a.durable) id += `.${a.durable}`
    if (a.queueGroup) id += `.group.${a.queueGroup}`

    try {
      const timer = Date.now()
      data = msg.getData().toString()
      e = JSON.parse(data)

      const handler = a.eventHandlers[e.event] || a.eventHandlers['*']
      if (!handler) return

      publisher = createPublisher(conn, a.source, e)
      await handler(e, publisher)

      const took = Date.now() - timer
      let total = e.requestCreated ? Date.now() - e.requestCreated : 0
      L.info({
        tag: 'NATS', message: 'event handled', event: e.event, source: e.source,
        seq: msg.getSequence(), client: id, request: e.requestId, took, total,
      })
    } catch (err) {
      if (err instanceof SyntaxError) {
        L.error({ tag: 'NATS', message: 'malformed event message', data: data })  
      } else {
        const event = e ? e.event : 'unknown'
        const source = e ? e.source : 'unknown'
        const requestId = e ? e.requestId : 'none'
        L.error({
          tag: 'NATS', message: 'handle event error', event, source,
          seq: msg.getSequence(), client: id, request: requestId, error: err.message
        })
        L.error(err)
        
        // Publish default error. TODO: Remove this later perhaps.
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

export async function publishEvent (conn: Stan.Stan, e: EventMessage) {
  if (!e.requestId) e.requestId = createRequestId()
  if (!e.requestCreated) e.requestCreated = Date.now()

  const id = conn['clientId']
  const payload = JSON.stringify(e)
  const total = e.requestCreated ? Date.now() - e.requestCreated : 0

  L.info({
    tag: 'NATS', message: 'publish event', event: e.event,
    source: e.source, client: id, request: e.requestId, total: total
  })  

  return new Promise((resolve, reject) => {
    conn.publish(EVENT_SOURCE_SUBJECT, payload, (err, _guid) => {
      if (err) {
        L.error({
          tag: 'NATS', message: 'publish ack timeout error', event: e.event, source: e.source,
          client: id, request: e.requestId, data: e.data, error: err.message
        })
        return reject(new Error('publish ack timeout'))
      }
      L.info({
        tag: 'NATS', message: 'publish acked', event: e.event, source: e.source,
        client: id, request: e.requestId, total: total
      })
      resolve()
    })
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
