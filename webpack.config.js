const path = require('path')

module.exports = {
  resolve: {
    symlinks: false,
    modules: [
      path.resolve(__dirname, '..', 'node_modules'),
      'node_modules'
    ]
  },
  entry: './src/index.js',
  output: {
    filename: './lib/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loaders: ['react-hot'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.js$/,
        exclude: /node_modules|sound-board/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
}
