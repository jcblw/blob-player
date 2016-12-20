import {style, merge} from 'glamor'
import React, {Component} from 'react'
import Stage from './stage'
import Sound from './sound'
import Blob from './blob'
import PlayButton from './play-button'
import TWEEN from 'tween.js'
import mapSegments from '../map-segments'
const PLAYER_BG_COLOR = '#82ccc8'
const TRACK_COLOR = '#5b8f8c'
const PLAY_BUTTON_BG = '#fff'
const PLAY_BUTTON_COLOR = '#ddd'
const PROGRESS_COLOR = '#f47d30'

const rel = style({
  position: 'relative'
})
const expand = style({
  position: 'absolute',
  top: 0,
  left: 0
})
const overlay = merge(
  expand,
  style({
    zIndex: 2
  })
)
const timeText = style({
  position: 'absolute',
  top: '70vh',
  fontSize: '15px',
  left: '0',
  fontFamily: 'helvetica',
  color: '#fff',
  textAlign: 'center',
  width: '100vw'
})
const convertSecondsToReadableTime = (sec = 0) => {
  sec = isNaN(sec) ? 0 : sec
  const minutes = `0${Math.floor(sec / 60)}`.slice(-2)
  const seconds = `0${Math.floor(sec - (minutes * 60))}`.slice(-2)
  return `${minutes}:${seconds}`
}
const normalizeContainer = style({
  position: 'relative'
})

const startStopped = true

class Layout extends Component {
  constructor () {
    super()
    this.state = {
      currentFreq: 0,
      currentTime: 0,
      isEnd: true
    }
    this.onChange = this.onChange.bind(this)
    this.onFrequencyChange = this.onFrequencyChange.bind(this)
    this.onLoad = this.onLoad.bind(this)
    this.onSetScrubberTime = this.onSetScrubberTime.bind(this)
  }

  onLoad () {
    this.setState({
      audioReady: true,
      duration: this.sound.getFullDuration()
    })
  }

  onFrequencyChange (bufferLength, dataArray) {
    // change level here
    let max = 0
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      max = Math.max(v, max)
    }
    this.setState({
      currentFreq: max - 1,
      currentTime: this.sound.getCurrentTime(),
      duration: this.sound.getFullDuration()
    })
  }

  onChange () {
    if (!this.sound || !this.state.audioReady) return
    if (!this.sound.isPlaying()) {
      this.sound.play()
    } else {
      this.sound.pause()
    }
  }

  onSetScrubberTime (time) {
    // set time
    this.sound.pause()
    this.setState({currentTime: time})
    this.sound.play(time)
  }

  render () {
    const {currentFreq, currentTime, duration, isEnd} = this.state
    const isPlaying = this.sound && this.sound.isPlaying()
    return (
      <div className={rel}>
        <Sound
          ref={i => { this.sound = i }}
          src='./src/ghost.mp3'
          onFrequencyChange={this.onFrequencyChange}
          onLoad={this.onLoad}
          onEnd={() => this.setState({isEnd: true})}
          onPlay={() => this.setState({isEnd: false})}
        />
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onDraw={(_, ...args) => {
            TWEEN.update(...args)
            this.forceUpdate()
          }}
          fps={30}
          backgroundColor={PLAYER_BG_COLOR}
        >
          <Blob
            getInstance={b => this.blob = b}
            color={PLAY_BUTTON_BG}
            trackColor={TRACK_COLOR}
            progressColor={PROGRESS_COLOR}
            mapSegments={mapSegments}
            defaultStoppedState={startStopped}
            radius={100}
            animationDuration={1000}
            stoppedRadius={95}
            spread={currentFreq ? (currentFreq * 3) + 3 : 3}
            scrubberRadius={currentFreq ? (currentFreq * 2) + 20 : 20}
            currentTime={isEnd ? 0 : currentTime}
            duration={isEnd ? 0 : duration}
            segmentAmount={1080 * 2}
            onClick={this.onChange}
            isPlaying={isPlaying}
            onSetScrubberTime={this.onSetScrubberTime}
            onStopSound={() => this.sound.pause()}
          />
          <PlayButton
            color={PLAY_BUTTON_COLOR}
            isPlaying={isPlaying}
            size={45}
          />
        </Stage>
        <div className={overlay}>
          <div className={normalizeContainer}>
            <div className={timeText}>{convertSecondsToReadableTime(duration - currentTime)}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default Layout
