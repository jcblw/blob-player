import {css} from 'glamor'
import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import fileActions from '../actions/files'
import * as playlistActions from '../actions/playlist'
import {flex, flex0, flex1, column, row} from '../styles/flex'
import {toReadableTime} from '../utilities/format'
import Player from './player'
import Playlist, {PlaylistItem} from './playlist'
import {subheader} from '../styles/type'
const BG_COLOR = '#ced6d8'
const PLAYER_BG_COLOR = '#e2eaec'
const TRACK_COLOR = '#a5b0b1'
const PLAY_BUTTON_BG = '#fff'
const PLAY_BUTTON_COLOR = '#d1dbde'
const PROGRESS_COLOR = '#00B7FF'
const PLAYER_HEIGHT = 150

const propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  processFiles: PropTypes.func,
  hydrateFiles: PropTypes.func,
  removeFile: PropTypes.func,
  setCurrentTrack: PropTypes.func,
  currentTrack: PropTypes.any,
  duration: PropTypes.number,
  currentTime: PropTypes.number
}
const defaultProps = {
  files: []
}

const rel = css({
  position: 'relative'
})
const overflow = param => css({overflow: param})
const expand = css({
  width: '100%',
  height: '100%'
})
const bgColor = css({
  backgroundColor: BG_COLOR
})
const playlistContainer = css({
  maxWidth: 650,
  backgroundColor: PLAY_BUTTON_BG,
  margin: '0 auto 0 auto',
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  zIndex: 1
})
const bottomBar = css({
  backgroundColor: PLAYER_BG_COLOR,
  minHeight: PLAYER_HEIGHT,
  boxShadow: '0 1px 5px rgba(0,0,0,0.5)',
  zIndex: 2,
  transition: 'all .3s ease-in-out'
})
const hiddenBar = css({
  minHeight: 0,
  transform: `translate(0, ${PLAYER_HEIGHT}px)`
})
const dragdropInstructions = css({
  textAlign: 'center',
  padding: '50px 0'
})
const queueIcon = css({
  fontSize: 45,
  color: TRACK_COLOR
})
const playlistMeta = css({
  padding: '10px 25px'
})

class Layout extends Component {
  constructor (...args) {
    super(...args)
    this.onRemoveTrack = this.onRemoveTrack.bind(this)
  }

  cancelEvents (e) {
    e.preventDefault()
  }

  componentDidMount () {
    window.addEventListener('dragover', this.cancelEvents, false)
    window.addEventListener('drop', this.cancelEvents, false)
    this.props.hydrateFiles()
  }

  onFilesDropped (files) {
    this.props.processFiles(files)
  }

  onRemoveTrack (file) {
    this.props.removeFile(file)
  }

  getPlayer () {
    return this.player
      ? this.player.getWrappedInstance()
      : {
        isPlaying: () => false,
        pause: () => {}
      }
  }

  componentDidUpdate ({files: lastFiles}) {
    const {files, setCurrentTrack, currentTrack} = this.props
    if (files.length && files.every(f => f.isLoaded) && !currentTrack) {
      setCurrentTrack(files[0])
    }
  }

  render () {
    const {files, currentTrack, duration, currentTime, setCurrentTrack} = this.props
    const buffer = currentTrack ? currentTrack.buffer : null
    const isPlaying = this.getPlayer().isPlaying()
    const currentTrackIndex = files.indexOf(currentTrack)
    const nextTrack = files[currentTrackIndex + 1]
    return (
      <div
        className={css(rel, flex, column, expand, bgColor)}
        onDrop={(e) => {
          this.onFilesDropped(e.nativeEvent.dataTransfer.files)
        }}
      >
        <div className={css(flex1, flex, overflow('hidden'))}>
          <div className={css(flex1, flex, column, overflow('scroll'))}>
            <div className={css(flex1, dragdropInstructions)}>
              <i className={`${queueIcon} material-icons`}>queue_music</i>
              <h3 className={subheader}>
                Drag and drop audio files anywhere on the page
              </h3>
            </div>
            <div className={css(flex0)}>
              <div className={playlistContainer}>
                <p className={css(subheader, playlistMeta)}>{files.length} song{files.length === 1 ? '' : 's'}</p>
                {files && files.length
                  ? (
                    <Playlist
                      files={files}
                      currentTrack={currentTrack}
                      isPlaying={isPlaying}
                      albumColor={TRACK_COLOR}
                      selectedColor={PROGRESS_COLOR}
                      removeTrack={this.onRemoveTrack}
                      setCurrentTrack={(track) => {
                        if (track === currentTrack) {
                          return this.getPlayer().play()
                        }
                        this.props.setCurrentTrack(track)
                      }}
                      pauseTrack={() => {
                        this.getPlayer().pause()
                        setTimeout(() => this.forceUpdate(), 0)
                      }}
                    />
                  )
                  : null
                }
              </div>
            </div>
          </div>
        </div>
        <div className={css(
          flex,
          flex0,
          row,
          bottomBar,
          currentTrack
            ? null
            : hiddenBar
        )}>
          <div className={css(flex1, overflow('hidden'))}>
            {currentTrack
              ? (
                <PlaylistItem
                  suptext='Playing'
                  hasControls={false}
                  name={currentTrack.name}
                  subtext={`${toReadableTime(currentTime)} - ${toReadableTime(duration)}`}
                />
              )
              : null
            }
          </div>
          <Player
            ref={p => { this.player = p }}
            className={flex0}
            src={buffer}
            bgColor={PLAYER_BG_COLOR}
            playIconColor={PLAY_BUTTON_COLOR}
            playBgColor={PLAY_BUTTON_BG}
            trackBarColor={TRACK_COLOR}
            progressColor={PROGRESS_COLOR}
            width={150}
            height={PLAYER_HEIGHT}
            onEnd={() => {
              const index = files.indexOf(currentTrack)
              const nextTrack = files[index + 1]
              if (nextTrack) {
                setCurrentTrack(nextTrack)
              }
            }}
          />
          <div className={css(flex1, overflow('hidden'))}>
            {nextTrack
              ? (
                <PlaylistItem
                  suptext='Up next'
                  hasControls={false}
                  name={nextTrack.name}
                />
              )
              : null
            }

          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps ({files, playlist, player}) {
  return {
    files,
    currentTrack: playlist.currentTrack,
    duration: player.duration,
    currentTime: player.currentTime
  }
}

function mapDispatchToProps (dispatch) {
  return Object.assign({},
    bindActionCreators(fileActions, dispatch),
    bindActionCreators(playlistActions, dispatch)
  )
}

Layout.propTypes = propTypes
Layout.defaultProps = defaultProps

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Layout)
