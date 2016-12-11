import {style} from 'glamor'
import React, {Component, PropTypes} from 'react'

const propTypes = {
  fps: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  children: PropTypes.node,
  onDraw: PropTypes.func,
  backgroundColor: PropTypes.string
}
const defaultProps = {
  fps: 60,
  width: 100,
  height: 100,
  onDraw: () => {},
  backgroundColor: 'white'
}
const childContextTypes = {
  canvas: PropTypes.object
}

class Stage extends Component {
  constructor (...args) {
    super(...args)
    this.draw = this.draw.bind(this)
    this.onCanvasClick = this.onCanvasClick.bind(this)
    this.childrenRefs = []
    this.isInitialize = false
    this.initialize = (...args) => {
      if (!this.isInitialize) this.start()
      this.isInitialize = true
    }
  }

  static getDimensions ({
    width,
    height,
    offsetTop,
    offsetLeft
  }) {
    return {
      width,
      height,
      top: offsetTop,
      left: offsetLeft
    }
  }

  getChildContextTypes () {
    const {canvas} = this
    return {
      canvas
    }
  }

  onCanvasClick (e, ...args) {
    const {offsetTop, offsetLeft} = this.canvas
    const target = [
      e.pageX - offsetLeft,
      e.pageY - offsetTop
    ]
    this.childrenRefs.forEach((child) => {
      if (
        typeof child.doesPointCollide !== 'function' &&
        typeof child.click !== 'function'
      ) return

      if (child.doesPointCollide(target)) {
        child.click(e, ...args, target)
      }
    })
  }

  draw (...args) {
    const {context, canvas} = this
    const {width, height} = canvas
    const {fps, onDraw} = this.props
    this._timer = setTimeout(
      () => window.requestAnimationFrame(this.draw), 1000 / fps
    )
    onDraw(context, ...args)
    context.save()
    context.clearRect(0, 0, width, height)
    this.childrenRefs.forEach((child) => {
      child.draw()
    })
    context.restore()
  }

  addRef (i) {
    return (r) => {
      this.childrenRefs[i] = r
    }
  }

  start () {
    clearTimeout(this._timer)
    this.forceUpdate()
    this.draw()
  }

  componentWillUnmount () {
    clearTimeout(this._timer)
  }

  render () {
    const {width, height, children, backgroundColor} = this.props
    const expand = style({
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: backgroundColor
    })
    const cloneChildren = React.Children
      .map(children, (child, i) => {
        return React.createElement(
          child.type,
          Object.assign(
            {},
            child.props,
            { ref: this.addRef(i), canvas: this.canvas }
          )
        )
      })

    return (
      <canvas
        ref={r => {
          if (!r) return
          this.canvas = r
          this.context = r.getContext('2d')
          this.initialize()
        }}
        onClick={this.onCanvasClick}
        className={expand}
        width={width}
        height={height}
      >
        {cloneChildren}
      </canvas>
    )
  }
}

Stage.propTypes = propTypes
Stage.defaultProps = defaultProps
Stage.childContextTypes = childContextTypes

export default Stage