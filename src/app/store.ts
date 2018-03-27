import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'

const middleware = [thunk]
let store

export function getCurrentStore () {
  return store
}

export default function configureStore (preloadedState: any | undefined) {
  const state = Object.assign({ }, preloadedState)
  const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose
  store = createStore(rootReducer, state, composeEnhancers(
    applyMiddleware(...middleware)
  ))

  // Enable hot module replacement for reducers
  if (module['hot']) {
    module['hot'].accept('./reducers', () => {
      const nextRootReducer = require('./reducers')
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}

