import { runService } from '../../lib/service-utils'
import * as H from './handlers'

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection at:', reason)
})

export const service = runService({
  id: 'notification-service-1',
  name: 'notification-service-sub',
  eventHandlers: {
    'v1.user.create.ok': H.userCreatedOkHandler,
  },
})
