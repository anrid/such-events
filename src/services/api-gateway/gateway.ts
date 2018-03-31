import { Express } from 'express'
import * as Nats from '../../lib/nats-streaming'
import { EVENTS } from './events'
import * as Boom from 'boom'
import { L } from '../../lib/logger'
import * as P from '../../lib/proto'
import * as T from '../../../proto/compiled'

const SOURCE_INBOUND = 'api-gateway-in'
const SOURCE_OUTBOUND = 'api-gateway-out'

export async function init (app: Express, clientId: string) {
  // NATS streaming server connection.
  const stan = await Nats.getConnection(clientId)

  // Map of all requests for which we expect an eventual reply.
  const waiting: {
    [requestId: string]: (data: any, statusCode?: number) => void
  } = { }

  // Catch all /api/v1/* requests.
  app.all('/api/v1/*', (req, res) => {
    const { path, method } = req
    const credentials = req['credentials']

    if (!EVENTS[path]) throw Boom.badRequest(`Unsupported path "${path}"`)
    if (!EVENTS[path][method]) throw Boom.badRequest(`Unsupported method "${method}" for path "${path}"`)
    const e = EVENTS[path][method]
    if (e.credentials !== false) {
      if (!credentials) throw Boom.unauthorized(`Event "${e.event}" for path ${path} [${method}] requires credentials`)
    }

    const requestId = Nats.createRequestId()
    
    const data = Object.assign(
      { },
      req.body ? req.body : { },
      req.query ? req.query : { },
    )

    // Timeout after 3 seconds.
    const timeout = setTimeout (() => {
      delete waiting[requestId]
      const err = Boom.gatewayTimeout(`Request ${requestId} timed out`)
      res.status(err.output.statusCode).json(err.output.payload)
      L.error({
        tag: 'GW', message: 'request timed out',
        request: requestId, event: e.event, source: SOURCE_INBOUND,
      })
    }, 1000)

    // Create reply function.
    waiting[requestId] = (data: any, status?: number) => {
      delete waiting[requestId]
      clearTimeout(timeout)
      if (status) res.status(status)
      res.json(data)
    }

    // Publish event.
    L.info({
      tag: 'GW', message: 'request',
      request: requestId, path, event: e.event, source: SOURCE_INBOUND,
    })

    Nats.publishEvent(stan, {
      source: SOURCE_INBOUND,
      requestId,
      event: e.event,
      data,
      credentials,
    })
  })

  // Setup broadcast subscriber.
  const sub = Nats.subscribeToEvents(stan, {
    subject: Nats.BROADCAST_SUBJECT,
    source: SOURCE_OUTBOUND,
    durable: 'api-gateway-sub',
    queueGroup: null, 
    eventHandlers: {
      'v1.error': async e => {
        if (waiting[e.requestId]) {
          // Reply error to sender.
          L.error({
            tag: 'GW', message: 'reply error', error: e.data.error,
            request: e.requestId, event: e.data.event, source: SOURCE_OUTBOUND,
          })
          waiting[e.requestId](e.data, Boom.badRequest().output.statusCode)
        }
      },
      'v1.broadcast': async e => {
        try {
          const m = P.create(T.v1.Broadcast, e.data)
          const payload = JSON.parse(m.payload)
          if (waiting[e.requestId]) {
            // Reply to sender.
            L.info({
              tag: 'GW', message: 'reply',
              request: e.requestId, type: m.type, source: SOURCE_OUTBOUND,
            })
            waiting[e.requestId]({ type: m.type, payload })
          }
          if (m.targets && m.targets.length) {
            // TODO: Broadcast to targets, i.e. a list of user ids.
            L.info({
              tag: 'GW', message: 'broadcast',
              request: e.requestId, type: m.type, source: SOURCE_OUTBOUND,
              targets: m.targets
            })
          }
        } catch (err) {
          L.error({
            tag: 'GW', message: 'broadcast failed: ' + err.message,
            request: e.requestId, source: SOURCE_OUTBOUND,
          })
          L.error(err)
        }
      },
    }
  })

  return {
    sub,
    isReady: sub.isReady,
    close: () => {
      stan.close()
    }
  }
}
