import { runService } from '../../lib/service-utils'
import * as H from './handlers'

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection at:', reason)
})

export const service = runService({
  id: 'user-service-1',
  name: 'user-service-sub',
  eventHandlers: {
    'v1.user.create': H.userCreateHandler,
    'v1.user.update': H.userUpdateHandler,
    'v1.user.login': H.userLoginHandler,
  },
})
