
import React from 'react'
import {css} from 'glamor'
import filesize from 'filesize'
import {flex, flex0, flex1, alignItems, column, justifyContent} from '../styles/flex'
import {header, subheader} from '../styles/type'

const albumArt = (
  bgColor = '#ddd',
  color = 'white'
) => css({
  marginTop: 25,
  marginLeft: 25,
  marginBottom: 25,
  width: 50,
  height: 50,
  backgroundColor: bgColor,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: color,
  borderRadius: 25,
  cursor: 'pointer'
})

const listItem = css({
  paddingRight: 25
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

export const PlaylistItem = ({
  name,
  subtext,
  suptext,
  track,
  setCurrentTrack,
  pauseTrack,
  isPlaying,
  albumColor,
  hasControls = true
}) => (
  <div className={css(flex, listItem)}>
    {hasControls
      ? (
        <div className={flex0}>
          <div className={albumArt(albumColor)}>
            {!isPlaying
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
  </div>
)

export default ({
  files = [],
  setCurrentTrack,
  currentTrack,
  pauseTrack,
  isPlaying,
  albumColor
}) => (
  <div>
    {files.map((file, i) => (
      <PlaylistItem
        name={file.name}
        subtext={filesize(file.size)}
        track={file}
        isPlaying={currentTrack === file && isPlaying}
        setCurrentTrack={setCurrentTrack}
        pauseTrack={pauseTrack}
        key={`file${i}`}
        albumColor={albumColor}
      />
    ))}
  </div>
)
