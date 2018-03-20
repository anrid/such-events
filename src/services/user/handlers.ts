import { generate } from 'shortid'
import { L } from '../../lib/logger'
import * as Crypto from 'crypto'
import * as P from '../../lib/proto'

const USERS = []
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
  L.info('Ooo.. a new user:', user)

  // Always create outbound events via the protobufjs helper.
  const out = P.create(userType, 'tw.CreateUserOk', { user })

  publisher('v1.user.create.ok', out)
}

export async function userUpdateHandler (e, publisher) {
  const user = USERS.find(x => x.id === e.id)
  if (!user) {
    return publisher('v1.user.update.error', { error: `user ${e.id} not found` })  
  }
  user[e.prop] = e.value
  publisher('v1.user.update.ok', { user })
}
