import * as test from 'tape'
import * as User from './index'
import * as Nats from '../../lib/nats-streaming'

let svc

test('before tests', async t => {
  // Setup service.
  svc = await User.setupServer({ 'client-id': 'test-user1' })
  t.end()
})

test('event: v1.user.create - failed due to missing field test', async t => {
  t.plan(1)

  Nats.publishEvent(svc.stan, {
    source: 'test-user-create',
    event: 'v1.user.create',
    data: {
      name: 'Ace Base',
      emailll: 'ace.base@example.com',
      password: '12345678',
    },
    credentials: null,
  })

  const sub = Nats.subscribeToEvents(svc.stan, {
    source: 'test-user-create',
    queueGroup: null,
    eventHandlers: {
      'v1.user.create.ok': () => t.fail('should fail due to missing "email" field'),
      'v1.user.create.error': e => {
        sub.close()
        t.ok(
          e.data.error.includes('email: string expected'),
          'should get a validation error saying email is missing'
        )
      }
    },
  })
})

test('event: v1.user.create - user created successfully test', async t => {
  t.plan(1)

  Nats.publishEvent(svc.stan, {
    source: 'test-user-create',
    event: 'v1.user.create',
    data: {
      name: 'Ace Base',
      email: 'ace.base@example.com',
      password: '12345678',
    },
    credentials: null,
  })

  Nats.subscribeToEvents(svc.stan, {
    source: 'test-user-create',
    queueGroup: null,
    eventHandlers: {
      'v1.user.create.ok': e => {
        t.equals(e.data.user.email, 'ace.base@example.com', 'should create a user successfully')
      },
      'v1.user.create.error': () => t.fail('should not get a validation error'),
    },
  })
})

test.onFinish(() => {
  svc.close()
})
