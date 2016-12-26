import { createStore, combineReducers } from 'redux'
import { files } from './reducers/files'

export const configStore = preload => {
  return createStore(
    combineReducers({ files }),
    preload,
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__()
  )
}
