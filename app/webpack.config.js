const path = require('path');
const webpack = require('webpack');

var config = {
  context: path.resolve(__dirname, './src'),
  entry: [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client',
    './app.js'
  ],
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
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  devServer: {
    open: true,
    contentBase: path.resolve(__dirname, './src')
  },
  devtool: 'eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
};

if (process.env.NODE_ENV === 'production') {
  config.devtool = 'source-map'
}

module.exports = config;