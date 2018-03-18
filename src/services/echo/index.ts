import * as Nats from '../../lib/nats-streaming'

export async function setupServer (a: ServerOptions) {
  const stan = await Nats.getConnection(a['client-id'])

  // Setup dummy responder.
  const sub = Nats.subscribeToEvents(stan, {
    source: 'echo-server',
    queueGroup: null,
    eventHandlers: {
      'v1.echo.create': echoHandler,
      'v1.echo-secret.create': echoSecretHandler,
    },
  })

  return {
    sub,
    stan,
    close: () => stan.close(),
  }
}

async function echoHandler (e: Nats.EventMessage, publisher: Nats.Publisher) {
  publisher('v1.broadcast', e.data)
}

async function echoSecretHandler (e: Nats.EventMessage, publisher: Nats.Publisher) {
  if (!e.credentials) throw new Error('Missing credentials')
  publisher('v1.broadcast', Object.assign({ }, e.data, { email: e.credentials.email }))
}

if (require.main === module) {
  setupServer(require('minimist')(process.argv.slice(2)))
  .catch(err => console.error(err))
}

interface ServerOptions {
  'port'?: number,
  'client-id': string,
}
