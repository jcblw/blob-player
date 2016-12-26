
export const files = (state = [], action = {}) => {
  switch (action.type) {
    case 'ADD_FILE':
      return [...state, action.file]
    case 'REMOVE_FILE': {
      const fileIndex = state.indexOf(action.file)
      if (fileIndex === -1) {
        return state
      }
      return [
        ...state.slice(0, fileIndex - 1),
        ...state.slice(fileIndex)
      ]
    }
    default:
      return state
  }
}
