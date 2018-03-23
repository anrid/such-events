import * as test from 'tape'
import * as request from 'supertest'
import * as Server from './index'
import * as Echo from '../echo'
import * as Boom from 'boom'

let server
let echo

test('before tests', async t => {
  // Setup server.
  server = await Server.setupServer({ id: 'test-api-gateway-1' })
  // Setup echo responder.
  echo = await Echo.service
  t.end()
})

test('GET / test', async t => {
  t.plan(1)
  
  const res = await request(server.app)
  .get('/')

  t.equals(res.statusCode, 200, 'should get 200 OK')
})

test('POST /api/v1/echo', async t => {
  t.plan(3)
  
  const res = await request(server.app)
  .post('/api/v1/echo')
  .accept('json')
  .send({ ok: 1 })

  t.equals(res.body.type, 'v1.echo.ok', 'should get body.type = "v1.echo.ok"')
  t.equals(res.body.payload.ok, 1, 'should get body.payload.ok = 1')
  t.equals(res.statusCode, 200, 'should get 200 OK')
})

test('GET /bad', async t => {
  t.plan(1)
  
  const res = await request(server.app)
  .get('/bad')
  .accept('json')

  t.equals(res.statusCode, Boom.notFound().output.statusCode, 'should get not found error')
})

test('GET /api/v1/unimplemented', async t => {
  t.plan(1)
  
  const res = await request(server.app)
  .get('/api/v1/unimplemented')
  .accept('json')

  t.equals(res.statusCode, Boom.badRequest().output.statusCode, 'should get bad request error')
})

test('POST /api/v1/slow - timeout', async t => {
  t.plan(2)
  
  const res = await request(server.app)
  .post('/api/v1/slow')
  .accept('json')
  .send({ email: 'ace@base.se', password: '12345678' })

  t.ok(/Request .*? timed out/.test(res.body.message), 'should get "Request XXX timed out" error message')
  t.equals(res.statusCode, Boom.gatewayTimeout().output.statusCode, 'should get gateway timeout error')
})

test.onFinish(() => {
  server.close()
  echo.close()
})
