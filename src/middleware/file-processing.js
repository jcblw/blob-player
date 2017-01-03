import fileActions from '../actions/files'
import soundBoard from 'sound-board'

const {updateFile, removeFile, addFile} = fileActions

export default store => next => action => {
  if (action.type === 'PROCESS_FILES') {
    return processFiles(action.files, store.dispatch)
  }
  next(action)
}

const processFiles = (files, dispatch) => {
  const fileArr = Array.from(files)
  // need to add all files here
  fileArr.forEach((file) => {
    file.isLoaded = false
    dispatch(addFile(file))
  })
  Promise.all(fileArr.map(decodeFile))
    .then((dataset) => {
      return Promise.all(dataset.map((arrbuff, i) => {
        const fileBuffer = Object.assign({}, fileArr[i], {
          buffer: arrbuff,
          name: fileArr[i].name,
          size: fileArr[i].size
        })
        // fileArr[i].buffer = arrbuff
        dispatch(updateFile(fileBuffer))
        return soundBoard.loadBuffer(arrbuff.byteLength, arrbuff)
          .then((buff) => {
            const fullFile = Object.assign({}, fileBuffer, {
              duration: buff.duration,
              isLoaded: true
            })
            dispatch(updateFile(fullFile))
          })
          .catch(() => {
            dispatch(removeFile(fileBuffer))
          })
      }))
      .then(() => {
        dispatch({
          type: 'DONE_PROCESSING'
        })
      })
    })
    .catch(err => {
      dispatch({
        type: 'PROCESSING_ERROR',
        message: err.message
      })
    })
}

const decodeFile = file => {
  return (new Promise((resolve, reject) => {
    const reader = new window.FileReader()
    reader.addEventListener('load', (e) => {
      const data = e.target.result
      resolve(data)
    })
    reader.onerror = (err) => reject(err)
    reader.readAsArrayBuffer(file)
  }))
}
