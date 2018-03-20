import { runService } from '../../lib/service-utils'
import * as H from './handlers'

export const service = runService({
  id: 'user-service-1',
  eventHandlers: {
    'v1.user.create': H.userCreateHandler,
    'v1.user.update': H.userUpdateHandler,
  },
})
.catch(err => console.error(err))
