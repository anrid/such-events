import * as Assert from 'assert'
import * as Https from 'https'
import * as Fs from 'fs'
import * as Uws from 'uws'
import * as Express from 'express'
import { defaultExpressErrorHandler } from '../../lib/express-utils'
import { jwtMiddleware } from '../../lib/jwt'
import * as Gateway from './gateway'
import { L } from '../../lib/logger'

Assert(process.env.SUCH_EVENTS_HOST, 'Missing env SUCH_EVENTS_HOST')
Assert(process.env.SUCH_EVENTS_TLS_CERT, 'Missing env SUCH_EVENTS_TLS_CERT')
Assert(process.env.SUCH_EVENTS_TLS_PRIVKEY, 'Missing env SUCH_EVENTS_TLS_PRIVKEY')

// All API Gateways are expected to receive all tw-broadcast events.
// const QUEUE_GROUP = null

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection at:', reason)
})

export async function setupServer (opts: ServerOptions) {
  Assert(opts['client-id'], 'Missing --client-id flag. Each API gateway instance needs a persistent client id.')

  // Setup express.
  const app = Express()

  // Setup middleware.
  // Parse JSON etc.
  const bodyParser = require('body-parser')
  // Parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))
  // Parse application/json
  app.use(bodyParser.json())

  // Enable compression for all requests.
  const compression = require('compression')
  app.use(compression())

  // Enable CORS for all requests.
  const cors = require('cors')
  app.use(cors())

  // Enable JWT session handling.
  app.use(jwtMiddleware)

  // Setup a basic root route.
  app.get('/', (_req, res) => {
    res.send('API Gateway.')
  })

  // Setup other routes.
  const gateway = await Gateway.init(app, opts['client-id'])

  // Setup generic error handler.
  app.use(defaultExpressErrorHandler)

  // Setup HTTPS server.
  const options = {
    cert: Fs.readFileSync(process.env.SUCH_EVENTS_TLS_CERT),
    key: Fs.readFileSync(process.env.SUCH_EVENTS_TLS_PRIVKEY),
  }

  const server = Https.createServer(options, app)

  if (opts.port) {
    server.listen(opts.port, () => {
      L.info(
        'API gateway listening on https://%s:%s ..',
        process.env.SUCH_EVENTS_HOST,
        opts.port,
      )
    })
  }

  // Connect UWS.
  const wss = new Uws.Server({ server: server, path: '/ws' })
  wss.on('connection', ws => {
    ws.on('message', message => {
      ws.send(message, { binary: Buffer.isBuffer(message) })
    })
  })

  return {
    app,
    server,
    close: () => {
      // Close everything !
      server.close()
      gateway.close()
    }
  }
}

if (require.main === module) {
  setupServer(require('minimist')(process.argv.slice(2)))
  .catch(err => console.error(err))
}

interface ServerOptions {
  'port'?: number,
  'client-id': string,
}
