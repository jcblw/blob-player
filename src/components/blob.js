
import {Component, PropTypes} from 'react'
import * as d3 from 'd3'
import Simplex from 'perlin-simplex'
import TWEEN, {Tween} from 'tween.js'
import {reduceToArcs} from '../map-segments'

const propTypes = {
  radius: PropTypes.number,
  color: PropTypes.string,
  segmentAmount: PropTypes.number,
  spread: PropTypes.number,
  mapSegments: PropTypes.func,
  canvas: PropTypes.object,
  defaultStoppedState: PropTypes.bool,
  onClick: PropTypes.func,
  currentTime: PropTypes.number,
  duration: PropTypes.number,
  scrubberRadius: PropTypes.number,
  progressColor: PropTypes.string,
  stoppedRadius: PropTypes.number,
  animationDuration: PropTypes.number,
  isPlaying: PropTypes.bool,
  trackColor: PropTypes.string,
  onSetScrubberTime: PropTypes.func,
  onStopSound: PropTypes.func,
  onScrubberDragged: PropTypes.func
}
const defaultProps = {
  radius: 100,
  segmentAmount: 2 * 30,
  spread: 20,
  mapSegments: x => x,
  onSetScrubberTime: x => x,
  onStopSound: x => x,
  defaultStoppedState: false,
  scrubberRadius: 10,
  color: 'white',
  trackColor: '#ddd',
  progressColor: 'tomato',
  animationDuration: 1000
}
const dist = ([x, y], [x2, y2]) => {
  return Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2))
}

class Blob extends Component {
  constructor (props) {
    const {
      mapSegments
    } = props
    super()
    this.state = {}
    this.mapSegments = mapSegments.bind(this)
  }

  getPoints () {
    return this._points ? [...this._points] : []
  }

  componentDidMount () {
    const {isPlaying, canvas} = this.props
    if (canvas) {
      this.hydrateCanvasData(canvas)
      this.togglePlayingState(isPlaying)
    }
  }

  componentDidUpdate (lastProps) {
    const {canvas, isPlaying} = this.props
    const {isPlaying: wasPlaying} = lastProps
    if (!this._context && canvas) {
      this.hydrateCanvasData(canvas)
    }
    if (isPlaying !== wasPlaying) {
      this.togglePlayingState(isPlaying)
    }
  }

  hydrateCanvasData (canvas) {
    const width = canvas.width
    const height = canvas.height
    this._context = canvas.getContext('2d')
    this.simplex = new Simplex()
    this.colorSimplex = new Simplex()
    this.iteration = 0
    this.center = [
      width / 2,
      height / 2
    ]
  }

  togglePlayingState (isPlaying) {
    if (!this._points) {
      this.noOffset = !isPlaying
      this._points = d3.range(this.props.segmentAmount)
        .map(this.mapSegments(isPlaying
          ? this.props.radius
          : (this.props.stoppedRadius || this.props.radius)
        ))
      this.noOffset = false
    }
    if (isPlaying) {
      this.start(
        this.props.animationDuration
      )
      return
    }
    this.stop(
      this.props.animationDuration,
      this.props.stoppedRadius
    )
  }

  drawSegment (radius) {
    return (lastPoint, nextPoint) => {
      const {_context} = this
      const {radius} = this.props
      _context.lineTo(
        ...lastPoint,
        ...nextPoint,
        radius
      )
      return nextPoint
    }
  }

  stop (duration, radius) {
    const props = this.props
    const points = this.getPoints()
    this.isStopped = true
    this.noOffset = true
    const _this = this
    const end = d3.range(props.segmentAmount)
      .map(this.mapSegments(radius || props.radius))
    end.push(end[0])
    this.noOffset = false
    points.forEach(([x, y], i) => {
      let tween = new Tween({x, y})
        .easing(TWEEN.Easing.Elastic.Out)
        .to({
          x: end[i][0],
          y: end[i][1]
        }, duration)
        .onUpdate(function () {
          if (!_this.currentTween) _this.currentTween = []
          _this.currentTween[i] = [this.x, this.y]
        })
        .onComplete(() => {
          tween.stop()
          if (i === points.length - 1) {
            _this.currentTween = null
          }
        })
        .start()
    })
  }

  start (duration) {
    this.isStarting = true
    this.isStopped = false
    const points = this.getPoints()
    const end = d3.range(this.props.segmentAmount)
      .map(this.mapSegments(this.props.radius))
    end.push(end[0])
    points.forEach(([x, y], i) => {
      const _this = this
      new Tween({x, y})
        .easing(TWEEN.Easing.Elastic.Out)
        .to({
          x: end[i][0],
          y: end[i][1]
        }, duration)
        .onUpdate(function () {
          if (!_this.currentTween) _this.currentTween = []
          _this.currentTween[i] = [this.x, this.y]
        })
        .onComplete(function () {
          if (i === points.length - 1) {
            _this.currentTween = null
          }
        })
        .start()
    })
    this.isStarting = true
    this.isStopped = false
  }

  drawArc () {
    return (arc) => {
      const [base, control, dest] = arc
      const {_context} = this
      _context.moveTo(...base)
      if (!control || !dest) return
      _context.quadraticCurveTo(
        ...control,
        ...dest
      )
    }
  }

