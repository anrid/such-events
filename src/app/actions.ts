import { history } from './history'

export const INC_COUNTER = 'INC_COUNTER'
export const SET_SESSION = 'SET_SESSION'

export const inc = () => ({ type: INC_COUNTER, payload: { } })

export const login = (email, password) => 
  async (dispatch, getState) => {
    console.log('LOGIN ACTION!')
    dispatch({
      type: SET_SESSION,
      payload: {
        user: { id: 1, email, name: 'Joe' },
        token: 'test',
      }
    })
    console.log('STATE:', getState())
    history.push('/')
  }
