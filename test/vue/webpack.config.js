const nodeExternals = require('webpack-node-externals')
const VueLoaderPlugin = require('vue-loader/dist/plugin').default

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  mode: 'development',
  externals: [nodeExternals()],
  devtool: 'inline-cheap-module-source-map',
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
}
