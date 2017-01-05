
import leveljs from 'level-js'
import fileActions from '../actions/files'

const {addFile} = fileActions
let db
const fileKey = file => file.name + '-' + file.size
let isOpen = false

const done = (next, action) => {
  console.info(`filePersistance:${action.type} ${action.file.name}`)
  next(action)
}

const put = (key, value) => {
  return new Promise((resolve, reject) => {
    if (!isOpen) return reject(new Error('db is not open'))
    db.put(key, value, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

const get = (key) => {
  return new Promise((resolve, reject) => {
    if (!isOpen) return reject(new Error('db is not open'))
    db.get(key, (err, entry) => {
      if (err) return reject(err)
      resolve(entry)
    })
  })
}

const del = (key) => {
  return new Promise((resolve, reject) => {
    if (!isOpen) return reject(new Error('db is not open'))
    db.del(key, (err, entry) => {
      if (err) return reject(err)
      resolve(entry)
    })
  })
}

const saveFile = (file, next) => {
  const key = fileKey(file)
  put(key, Object.assign({}, file))
    .then(next)
    .catch(next)
}
const updateFile = (file, next) => {
  const key = fileKey(file)
  get(key)
    .then((entry) => {
      const payload = Object.assign({}, entry, file)
      return put(key, payload)
    })
    .then(next)
    .catch(next)
}
const removeFile = (file, next) => {
  const key = fileKey(file)
  del(key)
    .then(next)
    .catch(next)
}
const hydrateFiles = (dispatch) => {
  db = leveljs('blob-player', {json: true})
  db.open((err) => {
    if (err) return console.error(err)
    isOpen = true
    const req = db.idb.store.getAll()
    req.onsuccess = () => {
      req.result.forEach((file) => {
        const action = addFile(file)
        action.skip = true
        dispatch(action)
      })
    }
  })
}

export default store => next => action => {
  switch (action.type) {
    case 'ADD_FILE':
      if (!action.skip) return saveFile(action.file, done(next, action))
      break
    case 'REMOVE_FILE':
      return removeFile(action.file, done(next, action))
    case 'UPDATE_FILE':
      return updateFile(action.file, done(next, action))
    case 'HYDRATE_FILES':
      return hydrateFiles(store.dispatch)
    default:
      break
  }
  return next(action)
}
