
import React from 'react'
import {css} from 'glamor'
import filesize from 'filesize'
import {flex, flex0, flex1, column, justifyContent} from '../styles/flex'
import {header, subheader} from '../styles/type'
import {toReadableTime} from '../utilities/format'

const iconBase = css({
  marginTop: 25,
  marginLeft: 25,
  marginBottom: 25,
  width: 50,
  height: 50,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 25,
  cursor: 'pointer',
  transition: 'background-color .3s ease-out'
})

const albumArt = (
  bgColor = '#ddd',
  color = 'white'
) => css({
  backgroundColor: bgColor,
  color: color
})

const loading = (
  color = '#ddd'
) => css({
  backgroundColor: 'white',
  color
})

const listItem = css({
  paddingRight: 25
})

const selectedItem = selectedColor => css({
  borderLeft: `5px solid ${selectedColor}`
})

const noOverflow = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis'
})

const playlistContent = css(noOverflow, {
  whiteSpace: 'nowrap',
  marginLeft: 25,
  marginTop: 25
})

const closeIcon = color => css(iconBase, {
  color
})

export const PlaylistItem = ({
  name,
  subtext,
  suptext,
  track,
  setCurrentTrack,
  pauseTrack,
  removeTrack,
  isPlaying,
  albumColor,
  selectedColor,
  hasControls = true,
  isLoading
}) => (
  <div className={css(flex, listItem)}>
    {hasControls || isLoading
      ? (
        <div className={css(flex0, isPlaying ? selectedItem(selectedColor) : selectedItem('white'))}>
          <div className={css(iconBase, isLoading ? loading(albumColor) : albumArt(albumColor))}>
            {isLoading
              ? (
                <i
                  onClick={() => setCurrentTrack(track)}
                  className='material-icons'
                >sync</i>
              )
              : !isPlaying
                ? (
                  <i
                    onClick={() => setCurrentTrack(track)}
                    className='material-icons'
                  >play_arrow</i>
                )
                : (
                  <i
                    onClick={() => pauseTrack(track)}
                    className='material-icons'
                  >pause</i>
                )
            }
          </div>
        </div>
      )
      : null
    }
    <div className={css(flex1, flex, column, justifyContent('center'), playlistContent)}>
      {suptext ? <h3 className={css(subheader, noOverflow)}>{suptext}</h3> : null}
      <h1 className={css(header, noOverflow)}>{name}</h1>
      <h3 className={css(subheader, noOverflow)}>{subtext}</h3>
    </div>
    {removeTrack
      ? (
        <div className={css(flex0, closeIcon(albumColor))}>
          <i
            onClick={() => removeTrack(track)}
            className='material-icons'
          >clear</i>
        </div>
      )
      : null
    }
  </div>
)

export default ({
  files = [],
  setCurrentTrack,
  currentTrack,
  pauseTrack,
  removeTrack,
  isPlaying,
  albumColor,
  selectedColor
}) => (
  <div>
    {files.map((file, i) => (
      <PlaylistItem
        name={file.name}
        subtext={!file.isLoaded ? 'Processing...' : `${toReadableTime(file.duration)} - ${filesize(file.size)}`}
        track={file}
        isPlaying={currentTrack === file && isPlaying}
        setCurrentTrack={setCurrentTrack}
        pauseTrack={pauseTrack}
        removeTrack={removeTrack}
        key={`file${i}`}
        albumColor={albumColor}
        hasControls={file.isLoaded}
        isLoading={!file.isLoaded}
        selectedColor={selectedColor}
      />
    ))}
  </div>
)
