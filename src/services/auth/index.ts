import * as Assert from 'assert'
import * as Https from 'https'
import * as Fs from 'fs'
import * as Uws from 'uws'
import * as Express from 'express'
import * as GoogleOAuth from './google-oauth'
import { defaultExpressErrorHandler } from '../../lib/express-utils'
import * as Moment from 'moment'
import { jwtMiddleware } from '../../lib/jwt'
import * as Tw from './tw'
import { L } from '../../lib/logger'
import { getLocalConnection } from '../../lib/mongo'

Assert(process.env.SUCH_EVENTS_HOST, 'Missing env SUCH_EVENTS_HOST')
Assert(process.env.SUCH_EVENTS_PORT, 'Missing env SUCH_EVENTS_PORT')
Assert(process.env.SUCH_EVENTS_URL, 'Missing env SUCH_EVENTS_URL')
Assert(process.env.SUCH_EVENTS_TLS_CERT, 'Missing env SUCH_EVENTS_TLS_CERT')
Assert(process.env.SUCH_EVENTS_TLS_PRIVKEY, 'Missing env SUCH_EVENTS_TLS_PRIVKEY')

L.info('API server start:', Moment().format())

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection at:', reason)
})

setupServer().catch(err => console.error(err))

async function setupServer () {
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

  // Setup local db connection and expose it
  // as req.db to each request.
  const local = await getLocalConnection()
  app.use((req: any, _res, next) => {
    if (req.db) return next()
    req.db = local.db
    next()
  })

  // Setup a basic root route.
  app.get('/', (_req, res) => {
    res.send('Hello World!')
  })

  // Setup all other routes.
  GoogleOAuth.setupRoutes(app)
  Tw.setupRoutes(app)

  // Setup generic error handler.
  app.use(defaultExpressErrorHandler)

  // Setup HTTPS server.
  const options = {
    cert: Fs.readFileSync(process.env.SUCH_EVENTS_TLS_CERT),
    key: Fs.readFileSync(process.env.SUCH_EVENTS_TLS_PRIVKEY),
  }
  const httpsServer = Https.createServer(options, app)

  // Connect UWS.
  const wss = new Uws.Server({ server: httpsServer, path: '/ws' })

  // TODO: Implement socket handler.
  wss.on('connection', ws => {
    ws.on('message', message => {
      ws.send(message, { binary: Buffer.isBuffer(message) })
    })
  })

  // Listen.
  httpsServer.listen(process.env.SUCH_EVENTS_PORT, () => {
    L.info(
      'Server listening on https://%s:%s ..',
      process.env.SUCH_EVENTS_HOST,
      process.env.SUCH_EVENTS_PORT,
    )
  })
}
