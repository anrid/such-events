import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import getStore from './store'
import Routes from './routes'

const store = getStore(undefined)

render(
  <Provider store={store}>
    <Routes />
  </Provider>,
  document.getElementById('root')
)
