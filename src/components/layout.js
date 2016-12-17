import {style, merge} from 'glamor'
import React, {Component} from 'react'
import Stage from './stage'
import Sound from './sound'
import Blob from './blob'
import TWEEN from 'tween.js'
import mapSegments from '../map-segments'

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
  top: '75vh',
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
      currentTime: 0
    }
    this.onChange = this.onChange.bind(this)
    this.onFrequencyChange = this.onFrequencyChange.bind(this)
    this.onLoad = this.onLoad.bind(this)
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

  render () {
    const {currentFreq, currentTime, duration} = this.state
    return (
      <div className={rel}>
        <Sound
          ref={i => { this.sound = i }}
          src='./src/ghost.mp3'
          onFrequencyChange={this.onFrequencyChange}
          onLoad={this.onLoad}
          onEnd={() => this.blob.stop(1000, 1)}
          onPlay={() => this.blob.start(1000)}
          onPause={() => this.blob.stop(1000, 75)}
        />
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onDraw={(_, ...args) => {
            TWEEN.update(...args)
            this.forceUpdate()
          }}
          fps={30}
          backgroundColor='#82ccc8'
        >
          <Blob
            getInstance={b => {
              // cant use ref here
              this.blob = b
            }}
            color='white'
            mapSegments={mapSegments}
            defaultStoppedState={startStopped}
            radius={100}
            spread={currentFreq ? (currentFreq * 5) + 3 : 3}
            scrubberRadius={currentFreq ? (currentFreq * 5) + 20 : 20}
            currentTime={currentTime}
            duration={duration}
            segmentAmount={1080 * 2}
            onClick={this.onChange}
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
