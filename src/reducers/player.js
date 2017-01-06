
import {combineReducers} from 'redux'

const duration = (state = 0, action) => {
  if (action.type === 'SET_DURATION') {
    return action.duration
  }
  return state
}

const audioReady = (state = false, action) => {
  if (action.type === 'SET_AUDIO_READY') {
    return action.isReady
  }
  return state
}

const currentFreq = (state = 0, action) => {
  if (action.type === 'SET_AUDIO_FREQUENCY') {
    return action.frequency
  }
  return state
}

const currentTime = (state = 0, action) => {
  if (action.type === 'SET_AUDIO_TIME') {
    return action.time
  }
  return state
}

const isEnd = (state = true, action) => {
  if (action.type === 'SET_END') {
    return action.isEnd
  }
  return state
}

const wasPlaying = (state = false, action) => {
  if (action.type === 'SET_WAS_PLAYING') {
    return action.wasPlaying
  }
  return state
}

const isFullScreen = (state = false, action) => {
  if (action.type === 'SET_FULLSCREEN') {
    return action.isFullScreen
  }
  return state
}

export default combineReducers({
  audioReady,
  currentFreq,
  currentTime,
  duration,
  isFullScreen,
  isEnd,
  wasPlaying
})
