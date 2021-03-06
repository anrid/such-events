import * as Assert from 'assert'
import * as Fs from 'fs'
import * as Jwt from 'jsonwebtoken'
import { L } from './logger'

Assert(process.env.SUCH_EVENTS_TLS_PRIVKEY, 'Missing env SUCH_EVENTS_TLS_PRIVKEY')
Assert(process.env.SUCH_EVENTS_TLS_PUBKEY, 'Missing env SUCH_EVENTS_TLS_PUBKEY')

const PRIVKEY = Fs.readFileSync(process.env.SUCH_EVENTS_TLS_PRIVKEY)
const PUBKEY = Fs.readFileSync(process.env.SUCH_EVENTS_TLS_PUBKEY)

export function createAccessToken (id: string, email: string) {
  // Sign with RSA SHA256
  return Jwt.sign({ id, email }, PRIVKEY, { algorithm: 'RS256', expiresIn: '30d' })
}

export function verifyAccessToken (token: string) {
  // Verify with RSA SHA256 using the public key extracted from the private key.
  return Jwt.verify(token, PUBKEY, { algorithm: 'RS256' })
}

export function jwtMiddleware (req, res, next) {
  var queryKey = 'access_token'
  var bodyKey = 'access_token'
  var headerKey = 'Bearer'

  let token, error

  if (req.query && req.query[queryKey]) {
    token = req.query[queryKey]
  }

  if (req.body && req.body[bodyKey]) {
    if (token) error = true
    token = req.body[bodyKey]
  }

  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ')
    if (parts.length === 2 && parts[0] === headerKey) {
      if (token) error = true
      token = parts[1]
    }
  }

  // RFC6750 states the access_token MUST NOT be provided
  // in more than one place in a single request.
  if (error) {
    return res.status(400).json({ error: 'RFC6750 access_token found in more than one place in a single request' })
  }

  try {
    if (token) {
      const credentials = verifyAccessToken(token)
      // L.info({ message: 'JWT middleware parsed token', credentials })
      req['credentials'] = credentials
    }
    next()
  } catch (err) {
    L.error({ message: 'JWT middleware error', token, error: err.message })
    return res.status(400).json({ error: 'invalid token: ' + err.message })
  }
}
