
export const setDuration = duration => {
  return {
    type: 'SET_DURATION',
    duration
  }
}

export const setAudioReady = isReady => {
  return {
    type: 'SET_AUDIO_READY',
    isReady
  }
}

export const setEnd = isEnd => {
  return {
    type: 'SET_END',
    isEnd
  }
}

export const setAudioFrequecy = frequency => {
  return {
    type: 'SET_AUDIO_FREQUENCY',
    frequency
  }
}

export const setAudioCurrentTime = time => {
  return {
    type: 'SET_AUDIO_TIME',
    time
  }
}

export const setWasPlaying = wasPlaying => {
  return {
    type: 'SET_WAS_PLAYING',
    wasPlaying
  }
}

export const setFullScreen = isFullScreen => ({
  type: 'SET_FULLSCREEN',
  isFullScreen
})
