import * as test from 'tape'
import * as H from './handlers'
import * as P from '../../lib/proto'
import * as T from '../../../proto/compiled'
import * as Db from './db'
import { createTestEventMessage } from '../../lib/nats-streaming'

let testSession: any = { }

test('user-service - before tests', async t => {
  await Db.init()
  t.end()
})

test('user-service - on v1.user.create test', async t => {
  t.plan(6)

  const event = createTestEventMessage({
    data: P.create(T.v1.UserCreate, {
      name: 'Ace Base',
      email: 'ace@base.se',
      password: '123456',
    })
  })

  await H.userCreateHandler(event, (publishedEvent: string, data) => {
    if (publishedEvent === 'v1.user.create.ok') {
      t.doesNotThrow(() => P.create(T.v1.UserCreateOk, data))
      t.equals(data.user.name, 'Ace Base', 'should have user.name = "Ace Base"')
      t.ok(data.user.id, 'should have a new user id')
      testSession.aceBase = data.user
    }
    if (publishedEvent === 'v1.broadcast') {
      const p = JSON.parse(data.payload)
      t.doesNotThrow(() => P.create(T.v1.UserCreatedOrLoggedInReply, p))
      t.equals(p.user.email, 'ace@base.se', 'should have user.email = "ace@base.se"')
      t.ok(p.token.length > 40, 'should have a token that’s longer than 40 chars')
    }
  })
})

test('user-service - on v1.user.login test', async t => {
  t.plan(6)

  const event = createTestEventMessage({
    data: P.create(T.v1.UserLogin, {
      email: 'ace@base.se',
      password: '123456',
    })
  })

  await H.userLoginHandler(event, (publishedEvent: string, data) => {
    if (publishedEvent === 'v1.user.login.ok') {
      t.doesNotThrow(() => P.create(T.v1.UserLoginOk, data))
      t.equals(data.user.name, 'Ace Base', 'should have user.name = "Ace Base"')
      t.ok(data.user.id, 'should have a new user id')
    }
    if (publishedEvent === 'v1.broadcast') {
      const p = JSON.parse(data.payload)
      t.doesNotThrow(() => P.create(T.v1.UserCreatedOrLoggedInReply, p))
      t.equals(p.user.email, 'ace@base.se', 'should have user.email = "ace@base.se"')
      t.ok(p.token.length > 40, 'should have a token that’s longer than 40 chars')
    }
  })
})

test('user-service - on v1.user.update test', async t => {
  t.plan(5)

  const event = createTestEventMessage({
    data: P.create(T.v1.UserUpdate, {
      update: { email: 'acee@base.see' },
      credentials: {
        id: testSession.aceBase.id,
        email: testSession.aceBase.email,
      },
    })
  })

  await H.userUpdateHandler(event, (publishedEvent: string, data) => {
    if (publishedEvent === 'v1.user.update.ok') {
      t.doesNotThrow(() => P.create(T.v1.UserUpdateOk, data))
      t.equals(data.update.email, 'acee@base.see', 'should now have user.email = "acee@base.see"')
      t.equals(data.userId, testSession.aceBase.id, 'should return the userId of the updated user')
    }
    if (publishedEvent === 'v1.broadcast') {
      const p = JSON.parse(data.payload)
      t.doesNotThrow(() => P.create(T.v1.UserUpdateOk, p))
      t.equals(p.userId, testSession.aceBase.id, 'should return the userId of the updated user as part of broadcast')
    }
  })
})

test.onFinish(() => Db.close())
