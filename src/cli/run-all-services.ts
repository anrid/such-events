import * as ApiGatewaySvc from '../services/api-gateway'
// import * as User from '../services/user'
// import * as Noti from '../services/notification'
// import * as Echo from '../services/echo'

run().catch(err => console.error(err))

async function run () {
  const api = await ApiGatewaySvc.setupServer({ id: 'api-gateway-1', port: 10000 })
  // await User.service
  // await Noti.service
  // await Echo.service
  await api.isReady
  console.log('All services are a go.')
}
