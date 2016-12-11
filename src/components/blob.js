
import {Component, PropTypes} from 'react'
import * as d3 from 'd3'
import Simplex from 'perlin-simplex'
import TWEEN, {Tween} from 'tween.js'

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
  progressColor: PropTypes.string
}
const defaultProps = {
  radius: 100,
  color: 'white',
  segmentAmount: 2 * 30,
  spread: 20,
  mapSegments: x => x,
  defaultStoppedState: false,
  scrubberRadius: 10,
  progressColor: '#f47d30'
}

class Blob extends Component {
  constructor (props) {
    const {
      mapSegments
    } = props
    super()
    this.mapSegments = mapSegments.bind(this)
  }

  getPoints () {
    return this._points || []
  }

  componentDidUpdate () {
    if (!this.props.canvas || this._context) return
    const {canvas, defaultStoppedState} = this.props
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
    if (defaultStoppedState) {
      this.noOffset = true
      this._points = d3.range(this.props.segmentAmount)
        .map(this.mapSegments)
      this.noOffset = false
      this.stop()
    }
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

  stop () {
    const props = this.props
    const points = this.getPoints()
    this.isStopped = true
    this.noOffset = true
    const end = d3.range(props.segmentAmount)
      .map(this.mapSegments)
    end.push(end[0])
    this.noOffset = false
    points.forEach(([x, y], i) => {
      const _this = this
      let tween = new Tween({x, y})
        .easing(TWEEN.Easing.Elastic.Out)
        .to({
          x: end[i][0],
          y: end[i][1]
        }, 500)
        .onUpdate(function () {
          if (!_this.currentTween) _this.currentTween = []
          _this.currentTween[i] = [this.x, this.y]
        })
        .onComplete(() => {
          tween.stop()
          tween = null
        })
        .start()
    })
  }

  start () {
    this.isStarting = true
    this.isStopped = false
    const points = this.getPoints()
    const end = d3.range(this.props.segmentAmount)
      .map(this.mapSegments)
    end.push(end[0])
    points.forEach(([x, y], i) => {
      const _this = this
      new Tween({x, y})
        .easing(TWEEN.Easing.Elastic.In)
        .to({
          x: end[i][0],
          y: end[i][1]
        }, 500)
        .onUpdate(function () {
          if (!_this.currentTween) _this.currentTween = []
          _this.currentTween[i] = [this.x, this.y]
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

  doesPointCollide ([x, y]) {
    const {center} = this
    const {radius} = this.props
    const [x1, y1] = center
    return Math.sqrt((x1 - x) * (x1 - x) + (y1 - y) * (y1 - y)) < radius
  }

  getScrubberPosition () {

  }

  click (...args) {
    if (this.isStopped) {
      this.start()
    } else {
      this.stop()
    }
    this.props.onClick(...args)
  }

  draw () {
    const {
      canvas,
      segmentAmount,
      color,
      currentTime,
      duration,
      scrubberRadius,
      progressColor
    } = this.props
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
        .map(this.mapSegments)
      points.push(points[0])
    }

    this._points = points
    this.currentTween = null
    if (points.length < segmentAmount - 1) return
    let current = 0
    const arcs = points.reduce((accum, point) => {
      if (typeof accum[current] === 'undefined') {
        accum[current] = []
      }
      accum[current].push(point)
      if (accum[current].length === 3) {
        accum.push([point])
        current += 1
      }
      return accum
    }, []).filter(arc => arc.length === 3)

    context.beginPath()
    context.translate(0, 0)
    context.scale(1, 1)
    points
      .filter((_, i) => i % 2 === 0)
      .reduce(this.drawSegment())
    arcs.forEach(this.drawArc())
    context.lineWidth = 50
    context.lineJoin = 'round'
    context.lineCap = 'round'
    context.strokeStyle = 'rgba(0,0,0,.2)'
    context.stroke()
    context.fillStyle = color
    context.fill()
    context.closePath()

    // progress bar
    const progress = currentTime / duration
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

    // scrubber
    let lastPoint = [...progressArcs].pop()
    if (!lastPoint) {
      lastPoint = [...arcs].shift()
    }
    lastPoint = [...lastPoint].pop()
    context.beginPath()
    context.translate(0, 0)
    context.scale(1, 1)
    context.moveTo(...lastPoint)
    context.shadowColor = 'rgba(0,0,0,.3)'
    context.shadowBlur = 2
    context.arc(lastPoint[0], lastPoint[1], scrubberRadius, 0, Math.PI * 2, true)
    context.fillStyle = progressColor
    // context.fillStyle = 'tomato'
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
