export default function mapSegments (radius) {
  return (i, _, arr) => {
    const {simplex, iteration, center, noOffset} = this
    const {spread} = this.props
    const a = (6.28319 / arr.length) * i // << needs to be total radians / amount
    const point = [
      (center[0] + (radius) * Math.cos(a)),
      (center[1] + (radius) * Math.sin(a))
    ]
    const simplexOffset = noOffset
      ? 0
      : simplex.noise3d(point[0] / 50, (point[1] + iteration) / 50, a)
    const change = simplexOffset * spread
    let coordinates
    if (this.transformCoord) {
      coordinates = this.transformCoord(center, radius, change, a)
    } else {
      coordinates = [
        center[0] + (radius + change) * Math.cos(a),
        center[1] + (radius + change) * Math.sin(a)
      ]
    }

    return [
      ...coordinates
    ]
  }
}

export function reduceToArcs () {
  let current = 0
  return (accum, point) => {
    if (typeof accum[current] === 'undefined') {
      accum[current] = []
    }
    accum[current].push(point)
    if (accum[current].length === 3) {
      accum.push([point])
      current += 1
    }
    return accum
  }
}

export function mapBadRadianSegments (_, i, arr) {
  const {radius, simplex, iteration, center, spread} = this
  const a = (360 / arr.length) * i
  const point = [
    (center[0] + (radius) * Math.cos(a)),
    (center[1] + (radius) * Math.sin(a))
  ]
  const simplexOffset = simplex.noise3d(point[0] / 50, (point[1] + iteration) / 50, a)
  const change = Math.abs(simplexOffset * spread)
  let coordinates
  if (this.transformCoord) {
    coordinates = this.transformCoord(center, radius, change, a)
  } else {
    coordinates = [
      (center[0] + (radius + change) * Math.cos(a)),
      (center[1] + (radius + change) * Math.sin(a))
    ]
  }

  return [
    ...coordinates
  ]
}
