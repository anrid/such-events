import * as Assert from 'assert'
import * as Https from 'https'
import * as Fs from 'fs'
import * as Uws from 'uws'
import * as Express from 'express'
import { defaultExpressErrorHandler } from '../../lib/express-utils'
import { jwtMiddleware } from '../../lib/jwt'
import * as Gateway from './gateway'
import { L } from '../../lib/logger'
import * as Moment from 'moment'

Assert(process.env.SUCH_EVENTS_HOST, 'Missing env SUCH_EVENTS_HOST')
Assert(process.env.SUCH_EVENTS_TLS_CERT, 'Missing env SUCH_EVENTS_TLS_CERT')
Assert(process.env.SUCH_EVENTS_TLS_PRIVKEY, 'Missing env SUCH_EVENTS_TLS_PRIVKEY')

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection at:', reason)
})

export async function setupServer (opts: ServerOptions) {
  Assert(opts.id, 'Missing --id flag. Each API gateway instance needs a unique id.')

  // Setup express.
  const app = Express()

  // Enable compression for all requests.
  const compression = require('compression')
  app.use(compression())

  // Enable CORS for all requests.
  const cors = require('cors')
  app.use(cors())
  
  // Setup middleware.
  // Parse JSON etc.
  const bodyParser = require('body-parser')
  // Parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))
  // Parse application/json
  app.use(bodyParser.json())

  // Enable JWT session handling.
  app.use(jwtMiddleware)

  // Setup a basic root route.
  app.get('/', (_req, res) => res.send(`API gateway running: ${Moment().format()}`))

  // Setup other routes.
  const gateway = await Gateway.init(app, opts.id)

  // Setup generic error handler.
  app.use(defaultExpressErrorHandler)

  // Setup HTTPS server.
  const options = {
    cert: Fs.readFileSync(process.env.SUCH_EVENTS_TLS_CERT),
    key: Fs.readFileSync(process.env.SUCH_EVENTS_TLS_PRIVKEY),
  }

  const server = Https.createServer(options, app)
  let isConnected = Promise.resolve()

  if (opts.port) {
    // server.isReady is a promise that resolves when the server
    // is listening on the given port.
    isConnected = new Promise(resolve => {
      server.listen(opts.port, () => {
        L.info({
          client: opts.id,
          message: 'server listening', 
          url: `https://${process.env.SUCH_EVENTS_HOST}:${opts.port}`
        })
        resolve()
      })
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
    gateway,
    // Resolves when we're both connected and the NATS subscription is ready.
    isReady: Promise.all([isConnected, gateway.isReady]),
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
  id:    string
  port?: number
}
