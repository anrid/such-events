import * as test from 'tape'
import * as H from './handlers'
import * as P from '../../lib/proto'
import * as T from '../../../proto/compiled'
import { createTestEventMessage } from '../../lib/nats-streaming'

test('notification-service - on v1.user.create.ok test', async t => {
  t.plan(5)

  const event = createTestEventMessage({
    data: P.create(T.v1.UserCreateOk, {
      user: {
        id: 'user1',
        name: 'Ace Base',
        email: 'ace@base.se',
      },
    })
  })

  await H.userCreatedOkHandler(event, (publishedEvent: string, data) => {
    t.doesNotThrow(() => P.create(T.v1.NotificationCreateOk, data))
    const n = data.notification
    t.equals(publishedEvent, 'v1.notification.create.ok', 'should emit event v1.notification.create.ok')
    t.equals(n.from, 'user1', 'should create a notification from user1')
    t.ok(n.message.includes('User created'), 'should have a message saying "User created"')
    t.equals(JSON.parse(n.metadata).user.email, 'ace@base.se', 'should have metadata.user.email = "ace@base.se"')
  })
})
