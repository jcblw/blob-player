
import {Component, PropTypes} from 'react'

const propTypes = {
  color: PropTypes.string,
  canvas: PropTypes.object,
  size: PropTypes.number,
  isPlaying: PropTypes.bool
}
const defaultProps = {
  color: 'white',
  size: 50,
  isPlaying: false
}

class PlayButton extends Component {
  constructor (props) {
    super()
  }

  componentDidUpdate () {
    if (!this.props.canvas || this._context) return
    const {canvas} = this.props
    const width = canvas.width
    const height = canvas.height
    this._context = canvas.getContext('2d')
    this.iteration = 0
    this.center = [
      width / 2,
      height / 2
    ]
  }

  doesPointCollide ([x, y]) {
    return false
  }

  draw () {
    const {
      canvas,
      color,
      size,
      isPlaying
    } = this.props
    if (!canvas) return
    const context = canvas.getContext('2d')
    const offset = size / 2
    const o2 = offset * 0.3
    const o3 = offset * 1.2

    if (isPlaying) {
      const colwidth = offset - o2
      context.beginPath()
      context.translate(0, 0)
      context.scale(1, 1)
      // need to seperate into two columns
      context.moveTo(this.center[0] - (offset), this.center[1] - o3)
      context.lineTo(this.center[0] - (offset - colwidth), this.center[1] - o3)
      context.lineTo(this.center[0] - (offset - colwidth), this.center[1] + o3)
      context.lineTo(this.center[0] - (offset), this.center[1] + o3)
      context.lineJoin = 'round'
      context.lineCap = 'round'
      context.fillStyle = color
      context.shadowColor = 'rgba(0,0,0,0)'
      context.shadowBlur = 0
      context.fill()
      context.closePath()

      //
      context.beginPath()
      context.translate(0, 0)
      context.scale(1, 1)
      // need to seperate into two columns
      context.moveTo(this.center[0] + (offset), this.center[1] - o3)
      context.lineTo(this.center[0] + (offset - colwidth), this.center[1] - o3)
      context.lineTo(this.center[0] + (offset - colwidth), this.center[1] + o3)
      context.lineTo(this.center[0] + (offset), this.center[1] + o3)
      context.lineJoin = 'round'
      context.lineCap = 'round'
      context.fillStyle = color
      context.shadowColor = 'rgba(0,0,0,0)'
      context.shadowBlur = 0
      context.fill()
      context.closePath()
    } else {
      context.beginPath()
      context.translate(0, 0)
      context.scale(1, 1)
      // need to seperate into two columns
      context.moveTo(this.center[0] - (offset - o2), this.center[1] - o3)
      context.lineTo(this.center[0] + (offset + o2), this.center[1])
      context.lineTo(this.center[0] - (offset - o2), this.center[1] + o3)
      context.lineJoin = 'round'
      context.lineCap = 'round'
      context.fillStyle = color
      context.shadowColor = 'rgba(0,0,0,0)'
      context.shadowBlur = 0
      context.fill()
      context.closePath()
    }
  }

  render () {
    return null
  }
}

PlayButton.propTypes = propTypes
PlayButton.defaultProps = defaultProps

export default PlayButton
