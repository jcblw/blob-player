
import React from 'react'
import { css } from 'glamor'

const albumArt = css({
  margin: 25,
  width: 100,
  height: 100,
  backgroundColor: '#ddd'
})
const flex = css({
  display: 'flex',
  flexDirection: 'row'
})
const flex0 = css({
  flex: 0
})
const flex1 = css({
  flex: 1
})
const header = css({
  fontSize: 20,
  fontFamily: 'helvetica'
})

const PlaylistItem = ({name}) => (
  <div className={flex}>
    <div className={flex0}>
      <div className={albumArt} />
    </div>
    <div className={flex1}>
      <p className={header}>{name}</p>
    </div>
  </div>
)

export default ({files = []}) => (
  <div>
    {files.map((file, i) => (
      <PlaylistItem name={file.name} key={`file${i}`} />
    ))}
  </div>
)
