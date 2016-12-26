import {css} from 'glamor'
import React, {Component, PropTypes} from 'react'
import Stage from './stage'
import Sound from './sound'
import Blob from './blob'
import PlayButton from './play-button'
import TWEEN from 'tween.js'
import mapSegments from '../map-segments'

const propTypes = {
  bgColor: PropTypes.string,
  playIconColor: PropTypes.string,
  playBgColor: PropTypes.string,
  trackBarColor: PropTypes.string,
  progressColor: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  src: PropTypes.oneOf([
    PropTypes.string,
    PropTypes.object
  ])
}
const defaultProps = {
  bgColor: '#222',
  playIconColor: '#ddd',
  playBgColor: 'white',
  trackBarColor: '#666',
  progressColor: 'tomato',
  height: 150,
  width: 150
}

const convertSecondsToReadableTime = (sec = 0) => {
  sec = isNaN(sec) ? 0 : sec
  const minutes = `0${Math.floor(sec / 60)}`.slice(-2)
  const seconds = `0${Math.floor(sec - (minutes * 60))}`.slice(-2)
  return `${minutes}:${seconds}`
}
const normalizeContainer = css({
  position: 'relative'
})

const startStopped = true

class Player extends Component {
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
    const {
      bgColor,
      playIconColor,
      playBgColor,
      trackBarColor,
      progressColor,
      src
    } = this.props
    const {
      currentFreq,
      currentTime,
      duration,
      isEnd
    } = this.state
    const isPlaying = this.sound && this.sound.isPlaying()
    return (
      <div>
        <div className={normalizeContainer}>
          <div>{convertSecondsToReadableTime(duration - currentTime)}</div>
        </div>
        {src
          ? (
              <Sound
                ref={i => { this.sound = i }}
                src={src}
                onFrequencyChange={this.onFrequencyChange}
                onLoad={this.onLoad}
                onEnd={() => this.setState({isEnd: true})}
                onPlay={() => this.setState({isEnd: false})}
              />
            )
          : null
        }
        <Stage
          width={window.innerWidth}
          height={150}
          onDraw={(_, ...args) => {
            TWEEN.update(...args)
            this.forceUpdate()
          }}
          fps={30}
          backgroundColor={bgColor}
        >
          <Blob
            getInstance={b => this.blob = b}
            color={playBgColor}
            trackColor={trackBarColor}
            progressColor={progressColor}
            mapSegments={mapSegments}
            defaultStoppedState={startStopped}
            radius={50}
            animationDuration={1000}
            stoppedRadius={45}
            spread={currentFreq ? (currentFreq * 3) + 3 : 3}
            scrubberRadius={currentFreq ? (currentFreq * 2) + 10 : 10}
            currentTime={isEnd ? 0 : currentTime}
            duration={isEnd ? 0 : duration}
            segmentAmount={1080 * 2}
            onClick={this.onChange}
            isPlaying={isPlaying}
            onSetScrubberTime={this.onSetScrubberTime}
            onStopSound={() => this.sound.pause()}
          />
          <PlayButton
            color={playIconColor}
            isPlaying={isPlaying}
            size={25}
          />
        </Stage>
      </div>
    )
  }
}

Player.propTypes = propTypes
Player.defaultProps = defaultProps

export default Player
