import * as Assert from 'assert'
import { google } from 'googleapis'
import {
  endpoint,
  validate,
} from '../../lib/express-utils'
import * as Joi from 'joi'
import { createAccessToken } from '../../lib/jwt'
import { L } from '../../lib/logger'

Assert(process.env.SUCH_EVENTS_GOOGLE_CLIENT_ID, 'Missing env SUCH_EVENTS_GOOGLE_CLIENT_ID')
Assert(process.env.SUCH_EVENTS_GOOGLE_CLIENT_SECRET, 'Missing env SUCH_EVENTS_GOOGLE_CLIENT_SECRET')

function getGoogleOAuthClient () {
  const redirectUrl = `${process.env.SUCH_EVENTS_URL}/google/oauth2callback`
  const OAuth2 = google.auth.OAuth2
  const oauth2Client = new OAuth2(
    process.env.SUCH_EVENTS_GOOGLE_CLIENT_ID,
    process.env.SUCH_EVENTS_GOOGLE_CLIENT_SECRET,
    redirectUrl,
  )
  L.info('Google client id: %s', process.env.SUCH_EVENTS_GOOGLE_CLIENT_ID)
  L.info('Google redirect url: %s', redirectUrl)
  return oauth2Client
}

function getGoogleOAuthUrl (client) {
  const scopes = [
    'email',
    'profile'
  ]

  return client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    // If you only need one scope you can pass it as a string
    scope: scopes,
    // Optional property that passes state parameters to redirect URI
    // state: 'foo'
  })
}

function getUserProfile (client, code: string): Promise<any> {
  return new Promise((resolve, reject) => {
    client.getToken(code, function (err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if (err) {
        L.error('Google getToken error: %s', err.message)
        return reject(new Error('Failed google.getToken(): ' + err.message))
      }
      client.setCredentials(tokens)
      const oauth2 = google.oauth2({
        auth: client,
        version: 'v2',
      })
      oauth2.userinfo.v2.me.get(function(err, res) {
        if (err) {
          L.error('Google get userinfo error: %s', err.message)
          return reject(new Error('Failed google.userinfo.v2.me.get(): ' + err.message))
        }
        L.info('Fetched user profile: %s (%s - %s)', res.data.name, res.data.email, res.data.hd || 'n/a')
        resolve(res.data)
      })
    })
  })
}

export function setupRoutes (app) {
  // Setup Google OAuth related routes.
  app.get('/google/oauth2', endpoint(googleOauth2Handler, { credentials: false }))
  app.get('/google/oauth2callback', endpoint(googleOauth2CallbackHandler, { credentials: false }))
}

const googleOauth2CallbackSchema = Joi.object().keys({
  code: Joi.string().min(10).required(),
})

async function googleOauth2Handler (_req, res) {
  const client = getGoogleOAuthClient()
  const url = getGoogleOAuthUrl(client)
  res.send(`
  <html>
    <body>
      <a href="${url}">Auth URL</a>
    </body>
  </html>
  `)
}

async function googleOauth2CallbackHandler (req, res) {
  const { code } = validate(req.query, googleOauth2CallbackSchema, req)
  const client = getGoogleOAuthClient()
  const profile = await getUserProfile(client, code)
  const token = createAccessToken(profile.id, profile.email)
  res.send({
    profile,
    token,
  })
}
