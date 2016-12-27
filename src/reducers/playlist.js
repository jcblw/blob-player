
import {combineReducers} from 'redux'

const currentTrack = (state = null, action) => {
  if (action.type === 'SET_CURRENT_TRACK') {
    return action.track
  }
  return state
}

export default combineReducers({
  currentTrack
})
