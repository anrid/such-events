import {
  endpoint,
  validate,
} from '../../lib/express-utils'
import * as Joi from 'joi'
import * as TwAuth from '../../lib/tw-auth'

export function setupRoutes (app) {
  // Setup Google OAuth related routes.
  app.get('/tw/login', endpoint(loginPage, { credentials: false }))
  app.post('/tw/login', endpoint(login, { credentials: false }))
}

const loginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

async function loginPage (_req, res) {
  res.send(`
  <html>
    <head>
      <style>
        label {
          display: inline-block;
          min-width: 100px;
        }
        input {
          height: 30px;
          margin-bottom: 10px; 
        }
      </style>
    </head>
    <body>
      <form method="post" action="/tw/login">
        <div>
          <label for="email">Email:</label>
          <input type="email" name="email" value="anri@taskworld.com" />
        </div> 
        <div>
          <label for="email">Password:</label>
          <input type="password" name="password" />
        </div>
        <div>
          <button>Login</login>
        </div>
      </form>
    </body>
  </html>
  `)
}

async function login (req, res) {
  const { email, password } = validate(req.body, loginSchema, req)
  const accessToken = await TwAuth.login(req.db, email, password)
  res.send({ accessToken })
}