  doesPointCollide (point) {
    const {center} = this
    const {radius} = this.props
    const {isDraggingScrubber} = this.state
    if (isDraggingScrubber) return true
    return dist(point, center) < radius
  }

  doesPointCollideOnScrubber (point) {
    const {scrubberPosition} = this
    const {scrubberRadius: radius} = this.props
    return dist(point, scrubberPosition) < radius
  }

  click (e) {
    if (this.state.isDraggingScrubber) {
      const {duration, onSetScrubberTime} = this.props
      const {tmpScrubberPositionIndex} = this.state
      const scrubberTime = (duration / this._points.length) * tmpScrubberPositionIndex
      onSetScrubberTime(scrubberTime)
      this.setState({
        isDraggingScrubber: false,
        tmpScrubberPosition: null,
        tmpScrubberPositionIndex: null
      })
      return
    }

    this.props.onClick(e)
  }

  mouseMove (e) {
    // need to filter this to only when the drag has started
    const {offsetTop, offsetLeft} = this.props.canvas
    const x = e.pageX - offsetLeft
    const y = e.pageY - offsetTop
    const point = [x, y]
    const closestPoint = this._points
      .reduce((currentPoint, nextPoint) => {
        if (dist(point, currentPoint) > dist(point, nextPoint)) {
          return nextPoint
        }
        return currentPoint
      })

    if (closestPoint !== this.scrubberPosition) {
      this.setState({
        tmpScrubberPosition: closestPoint,
        tmpScrubberPositionIndex: this._points.indexOf(closestPoint)
      })
    }
  }

  mouseDown (e) {
    const {onStopSound, canvas, onScrubberDragged} = this.props
    const {offsetTop, offsetLeft} = canvas
    const target = [
      e.pageX - offsetLeft,
      e.pageY - offsetTop
    ]

    if (this.doesPointCollideOnScrubber(target)) {
      if (onScrubberDragged) {
        onScrubberDragged()
      }
      onStopSound()
      this.setState({isDraggingScrubber: true})
      return
    }
  }

  touchStart (e) { this.mouseDown(e) }
  touchEnd (e) { this.click(e) }
  touchMove (e) { this.mouseMove(e) }

  draw () {
    const {
      canvas,
      segmentAmount,
      color,
      currentTime,
      duration,
      scrubberRadius,
      progressColor,
      radius,
      trackColor
    } = this.props
    const {
      isDraggingScrubber,
      tmpScrubberPosition,
      tmpScrubberPositionIndex
    } = this.state
    if (!canvas) return
    const context = canvas.getContext('2d')
    let points
    if (
      this.isStopped ||
      (this.isStarting && this.currentTween)
    ) {
      points = this.currentTween || this._points
    } else {
      this.iteration += 1
      points = d3.range(segmentAmount)
        .map(this.mapSegments(radius))
      points.push(points[0])
    }

    this._points = points.filter(x => x)
    // this.currentTween = null
    if (points.length < segmentAmount - 1) return
    const arcs = points
      .reduce(reduceToArcs(), [])

    context.beginPath()
    context.translate(0, 0)
    context.scale(1, 1)
    points
      .filter((_, i) => i % 2 === 0)
      .reduce(this.drawSegment())
    context.lineJoin = 'round'
    context.lineCap = 'round'
    context.fillStyle = color
    context.fill()
    context.closePath()

    // progress bar
    context.beginPath()
    context.translate(0, 0)
    context.scale(1, 1)
    arcs.forEach(this.drawArc())
    context.lineWidth = scrubberRadius
    context.lineJoin = 'round'
    context.lineCap = 'round'
    context.strokeStyle = trackColor
    context.stroke()
    context.fillStyle = color
    context.fill()
    context.closePath()

    // progress bar
    const progress = isDraggingScrubber
      ? tmpScrubberPositionIndex / this._points.length
      : currentTime / duration
    const progressArcs = arcs.slice(0, Math.floor(arcs.length * progress))
    context.beginPath()
    context.translate(0, 0)
    context.scale(1, 1)
    progressArcs.forEach(this.drawArc())
    context.lineWidth = scrubberRadius
    context.lineJoin = 'round'
    context.lineCap = 'round'
    context.strokeStyle = progressColor
    context.stroke()
    context.fillStyle = color
    context.fill()
    context.closePath()

    let lastPoint = isDraggingScrubber && tmpScrubberPosition
      ? [tmpScrubberPosition]
      : [...progressArcs].pop()
    if (!lastPoint) {
      lastPoint = [...arcs].shift()
    }
    lastPoint = [...lastPoint].pop()
    this.scrubberPosition = lastPoint
    context.beginPath()
    context.translate(0, 0)
    context.scale(1, 1)
    context.moveTo(...lastPoint)
    context.shadowColor = 'rgba(0,0,0,.3)'
    context.shadowBlur = 2
    context.arc(lastPoint[0], lastPoint[1], scrubberRadius, 0, Math.PI * 2, true)
    context.fillStyle = progressColor
    context.fill()
    context.closePath()
  }

  render () {
    return null
  }
}

Blob.propTypes = propTypes
Blob.defaultProps = defaultProps

export default Blob
