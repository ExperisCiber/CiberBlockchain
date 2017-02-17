const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: {
    app: './app.js'
  },
  output: {
    path: path.resolve(__dirname, './dist/assets'),
    filename: '[name].bundle.js',
    publicPath: '/assets'
  },
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: 'html-loader'
      }
    ]
  },
  devServer: {
    open: true,
    contentBase: path.resolve(__dirname, './src')
  }
};