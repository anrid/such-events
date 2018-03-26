import { history } from './history'
import { apiCall } from './api'

export const INC_COUNTER = 'INC_COUNTER'
export const SET_SESSION = 'SET_SESSION'

const SESSION_KEY = 'such-events-session'

export const inc = () => ({ type: INC_COUNTER, payload: { } })
export const setSession = session => ({ type: SET_SESSION, payload: session })

export const login = (email, _password) => 
  async (dispatch, getState) => {
    const session = { user: { id: 1, email, name: 'Joe' }, token: 'test' }
    
    dispatch(setSession(session))
    console.log('STATE:', getState())

    await apiCall('/api/v1/echo', { test: 1 })
    
    setSessionLocalStorage(session)  
    
    history.push('/')
  }

export const setSessionLocalStorage = session => 
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))

export const getSessionLocalStorage = () => {
  const s = window.localStorage.getItem(SESSION_KEY)
  return s ? JSON.parse(s) : null
}
