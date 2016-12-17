
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
    this.state = {}
    this.mapSegments = mapSegments.bind(this)
  }

  getPoints () {
    return this._points ? [...this._points] : []
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
        .map(this.mapSegments(this.props.radius))
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

  stop (duration = 500, radius) {
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

  doesPointCollide ([x, y]) {
    const {center} = this
    const {radius} = this.props
    const [x1, y1] = center
    return Math.sqrt((x1 - x) * (x1 - x) + (y1 - y) * (y1 - y)) < radius
  }

  doesPointCollideOnScrubber ([x, y]) {
    const {scrubberPosition} = this
    const {scrubberRadius: radius} = this.props
    const [x1, y1] = scrubberPosition
    return Math.sqrt((x1 - x) * (x1 - x) + (y1 - y) * (y1 - y)) < radius
  }

  click (e, ...args) {
    const {offsetTop, offsetLeft} = this.props.canvas
    const target = [
      e.pageX - offsetLeft,
      e.pageY - offsetTop
    ]

    // if (this.doesPointCollideOnScrubber(target)) {
    //   console.log('scrubber clicked')
    //   return
    //   // this.props.onScrubberClick(e, ...args, target)
    // }
    this.props.onClick(e, ...args)
  }

  mouseMove (e) {
    // need to filter this to only when the drag has started
    const {offsetTop, offsetLeft} = this.props.canvas
    const x = e.pageX - offsetLeft
    const y = e.pageY - offsetTop
    const dist = ([x2, y2]) => Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2))
    const closestPoint = this._points
      .reduce((currentPoint, nextPoint) => {
        if (dist(currentPoint) < dist(nextPoint)) {
          return nextPoint
        }
        return currentPoint
      })

    if (closestPoint !== this.scrubberPosition) {
      this.setState({ tmpScrubberPosition: closestPoint })
    }
    //
  }

  mouseDown (e) {
    const {offsetTop, offsetLeft} = this.props.canvas
    const target = [
      e.pageX - offsetLeft,
      e.pageY - offsetTop
    ]

    if (!this.doesPointCollideOnScrubber(target)) {
      return
    }

    // set the next set of events to target this element
    // find nearest point if that point is not current point
    // pause music
    // somehow calculate time, this can probably just inverse the logic
    // that places the scrubber on its current point
    // on click if point is differnt then current seek to that part of the music
  }

  draw () {
    const {
      canvas,
      segmentAmount,
      color,
      currentTime,
      duration,
      scrubberRadius,
      progressColor,
      radius
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
        .map(this.mapSegments(radius))
      points.push(points[0])
    }

    this._points = points
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
    context.strokeStyle = '#5b8f8c'
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
