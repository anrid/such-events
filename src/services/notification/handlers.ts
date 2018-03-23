import { generate } from 'shortid'
import * as P from '../../lib/proto'
import * as T from '../../../proto/compiled'

const NOTIFICATIONS = []

export async function userCreatedOkHandler (e, publisher) {
  const m = P.create(T.v1.UserCreateOk, e.data)

  const notification = {
    id: generate(),
    from: m.user.id,
    to: 'system',
    message: 'User created successfully',
    metadata: JSON.stringify({ user: m.user }),
  }
  NOTIFICATIONS.push(notification)
  
  const out = P.create(T.v1.NotificationCreateOk, { notification })
  publisher('v1.notification.create.ok', out)
}
