const path = require("path");
const webpack = require("webpack");
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, './build'),
    publicPath: '/build/',
    filename: 'vue-week-time-range-picker.min.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },

    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    // make sure to include the plugin for the magic
    new VueLoaderPlugin()
  ]
}