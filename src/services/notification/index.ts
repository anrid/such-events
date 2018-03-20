import * as Nats from '../../lib/nats-streaming'
import { generate } from 'shortid'
import * as P from '../../lib/proto'

const NOTIFICATIONS = []

const notificationType = P.load('notification.proto')
const userType = P.load('user.proto')

export async function setupServer (a: ServerOptions) {
  const stan = await Nats.getConnection(a.id)

  const sub = Nats.subscribeToEvents(stan, {
    source: 'notification-service',
    queueGroup: null,
    eventHandlers: {
      'v1.user.create.ok': userCreatedOkHandler,
    },
  })

  return {
    sub,
    stan,
    close: () => stan.close(),
  }
}

async function userCreatedOkHandler (e, publisher) {
  P.validate(userType, 'v1.CreateUserOk', e.data)

  const user = e.data.user

  const notification = {
    id: generate(),
    from: user.id,
    to: 'system',
    message: 'User created successfully',
    metadata: { user },
  }
  
  NOTIFICATIONS.push(user)
  
  // Always create outbound events via the protobufjs helper.
  const out = P.create(notificationType, 'v1.CreateNotificationOk', { notification })

  publisher('v1.notification.create.ok', out)
}

if (require.main === module) {
  setupServer(require('minimist')(process.argv.slice(2)))
  .catch(err => console.error(err))
}

interface ServerOptions {
  id:    string     // Client id.
  port?: number
}
