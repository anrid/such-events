import * as Actions from '../actions'

const defaultState = {
  counter: 0,
  session: null,
}

export default function appReducer (state = defaultState, action) {
  switch (action.type) {
    case Actions.INC_COUNTER:
      return { ...state, counter: state.counter + 1 }

    case Actions.SET_SESSION:
      return { ...state, session: action.payload }

    default:
      return state
  }
}
