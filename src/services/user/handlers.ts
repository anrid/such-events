import { generate } from 'shortid'
import { L } from '../../lib/logger'
import * as Crypto from 'crypto'
import * as P from '../../lib/proto'
import * as Jwt from '../../lib/jwt'

const USERS = []
const broadcastType = P.load('broadcast.proto')
const userType = P.load('user.proto')

export async function userCreateHandler (e, publisher) {
  P.validate(userType, 'tw.CreateUser', e.data)

  const exists = USERS.find(x => x.email === e.email)
  if (exists) {
    return publisher('v1.user.create.error', { error: 'email already registered' })
  }

  const salt = Crypto.randomBytes(16).toString('hex')
  const password = Crypto.pbkdf2Sync(e.data.password, salt, 100, 64, 'sha512').toString('hex')
  
  const user = {
    id: generate(),
    name: e.data.name,
    email: e.data.email,
    salt,
    password,
  }
  USERS.push(user)
  L.info(`action=user-create id=${user.id} email=${user.email}`)

  // Create a token on fly.
  const token = Jwt.createAccessToken(user.id, user.email)

  // NOTE: Always create outbound events via the protobufjs helper !
  const out1 = P.create(userType, 'tw.CreateUserOk', { user, token })
  publisher('v1.user.create.ok', out1)

  const out2 = P.create(broadcastType, 'tw.BroadcastMessage', {
    type: 'v1.user.create.ok',
    payload: JSON.stringify(out1),
  })
  publisher('v1.broadcast', out2)
}

export async function userUpdateHandler (e, publisher) {
  const user = USERS.find(x => x.id === e.id)
  if (!user) {
    return publisher('v1.user.update.error', { error: `user ${e.id} not found` })  
  }
  user[e.prop] = e.value
  publisher('v1.user.update.ok', { user })
}
