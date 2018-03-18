import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'

export default function getStore (initialState: any | undefined) {
  const state = Object.assign({ }, initialState)
  const store = createStore(rootReducer, state, applyMiddleware(thunk))
  return store
}
