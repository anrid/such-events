import { generate } from 'shortid'
import { L } from '../../lib/logger'
import * as Crypto from 'crypto'
import * as P from '../../lib/proto'
import * as Jwt from '../../lib/jwt'
import * as T from '../../../proto/compiled'

const USERS = []
createTestUsers()

export async function userCreateHandler (e, publisher) {
  const m = P.create(T.v1.UserCreate, e.data)

  const exists = USERS.find(x => x.email === m.email)
  if (exists) {
    return publisher('v1.user.create.error', { error: 'email already registered' })
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
  USERS.push(user)
  L.info({ message: 'user created', user: user.id, email: user.email })

  // Create a new access token as part of sign up.
  const token = Jwt.createAccessToken(user.id, user.email)

  // NOTE: Always create outbound events via the protobufjs helper !
  const o1 = P.create(T.v1.UserCreateOk, { user, token })
  publisher('v1.user.create.ok', o1)

  const o2 = P.create(T.v1.UserCreatedOrLoggedInReply, { user, token })
  const o3 = P.create(T.v1.Broadcast, { type: 'v1.user.create.ok', payload: JSON.stringify(o2) })
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

export async function userLoginHandler (e, publisher) {
  const m = P.create(T.v1.UserLogin, e.data)

  const user = USERS.find(x => x.email === m.email)
  if (!user) {
    L.info({ message: 'login-failed', email: m.email, error: `no user found` })
    return publisher('v1.user.login.error', { error: 'invalid email or password' })
  }

  const password = createPassword(m.password, user.salt)
  if (password !== user.password) {
    L.info({ message: 'login-failed', email: m.email, error: `invalid password` })
    return publisher('v1.user.login.error', { error: 'invalid email or password' })
  }
  
  L.info({ message: 'login successful',  user: user.id, email: user.email })

  // Create a new access token.
  const token = Jwt.createAccessToken(user.id, user.email)

  const o1 = P.create(T.v1.UserLoginOk, { user })
  publisher('v1.user.login.ok', o1)

  const o2 = P.create(T.v1.UserCreatedOrLoggedInReply, { user, token })
  const o3 = P.create(T.v1.Broadcast, { type: 'v1.user.login.ok', payload: JSON.stringify(o2) })
  publisher('v1.broadcast', o3)
}

function createPassword (plaintextPassword: string, salt: string) {
  return Crypto.pbkdf2Sync(plaintextPassword, salt, 100, 64, 'sha512').toString('hex')
}

function createSalt () {
  return Crypto.randomBytes(16).toString('hex')
}

export function createTestUsers () {
  const salt = createSalt()
  const password = createPassword('123456', salt)
  
  const user1 = {
    id: 'joe-test',
    name: 'Joe Schmoe',
    email: 'joe@example.com',
    salt,
    password,
  }

  USERS.push(user1)
}
