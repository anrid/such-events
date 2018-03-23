import { generate } from 'shortid'
import { L } from '../../lib/logger'
import * as Crypto from 'crypto'
import * as P from '../../lib/proto'
import * as Jwt from '../../lib/jwt'
import * as T from '../../../proto/compiled'

const USERS = []

export async function userCreateHandler (e, publisher) {
  const m = P.create(T.v1.UserCreate, e.data)

  const exists = USERS.find(x => x.email === m.email)
  if (exists) {
    return publisher('v1.user.create.error', { error: 'email already registered' })
  }

  const salt = Crypto.randomBytes(16).toString('hex')
  const password = Crypto.pbkdf2Sync(m.password, salt, 100, 64, 'sha512').toString('hex')
  
  const user = {
    id: generate(),
    name: m.name,
    email: m.email,
    salt,
    password,
  }
  USERS.push(user)
  L.info(`action=user-create id=${user.id} email=${user.email}`)

  // Create a token on fly.
  const token = Jwt.createAccessToken(user.id, user.email)

  // NOTE: Always create outbound events via the protobufjs helper !
  const o1 = P.create(T.v1.UserCreateOk, { user, token })
  publisher('v1.user.create.ok', o1)

  const o2 = P.create(T.v1.UserCreateResponse, { user, token })
  const o3 = P.create(T.v1.Broadcast, {
    type: 'v1.user.create.ok',
    payload: JSON.stringify(o2),
  })
  publisher('v1.broadcast', o3)
}

export async function userUpdateHandler (e, publisher) {
  const user = USERS.find(x => x.id === e.id)
  if (!user) {
    return publisher('v1.user.update.error', { error: `user ${e.id} not found` })  
  }
  user[e.prop] = e.value
  publisher('v1.user.update.ok', { user })
}
