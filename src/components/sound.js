import {Component, PropTypes} from 'react'
import soundBoard from 'sound-board'
const noop = () => {}
const propTypes = {
  src: PropTypes.string,
  onFrequencyChange: PropTypes.func,
  onEnd: PropTypes.func,
  onPlay: PropTypes.func,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  onPause: PropTypes.func,
  autoplay: PropTypes.bool
}
const defaultProps = {
  onFrequencyChange: noop,
  onEnd: noop,
  onPlay: noop,
  onLoad: noop,
  onError: noop,
  onPause: noop
}

class Sound extends Component {
  constructor (props) {
    super(props)

    this.state = {}
    this.onFrequencyChange = this.onFrequencyChange.bind(this)
    this.onAudioPlay = this.onAudioPlay.bind(this)
    this.onAudioEnd = this.onAudioEnd.bind(this)
    this.onAudioPause = this.onAudioPause.bind(this)
    if (props.src) {
      this.downloadSound(props.src, props.autoplay)
    }
  }

  downloadSound (src, autoplay) {
    this.setState({ audioReady: false })
    const isUrl = typeof src === 'string'
    const method = isUrl ? 'downloadSound' : 'loadBuffer'
    this.id = isUrl ? src : +(new Date())
    soundBoard[method](this.id, src)
      .then(() => {
        this.setState({ audioReady: true })
        this.props.onLoad(src)
        if (autoplay) {
          this.play()
        }
      })
      .catch(this.props.onError)
  }

  componentDidUpdate (lastProps) {
    if (lastProps.src !== this.props.src) {
      this.downloadSound(this.props.src)
    }
  }

  soundBoardEvents (method) {
    soundBoard[method]('play', this.onAudioPlay)
    soundBoard[method]('frequencyData', this.onFrequencyChange)
    soundBoard[method]('end', this.onAudioEnd)
    soundBoard[method]('pause', this.onAudioPause)
  }

  componentDidMount () {
    this.soundBoardEvents('on')
  }

  componentWillUnmount () {
    this.soundBoardEvents('off')
  }

  onAudioPlay (src, source) {
    if (src !== this.id) return
    this.setState({
      audioPlaying: true,
      source
    })
    this.props.onPlay(src, source)
  }

  onAudioEnd (src, source) {
    if (src !== this.id) return
    this.setState({
      audioPlaying: false,
      source: null
    })
    this.props.onEnd(src, source)
  }

  onAudioPause (src, source) {
    if (src !== this.id) return
    this.setState({
      audioPlaying: false
    })
    this.props.onPause(src, source)
  }

  onFrequencyChange (src, ...args) {
    if (src !== this.id) return
    this.props.onFrequencyChange(...args)
  }

  isPlaying () {
    return !!this.state.audioPlaying
  }

  play (time) {
    soundBoard.play(this.id, time || this.getCurrentTime())
  }

  pause () {
    if (this.state.audioPlaying) {
      soundBoard.pause(this.id)
    }
  }

  getCurrentTime () {
    try {
      return soundBoard.getCurrentTime(this.id)
    } catch (e) {
      return
    }
  }

  getFullDuration () {
    return soundBoard.localSoundBuffers[this.id].buffer.duration
  }

  render () {
    return null
  }
}

Sound.propTypes = propTypes
Sound.defaultProps = defaultProps

export default Sound
