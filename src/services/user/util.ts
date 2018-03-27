import * as Crypto from 'crypto'

export function createPassword (plaintextPassword: string, salt: string) {
  return Crypto.pbkdf2Sync(plaintextPassword, salt, 100, 64, 'sha512').toString('hex')
}

export function createSalt () {
  return Crypto.randomBytes(16).toString('hex')
}
