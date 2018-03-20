import { Express } from 'express'
import * as Nats from '../../lib/nats-streaming'
import { EVENTS } from './events'
import * as Boom from 'boom'
import { L } from '../../lib/logger'
import * as P from '../../lib/proto'
const broadcastType = P.load('broadcast.proto')


export async function init (app: Express, clientId: string) {
  // NATS streaming server connection.
  const stan = await Nats.getConnection(clientId)

  // Map of all requests for which we expect an eventual reply.
  const waiting: any = { }

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
    }, 1000)

    // Create reply function.
    waiting[requestId] = (data: any) => {
      delete waiting[requestId]
      clearTimeout(timeout)
      res.json(data)
    }

    // Publish event.
    Nats.publishEvent(stan, {
      source: 'api-gateway.pub',
      requestId,
      event: e.event,
      data,
      credentials,
    })
  })

  // Setup broadcast subscriber.
  Nats.subscribeToEvents(stan, {
    source: 'api-gateway.sub',
    queueGroup: null, 
    eventHandlers: {
      'v1.broadcast': async e => {
        P.validate(broadcastType, 'tw.BroadcastMessage', e.data)
        try {
          const payload = JSON.parse(e.data.payload)
          if (e.data.targets && e.data.targets.length) {
            // Broadcast to given targets (user ids).
            L.info('Broadcasting to targets:', e.data.targets)
          }
          else if (waiting[e.requestId]) {
            // Reply to sender.
            waiting[e.requestId]({
              type: e.data.type,
              payload,
            })
          }
        } catch (err) {
          L.error('Bad broadcast message:', e)
          L.error(err)
        }
      },
    }
  })

  return {
    close: () => {
      stan.close()
    }
  }
}
