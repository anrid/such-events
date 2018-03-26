import { history } from './history'
import { apiCall } from './api'
import * as T from '../../proto/compiled'

export const INC_COUNTER = 'INC_COUNTER'
export const SET_SESSION = 'SET_SESSION'

const SESSION_KEY = 'such-events-session'

export const inc = () => ({ type: INC_COUNTER, payload: { } })
export const setSession = session => ({ type: SET_SESSION, payload: session })

export const login = (email, password) => 
  async dispatch => {
    const resp = await apiCall('/api/v1/login', { email, password })
    const session = verifyServerPayload(T.v1.UserCreatedOrLoggedInReply, resp.payload)
    console.log({ message: 'login', user: session.user })

    dispatch(setSession(session))
    setSessionLocalStorage(session)  

    history.push('/')
  }

export const signOut = () => async (dispatch, getState) => {
  const user = getState().app.session.user
  console.log({ message: 'sign out', user })

  removeSessionLocalStorage()
  dispatch(setSession(null))

  history.push('/login')
}

export const setSessionLocalStorage = session => 
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))

export const removeSessionLocalStorage = () => 
  window.localStorage.removeItem(SESSION_KEY)

export const getSessionLocalStorage = () => {
  const s = window.localStorage.getItem(SESSION_KEY)
  return s ? JSON.parse(s) : null
}

export function verifyServerPayload (message, data: any) {
  const err = message.verify(data)
  if (err) throw new Error(`Validation error: ${err}`)
  return message.fromObject(data)
}
