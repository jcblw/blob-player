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
  },

  updateFile (file, index) {
    return {
      type: 'UPDATE_FILE',
      file,
      index
    }
  },

  processFiles (files) {
    return {
      type: 'PROCESS_FILES',
      files
    }
  }
}
