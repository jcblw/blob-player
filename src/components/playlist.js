
import React from 'react'
import { css } from 'glamor'
import { flex, flex0, flex1, alignItems } from '../styles/flex'

const albumArt = css({
  margin: 25,
  width: 100,
  height: 100,
  backgroundColor: '#ddd'
})
const header = css({
  fontSize: 20,
  fontFamily: 'helvetica'
})

export const PlaylistItem = ({name, track, setCurrentTrack, isPlaying}) => (
  <div className={flex}>
    <div className={flex0}>
      <div className={albumArt} />
    </div>
    <div className={css(flex1, flex, alignItems('center'))}>
      <p className={header}>{name}</p>
    </div>
    <div className={css(flex0, flex, alignItems('center'))}>
      {isPlaying
        ? null
        : (
          <button
            onClick={() => setCurrentTrack(track)}
          >
            Play
          </button>
        )
      }
    </div>
  </div>
)

export default ({files = [], setCurrentTrack, currentTrack}) => (
  <div>
    {files.map((file, i) => (
      <PlaylistItem
        name={file.name}
        track={file}
        isPlaying={currentTrack === file}
        setCurrentTrack={setCurrentTrack}
        key={`file${i}`}
      />
    ))}
  </div>
)
