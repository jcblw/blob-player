import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as playerActions from '../actions/player'

import Stage from './stage'
import Sound from './sound'
import Blob from './blob'
import PlayButton from './play-button'
import TWEEN from 'tween.js'
import mapSegments from '../map-segments'

const propTypes = {
  audioReady: PropTypes.bool,
  bgColor: PropTypes.string,
  className: PropTypes.string,
  currentFreq: PropTypes.number,
  currentTime: PropTypes.number,
  duration: PropTypes.number,
  height: PropTypes.number,
  isEnd: PropTypes.bool,
  playBgColor: PropTypes.string,
  playIconColor: PropTypes.string,
  progressColor: PropTypes.string,
  setAudioCurrentTime: PropTypes.func,
  setAudioFrequecy: PropTypes.func,
  setAudioReady: PropTypes.func,
  setDuration: PropTypes.func,
  setEnd: PropTypes.func,
  setWasPlaying: PropTypes.func,
  src: PropTypes.any,
  trackBarColor: PropTypes.string,
  wasPlaying: PropTypes.bool,
  width: PropTypes.number,
  onEnd: PropTypes.func
}
const defaultProps = {
  bgColor: '#222',
  height: 150,
  playBgColor: 'white',
  playIconColor: '#ddd',
  progressColor: 'tomato',
  trackBarColor: '#666',
  width: 150,
  blobSize: 100
}

const startStopped = true

class Player extends Component {
  constructor () {
    super()
    this.onChange = this.onChange.bind(this)
    this.onFrequencyChange = this.onFrequencyChange.bind(this)
    this.onLoad = this.onLoad.bind(this)
    this.onSetScrubberTime = this.onSetScrubberTime.bind(this)
    this.onScrubberDragged = this.onScrubberDragged.bind(this)
    this._isMounted = true
  }

  onLoad () {
    const {
      setAudioReady,
      setDuration,
      setEnd,
      setAudioCurrentTime
    } = this.props
    setEnd(false)
    setAudioReady(true)
    setDuration(this.sound.getFullDuration())
    setAudioCurrentTime(0)
    this.sound.play()
  }

  onFrequencyChange (bufferLength, dataArray) {
    // change level here
    let max = 0
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      max = Math.max(v, max)
    }

    const {setAudioFrequecy, setAudioCurrentTime, setDuration} = this.props
    setAudioFrequecy(max - 1)
    setAudioCurrentTime(this.sound.getCurrentTime())
    setDuration(this.sound.getFullDuration())
  }

  onChange () {
    if (!this.sound || !this.props.audioReady) return
    if (!this.sound.isPlaying()) {
      this.sound.play()
    } else {
      this.sound.pause()
    }
  }

  pause () {
    if (!this.sound) return
    this.sound.pause()
  }

  play () {
    if (!this.sound) return
    this.sound.play()
  }

  componentWillUpdate ({src}) {
    const {
      setEnd,
      setAudioReady,
      setDuration,
      src: lastSrc,
      setWasPlaying
    } = this.props
    if (lastSrc === src || !lastSrc) return
    setWasPlaying(this.sound && this.sound.isPlaying())
    this.sound.pause()
    setEnd(true)
    setAudioReady(false)
    setDuration(0)
  }

  onSetScrubberTime (time) {
    // set time
    const {setAudioCurrentTime, wasPlaying, setWasPlaying} = this.props
    if (!setAudioCurrentTime) return
    setAudioCurrentTime(time)
    if (wasPlaying) {
      this.sound.pause()
      setWasPlaying(false)
      return this.sound.play(time)
    }
    this.sound.setCurrentTime(time)
  }

  onScrubberDragged () {
    const {setWasPlaying} = this.props
    setWasPlaying(this.sound && this.sound.isPlaying())
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  isPlaying () {
    return this.sound && this.sound.isPlaying()
  }

  render () {
    const {
      bgColor,
      playIconColor,
      playBgColor,
      trackBarColor,
      progressColor,
      src,
      setEnd,
      currentFreq,
      currentTime,
      duration,
      isEnd,
      width,
      height,
      className,
      onEnd,
      blobSize
    } = this.props

    const isPlaying = this.isPlaying()
    const scrubberSize = blobSize / 5
    return (
      <div className={className}>
        {src
          ? (
              <Sound
                ref={i => { this.sound = i }}
                src={src}
                onFrequencyChange={this.onFrequencyChange}
                onLoad={this.onLoad}
                onEnd={() => onEnd()}
                onPlay={() => setEnd(false)}
              />
            )
          : null
        }
        <Stage
          key={`${width}-${height}`}
          width={width}
          height={height}
          onDraw={(_, ...args) => {
            if (!this._isMounted) return
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
            radius={blobSize}
            animationDuration={1000}
            stoppedRadius={blobSize - 10}
            spread={currentFreq ? (currentFreq * 6) + 6 : 6}
            scrubberRadius={currentFreq ? (currentFreq * 5) + scrubberSize : scrubberSize}
            currentTime={isEnd ? 0 : currentTime}
            duration={isEnd ? 0 : duration}
            segmentAmount={1080 * 2}
            onClick={this.onChange}
            isPlaying={isPlaying}
            onSetScrubberTime={this.onSetScrubberTime}
            onScrubberDragged={this.onScrubberDragged}
            onStopSound={() => this.sound.pause()}
          />
          <PlayButton
            color={playIconColor}
            isPlaying={isPlaying}
            size={blobSize / 2}
          />
        </Stage>
      </div>
    )
  }
}

Player.propTypes = propTypes
Player.defaultProps = defaultProps

function mapStateToProps ({player}) {
  return player
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(playerActions, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true }
)(Player)
