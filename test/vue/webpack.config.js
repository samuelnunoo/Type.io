const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'development',
  externals: [nodeExternals()],
  devtool: 'inline-cheap-module-source-map',
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
}
