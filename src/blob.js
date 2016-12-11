
import * as d3 from 'd3'
import Simplex from 'perlin-simplex'
import TWEEN, {Tween} from 'tween.js'

export default class Blob {
  constructor (
    canvas,
    {
      radius = 100,
      color,
      segmentAmount = 3 * 30,
      transformCoord,
      mapSegments
    }
) {
    const node = canvas.node()
    const width = node.width
    const height = node.height
    this.context = node.getContext('2d')
    this.radius = radius
    this.spread = 20
    this.transformCoord = transformCoord
    this.fragmentAmount = segmentAmount
    this.simplex = new Simplex()
    this.colorSimplex = new Simplex()
    this.color = color
    this.iteration = 0
    this.center = [
      width / 2,
      height / 2
    ]

    this.mapSegments = mapSegments.bind(this)
  }

  setRadius (r) {
    this.radius = r
  }

  setSegmentAmount (a) {
    this.fragmentAmount = a
  }

  getPoints () {
    return this._points || []
  }

  drawSegment (radius) {
    return (lastPoint, nextPoint) => {
      const {context, radius} = this
      context.lineTo(
        ...lastPoint,
        ...nextPoint,
        radius
      )
      return nextPoint
    }
  }

  stop () {
    const points = this.getPoints()
    this.isStopped = true
    this.noOffset = true
    const end = d3.range(this.fragmentAmount)
      .map(this.mapSegments)
    end.push(end[0])
    this.noOffset = false
    console.log(TWEEN.Easing.Bounce.InOut)
    points.forEach(([x, y], i) => {
      const _this = this
      let tween = new Tween({x, y})
        .easing(TWEEN.Easing.Bounce.InOut)
        .to({
          x: end[i][0],
          y: end[i][1]
        }, 100)
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
    const points = this.getPoints()
    const end = d3.range(this.fragmentAmount)
      .map(this.mapSegments)
    end.push(end[0])
    points.forEach(([x, y], i) => {
      const _this = this
      new Tween({x, y})
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
      const {context} = this
      context.moveTo(...base)
      if (!control || !dest) return
      context.quadraticCurveTo(
        ...control,
        ...dest
      )
    }
  }

  doesPointCollide ([x, y]) {
    const {radius, center} = this
    const [x1, y1] = center
    return Math.sqrt((x1 - x) * (x1 - x) + (y1 - y) * (y1 - y)) < radius
  }

  click () {
    if (this.isStopped) return this.start()
    this.stop()
  }

  draw () {
    this.iteration += 1

    const {context} = this
    let points
    if (
      this.isStopped ||
      (this.isStarting && this.currentTween)
    ) {
      points = this.currentTween || this._points
    } else {
      points = d3.range(this.fragmentAmount)
        .map(this.mapSegments)
      points.push(points[0])
    }

    this._points = points
    this.currentTween = null
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
    }, [])
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
    context.fillStyle = this.color
    context.fill()

    // this.drawSegment(radius)(center)
  }
}
