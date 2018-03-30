import { generate } from 'shortid'
import { L } from '../../lib/logger'
import * as P from '../../lib/proto'
import * as Jwt from '../../lib/jwt'
import * as T from '../../../proto/compiled'
import * as Db from './db'
import { createSalt, createPassword } from './util'
import { Publisher, EventMessage } from '../../lib/nats-streaming'

export async function userCreateHandler (e: EventMessage, publisher: Publisher) {
  const m = P.create(T.v1.UserCreate, e.data)

  const exists = await Db.findOne('users', { email: m.email })
  if (exists) {
    L.error({ tag: 'USER', error: 'email already registered', email: m.email })
    throw new Error('email already registered')
  }

  const salt = createSalt()
  const password = createPassword(m.password, salt)

  const user = {
    id: generate(),
    name: m.name,
    email: m.email,
    salt,
    password,
  }
  await Db.insert('users', user)
  L.info({ tag: 'USER', message: 'user created', user: user.id, email: user.email })

  // Create a new access token as part of sign up.
  const token = Jwt.createAccessToken(user.id, user.email)

  // NOTE: Always create outbound events via the protobufjs helper !
  const o1 = P.create(T.v1.UserCreateOk, { user, token })
  publisher('v1.user.create.ok', o1, false)

  const o2 = P.create(T.v1.UserCreatedOrLoggedInReply, { user, token })
  const o3 = P.create(T.v1.Broadcast, { type: 'v1.user.create.ok', payload: JSON.stringify(o2) })
  publisher('v1.broadcast', o3, true)
}

export async function userUpdateHandler (e: EventMessage, publisher: Publisher) {
  const m: T.v1.UserUpdate = P.create(T.v1.UserUpdate, e.data)

  const user = await Db.findOne('users', { _id: m.credentials.id })
  if (!user) {
    L.error({ tag: 'USER', handler: 'update', error: 'user not found', user: m.credentials.id })
    throw new Error(`user ${m.credentials.id} not found`)  
  }

  // TODO: Perform the actual update.

  const o1 = P.create(T.v1.UserUpdateOk, { userId: m.credentials.id, update: m.update })
  publisher('v1.user.update.ok', o1, false)

  const o2 = P.create(T.v1.Broadcast, { type: 'v1.user.update.ok', payload: JSON.stringify(o1) })
  publisher('v1.broadcast', o2, true)
}

export async function userLoginHandler (e: EventMessage, publisher: Publisher) {
  const m = P.create(T.v1.UserLogin, e.data)

  const user = await Db.findOne('users', { email: m.email })
  if (!user) {
    L.info({ tag: 'USER', message: 'login failed', email: m.email, error: `no user found` })
    throw new Error('invalid email or password')
  }

  const password = createPassword(m.password, user.salt)
  if (password !== user.password) {
    L.info({ tag: 'USER', message: 'login failed', email: m.email, error: `invalid password` })
    throw new Error('invalid email or password')
  }
  
  L.info({ tag: 'USER', message: 'login successful',  user: user.id, email: user.email })

  // Create a new access token.
  const token = Jwt.createAccessToken(user.id, user.email)

  const o1 = P.create(T.v1.UserLoginOk, { user })
  publisher('v1.user.login.ok', o1, false)

  const o2 = P.create(T.v1.UserCreatedOrLoggedInReply, { user, token })
  const o3 = P.create(T.v1.Broadcast, { type: 'v1.user.login.ok', payload: JSON.stringify(o2) })
  publisher('v1.broadcast', o3, true)
}
