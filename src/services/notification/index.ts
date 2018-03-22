import { runService } from '../../lib/service-utils'
import * as H from './handlers'

export const service = runService({
  id: 'notification-service-1',
  eventHandlers: {
    'v1.user.create.ok': H.userCreatedOkHandler,
  },
})
.catch(err => console.error(err))
