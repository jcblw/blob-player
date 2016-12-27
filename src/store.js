import { createStore, combineReducers } from 'redux'
import { files } from './reducers/files'
import player from './reducers/player'
import playlist from './reducers/playlist'

export const configStore = preload => {
  return createStore(
    combineReducers({ files, player, playlist }),
    preload,
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__()
  )
}
