import * as Assert from 'assert'
import * as Crypto from 'crypto'
import { Db } from 'mongodb'
import { getLocalConnection } from './mongo'
import { createAccessToken, verifyAccessToken } from './jwt'

const PASSWORD_ITERATIONS = 10000

function createSalt () {
  return Crypto.randomBytes(16).toString('base64')
}

export function createOldTwAccessToken (userId) {
  var info = createSalt() + '____' + userId
  var token = Crypto.createHash('sha256').update(info).digest('hex')
  return token
}

export function checkPassword (plainTextPassword: string, salt: string, hashedPassword: string) {
  return encryptPassword(plainTextPassword, salt) === hashedPassword
}

function encryptPassword (password: string, salt: string) {
  Assert(salt, 'Missing salt arg')
  Assert(password, 'Missing password arg')
  const saltBase64 = new Buffer(salt, 'base64')
  return Crypto.pbkdf2Sync(password, saltBase64, PASSWORD_ITERATIONS, 64, 'sha1').toString('base64')
}

export async function login (local: Db, email: string, plainTextPassword: string) {
  const c = await local.collection('credentials').findOne({ email })

  if (!c) {
    throw new Error('Missing credentials for email ' + email)
  }

  if (!checkPassword(plainTextPassword, c.salt, c.hashed_password)) {
    throw new Error('Invalid password for email ' + email)
  }

  return createAccessToken(c._id.toString(), c.email)
}

// Test login via the command-line.
// Usage: node tw-auth.js email password
if (require.main === module) {
  if (process.argv[2] && process.argv[3]) {
    (async () => {
      let local
      try {
        local = await getLocalConnection()
        const accessToken = await login(local.db, process.argv[2], process.argv[3])
        console.log('Logged in successfully.')
        console.log('Verified token:', verifyAccessToken(accessToken))
      } catch (err) {
        console.error(err)
      } finally {
        if (local) local.close()
      }
    })()
  }
}
