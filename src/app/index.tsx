import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import getStore from './store'
import Routes from './routes'
import * as Actions from './actions'

// Regenerator runtime to handle async/await in browsers.
require('./lib/regenerator-runtime.js')

const store = getStore(undefined)
const session = Actions.getSessionLocalStorage()
if (session) {
  console.log('Restoring session:', session)
  store.dispatch(Actions.setSession(session))
}

render(
  <Provider store={store}>
    <Routes />
  </Provider>,
  document.getElementById('root')
)
