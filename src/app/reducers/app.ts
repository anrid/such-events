import * as Actions from '../actions'

const defaultState = {
  counter: 0,
}

export default function appReducer (state = defaultState, action) {
  switch (action.type) {
    case Actions.INC_COUNTER:
      return { ...state, counter: state.counter + 1 }

    default:
      return state
  }
}
