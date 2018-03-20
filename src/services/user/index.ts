import * as Nats from '../../lib/nats-streaming'
import { generate } from 'shortid'
import * as Proto from 'protobufjs'
import * as Path from 'path'
import { L } from '../../lib/logger'

const USERS = []
const TYPES = {
  user: Proto.loadSync(Path.join(__dirname, '../../../proto/user.proto'))
}

export async function setupServer (a: ServerOptions) {
  const stan = await Nats.getConnection(a['client-id'])

  // Setup dummy responder.
  const sub = Nats.subscribeToEvents(stan, {
    source: 'user-service',
    queueGroup: null,
    eventHandlers: {
      'v1.user.create': userCreateHandler,
      'v1.user.update': userUpdateHandler,
    },
  })

  return {
    sub,
    stan,
    close: () => stan.close(),
  }
}

async function userCreateHandler (e, publisher) {
  validate('user', 'tw.CreateUserMessage', e.data)

  const exists = USERS.find(x => x.email === e.email)
  if (exists) {
    return publisher('v1.user.create.error', { error: 'email already registered' })
  }

  const user = {
    id: generate(),
    name: e.data.name,
    email: e.data.email,
  }
  USERS.push(user)
  L.info('created user=', user)

  const out = { user }
  validate('user', 'tw.CreateUserOkMessage', out)
  publisher('v1.user.create.ok', out)
}

async function userUpdateHandler (e, publisher) {
  const user = USERS.find(x => x.id === e.id)
  if (!user) {
    return publisher('v1.user.update.error', { error: `user ${e.id} not found` })  
  }
  user[e.prop] = e.value
  publisher('v1.user.update.ok', { user })
}

function validate (root: string, type: string, data) {
  const t = TYPES[root].lookupType(type)
  const err = t.verify(data)
  if (err) throw new Error(`Validation error: ${err}`)
}

if (require.main === module) {
  setupServer(require('minimist')(process.argv.slice(2)))
  .catch(err => console.error(err))
}

interface ServerOptions {
  'port'?: number,
  'client-id': string,
}
