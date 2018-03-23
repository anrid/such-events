import { runService } from '../../lib/service-utils'
import * as P from '../../lib/proto'
import * as T from '../../../proto/compiled'

export const service = runService({
  id: 'echo-service-1',
  eventHandlers: {
    'v1.echo.create': echoHandler,
    'v1.echo-secret.create': echoSecretHandler,
  },
})
.catch(err => console.error(err))

async function echoHandler (e, publisher) {
  const payload = JSON.stringify(e.data)
  const out = P.create(T.v1.Broadcast, { type: 'v1.echo.ok', payload })
  publisher('v1.broadcast', out)
}

async function echoSecretHandler (e, publisher) {
  if (!e.credentials) throw new Error('Missing credentials')
  const payload = JSON.stringify(Object.assign({ }, e.data, { email: e.credentials.email }))
  const out = P.create(T.v1.Broadcast, { type: 'v1.echo-secret.ok', payload })
  publisher('v1.broadcast', out)
}
