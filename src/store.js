import { createStore, combineReducers, compose, applyMiddleware } from 'redux'
import { files } from './reducers/files'
import player from './reducers/player'
import playlist from './reducers/playlist'
import fileProcessing from './middleware/file-processing'
import filePersistance from './middleware/file-persistance'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const configStore = preload => {
  return createStore(
    combineReducers({ files, player, playlist }),
    preload,
    composeEnhancers(applyMiddleware(
      filePersistance,
      fileProcessing
    ))
  )
}
