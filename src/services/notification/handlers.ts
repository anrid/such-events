import { generate } from 'shortid'
import * as P from '../../lib/proto'

const NOTIFICATIONS = []

const notificationType = P.load('notification.proto')
const userType = P.load('user.proto')

export async function userCreatedOkHandler (e, publisher) {
  P.validate(userType, 'tw.CreateUserOk', e.data)

  const user = e.data.user
  const notification = {
    id: generate(),
    from: user.id,
    to: 'system',
    message: 'User created successfully',
    metadata: JSON.stringify({ user }),
  }
  NOTIFICATIONS.push(notification)
  
  const out = P.create(notificationType, 'tw.CreateNotificationOk', { notification })

  publisher('v1.notification.create.ok', out)
}
