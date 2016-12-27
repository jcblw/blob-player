import {css} from 'glamor'
import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as playerActions from '../actions/player'
import {toReadableTime} from '../utilities/format'
import Stage from './stage'
import Sound from './sound'
import Blob from './blob'
import PlayButton from './play-button'
import TWEEN from 'tween.js'
import mapSegments from '../map-segments'

const propTypes = {
  audioReady: PropTypes.bool,
  bgColor: PropTypes.string,
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
  width: PropTypes.number
}
const defaultProps = {
  bgColor: '#222',
  height: 150,
  playBgColor: 'white',
  playIconColor: '#ddd',
  progressColor: 'tomato',
  trackBarColor: '#666',
  width: 150
}

const normalizeContainer = css({
  position: 'relative'
})

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
      setAudioCurrentTime,
      wasPlaying
    } = this.props
    setEnd(false)
    setAudioReady(true)
    setDuration(this.sound.getFullDuration())
    setAudioCurrentTime(0)
    if (wasPlaying) { // might want to switch this to autoplay
      this.sound.play()
    }
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
    this.sound.pause()
    setAudioCurrentTime(time)
    if (wasPlaying) {
      setWasPlaying(false)
      this.sound.play(time)
    }
  }

  onScrubberDragged () {
    const {setWasPlaying} = this.props
    setWasPlaying(this.sound && this.sound.isPlaying())
  }

  componentWillUnmount () {
    this._isMounted = false
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
      isEnd
    } = this.props

    const isPlaying = this.sound && this.sound.isPlaying()
    return (
      <div>
        {src
          ? (
              <Sound
                ref={i => { this.sound = i }}
                src={src}
                onFrequencyChange={this.onFrequencyChange}
                onLoad={this.onLoad}
                onEnd={() => setEnd(true)}
                onPlay={() => setEnd(false)}
              />
            )
          : null
        }
        <Stage
          width={window.innerWidth}
          height={150}
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
            onScrubberDragged={this.onScrubberDragged}
            onStopSound={() => this.sound.pause()}
          />
          <PlayButton
            color={playIconColor}
            isPlaying={isPlaying}
            size={25}
          />
        </Stage>
        <div className={normalizeContainer}>
          <div>{toReadableTime(duration - currentTime)}</div>
        </div>
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
  mapDispatchToProps
)(Player)
