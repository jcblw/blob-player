import {css} from 'glamor'
import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import fileActions from '../actions/files'
import Player from './player'
import Playlist from './playlist'
const BG_COLOR = '#FFD981'
const PLAYER_BG_COLOR = '#FFB300'
const TRACK_COLOR = '#BF8600'
const PLAY_BUTTON_BG = '#fff'
const PLAY_BUTTON_COLOR = '#ddd'
const PROGRESS_COLOR = '#fff'

const propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  addFile: PropTypes.func
}
const defaultProps = {
  files: []
}

const rel = css({
  position: 'relative'
})
const expand = css({
  width: '100%',
  height: '100%'
})
const flex = css({
  display: 'flex',
  flexDirection: 'column'
})
const flex0 = css({
  flex: 0
})
const flex1 = css({
  flex: 1
})
const bgColor = css({
  backgroundColor: BG_COLOR
})
const playlistContainer = css({
  maxWidth: 650,
  backgroundColor: PLAY_BUTTON_BG,
  margin: '0 auto'
})

class Layout extends Component {
  cancelEvents (e) {
    e.preventDefault()
  }

  componentDidMount () {
    window.addEventListener('dragover', this.cancelEvents, false)
    window.addEventListener('drop', this.cancelEvents, false)
  }

  onFilesDropped (files) {
    const fileArr = Array.from(files)
    Promise.all(fileArr.map(this.decodeFile))
      .then((dataset) => {
        dataset.forEach((arrbuff, i) => fileArr[i].buffer = arrbuff)
        fileArr.forEach((file) => {
          this.props.addFile(file)
        })
      })
      .catch(() => {})
  }

  decodeFile (file) {
    return (new Promise((resolve, reject) => {
      const reader =  new FileReader() 
      reader.addEventListener('load', (e) => {
        const data = e.target.result
        resolve(data)
      })
      reader.onerror = (err) => reject(err)
      reader.readAsArrayBuffer(file)
    }))
  }

  render () {
    const {files} = this.props
    const buffer = files && files.length ? files[0].buffer : null
    return (
      <div
        className={css(rel, flex, expand, bgColor)}
        onDrop={(e) => {
          this.onFilesDropped(e.nativeEvent.dataTransfer.files)
        }}
      >
        <div className={css(flex1, flex)}>
          <div className={flex1}>
          </div>
          <div className={flex0}>
            <div className={playlistContainer}>
              <Playlist files={files} />
            </div>
          </div>
        </div>
        <div className={flex0}>
          <Player
            src={buffer}
            bgColor={PLAYER_BG_COLOR}
            playIconColor={PLAY_BUTTON_COLOR}
            playBgColor={PLAY_BUTTON_BG}
            trackBarColor={TRACK_COLOR}
            progressColor={PROGRESS_COLOR}
            width={window.innerWidth}
            height={150}
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps ({files}) {
  return {
    files
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(fileActions, dispatch)
}

Layout.propTypes = propTypes
Layout.defaultProps = defaultProps

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Layout)
