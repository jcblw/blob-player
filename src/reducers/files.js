
const fileKey = file => file.size
const fileIndex = (files, file) => {
  const key = fileKey(file)
  for (let i = 0; i < files.length; i += 1) {
    if (key === fileKey(files[i])) {
      return i
    }
  }
  return -1
}

export const files = (state = [], action = {}) => {
  switch (action.type) {
    case 'ADD_FILE':
      return [...state, action.file]
    case 'REMOVE_FILE': {
      const index = fileIndex(state, action.file)
      if (index === -1) {
        return state
      }
      return [
        ...state.slice(0, index),
        ...state.slice(index + 1)
      ]
    }
    case 'UPDATE_FILE': {
      const index = typeof action.index === 'number'
        ? action.index
        : fileIndex(state, action.file)
      if (index === -1) {
        console.log(action.file.size, ...state.map(f => f.size))
        return state
      }
      return [
        ...state.slice(0, index),
        Object.assign({}, state[index], action.file),
        ...state.slice(index + 1)
      ]
    }
    default:
      return state
  }
}
