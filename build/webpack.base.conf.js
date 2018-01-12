'use strict'
const path = require('path')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const utils = require('./utils')
const config = require('../config')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const createLintingRule = () => ({
  test: /\.(js|html)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

// html_webpack_plugins
// see https://github.com/ampedandwired/html-webpack-plugin
const htmlPlugins = () => {
  const templatePath = resolve('src/views')
  const templateFiles = glob.sync(templatePath + '/**/*.{html,htm}')
  const pluginArr = []

  templateFiles.forEach(function (item) {
      let filenameTmp = item.substring(item.lastIndexOf('\/') + 1, item.lastIndexOf('.'))
      let conf = {
        template: item,
        filename: filenameTmp + '.html',
        inject: 'body',
        chunksSortMode: 'dependency',
        minify: {
            removeComments: process.env.NODE_ENV === 'production' ? config.build.htmlMinify : config.dev.htmlMinify,
            collapseWhitespace: process.env.NODE_ENV === 'production' ? config.build.htmlMinify : config.dev.htmlMinify,
            removeAttributeQuotes: process.env.NODE_ENV === 'production' ? config.build.htmlMinify : config.dev.htmlMinify,
            // more options:
            // https://github.com/kangax/html-minifier#options-quick-reference
        }
      }
      pluginArr.push(new HtmlWebpackPlugin(conf))
  })
  return pluginArr
}

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: process.env.NODE_ENV === 'production' ? ["babel-polyfill", "./src/main.js"] : './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: 'js/[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '~src': resolve('src'),
      '~views': resolve('src/views'),
      '~styles': resolve('src/styles'),
      '~scripts': resolve('src/scripts'),
      '~images': resolve('src/images'),
    }
  },
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1,
          name: utils.assetsPath('img/[name].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1,
          name: utils.assetsPath('media/[name].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1,
          name: utils.assetsPath('fonts/[name].[ext]')
        }
      }
    ]
  },
  plugins: [].concat(htmlPlugins()),
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
