import * as test from 'tape'
import * as User from './index'
import * as Nats from '../../lib/nats-streaming'
import * as Db from './db'

const source = 'test-user-service'
let svc

test('before tests', async t => {
  // Setup service.
  svc = await User.service
  await Db.init()
  t.end()
})

test('user-service - v1.user.create - failed due to missing field test', async t => {
  t.plan(2)

  const sub1 = Nats.subscribeToEvents(svc.stan, {
    subject: Nats.EVENT_SOURCE_SUBJECT,
    source,
    queueGroup: null,
    eventHandlers: {
      'v1.user.create.ok': async () => t.fail('should fail due to missing "email" field'),
    }
  })

  const sub2 = Nats.subscribeToEvents(svc.stan, {
    subject: Nats.BROADCAST_SUBJECT,
    source,
    queueGroup: null,
    eventHandlers: {
      'v1.error': async e => {
        sub1.unsubscribe()
        sub2.unsubscribe()
        t.equals(e.data.event, 'v1.user.create.error', 'should get error event broadcast "v1.user.create.error"')
        t.ok(
          e.data.error.includes('email: string expected'),
          'should get a validation error saying email is missing'
        )
      }
    },
  })

  Nats.publishEvent(svc.stan, {
    source,
    event: 'v1.user.create',
    data: {
      name: 'Ace Base',
      emailll: 'ace.base@example.com',
      password: '12345678',
    },
    credentials: null,
  })
})

test('user-service - v1.user.create - user created successfully test', async t => {
  t.plan(7)

  Nats.subscribeToEvents(svc.stan, {
    subject: Nats.EVENT_SOURCE_SUBJECT, 
    source,
    queueGroup: null,
    eventHandlers: {
      'v1.user.create.ok': async e => {
        // console.log('e=', e)
        t.equals(e.data.user.email, 'ace.base@example.com', 'should create a user successfully')
        t.equals(e.data.user.password, undefined, 'should not find a "password" prop in the message')
        t.equals(e.data.user.salt, undefined, 'should not find a "salt" prop in the message')
        t.equals(e.data.token, undefined, 'should not find a "token" prop in the message')
      }
    }
  })

  Nats.subscribeToEvents(svc.stan, {
    subject: Nats.BROADCAST_SUBJECT, 
    source,
    queueGroup: null,
    eventHandlers: {
      'v1.broadcast': async e => {
        t.equals(e.data.type, 'v1.user.create.ok', 'should get a broadcast of type "v1.user.create.ok"')
        const d = JSON.parse(e.data.payload)
        t.ok(d.user.id, 'should get a user object in broadcast payload')
        t.ok(d.token, 'should get an access token in broadcast payload')
      },
      'v1.error': async () => t.fail('should not get a validation error'),
    },
  })

  Nats.publishEvent(svc.stan, {
    source,
    event: 'v1.user.create',
    data: {
      name: 'Ace Base',
      email: 'ace.base@example.com',
      password: '12345678',
    },
    credentials: null,
  })
})

test.onFinish(() => {
  svc.close()
  Db.close()
})
