export default {
  addFile (file) {
    return {
      type: 'ADD_FILE',
      file
    }
  },

  removeFile (file) {
    return {
      type: 'REMOVE_FILE',
      file
    }
  }
}
