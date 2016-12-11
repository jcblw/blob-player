
import * as d3 from 'd3'
import Simplex from 'perlin-simplex'

const getColor = n => Math.floor(255 * (n / 2 + 0.5))

export default class Circle {
  constructor (
    canvas,
    {
      radius = 100,
      color,
      segmentRadius = 2,
      segmentAmount = 360 * 2,
      transformCoord,
      mapSegments
    }
) {
    const node = canvas.node()
    const width = node.width
    const height = node.height
    this.context = node.getContext('2d')
    this.radius = radius
    this.segmentRadius = 2
    this.spread = 100
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

  setSegmentRadius (r) {
    this.segmentRadius = r
  }

  setSegmentAmount (a) {
    this.fragmentAmount = a
  }

  drawSegment (radius) {
    return (point, i, arr) => {
      const {context, colorSimplex} = this
      const [, , offset] = point
      const red = getColor(colorSimplex.noise3d(1000, 10, offset - 1000))
      const green = getColor(colorSimplex.noise3d(1000, 10, offset + 1000))
      const blue = getColor(colorSimplex.noise3d(1000, 10, offset))
      const a = (360 / arr.length) * i

      context.beginPath()
      context.translate(0, 0)
      context.scale(1, 1)
      context.moveTo(point[0] + radius, point[1])
      context.arc(point[0], point[1], radius, 0, 2 * Math.PI)
      // context.fillText(`${i}: ${a}º`, point[0], point[1])
      if (this.color) {
        context.fillStyle = this.color
      } else {
        context.fillStyle = `rgb(${red},${green},${blue})`
      }
      context.fill()
    }
  }

  draw () {
    this.iteration += 1
    const {segmentRadius, radius, center} = this
    const points = d3.range(this.fragmentAmount)
      .map(this.mapSegments)
    points.forEach(this.drawSegment(segmentRadius))
    // this.drawSegment(radius)(center)
  }
}
