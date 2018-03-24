import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'

let store

export function getCurrentStore () {
  return store
}

export default function getStore (initialState: any | undefined) {
  const state = Object.assign({ }, initialState)
  store = createStore(rootReducer, state, applyMiddleware(thunk))
  return store
}

