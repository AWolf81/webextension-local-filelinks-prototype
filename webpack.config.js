var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var WriteFilePlugin = require('write-file-webpack-plugin')
var FriendlyErrors = require('friendly-errors-webpack-plugin')

var FF = process.env.BROWSER === 'Firefox'; // needed for custom stuff in manifest for Firefox

console.log(process.env.BROWSER)

const manifestAdditionsFF = {
  "applications": {
    "gecko": {
      "id": "webextension_local_filesystem_links@example.org"
    }
  }
};

module.exports = {
  entry: {
    app: './src/main.js',
    background: './src/extension/background.js',
    options: './src/extension/options.js',
    content: './src/extension/content.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    // publicPath: '/dist/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this nessessary.
            'scss': 'vue-style-loader!css-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#source-map',
  plugins: [
    // new webpack.optimize.OccurrenceOrderPlugin(),
    // new webpack.optimize.CommonsChunkPlugin({
    //     names: ['app', 'background', 'options'] // , 'webpack-manifest'] // Specify the common bundle's name.
    // }),
    new CopyWebpackPlugin([
      { // copy host json
        from: 'src/host/',
        to: 'host/'
      },
      {
        from: 'src/static'
      },
      // {output}/file.txt
      {
        from: 'src/manifest.json',
        transform: function(content, path) {
          // add description & version from package.json
          let json = JSON.parse(content.toString('utf8'))
          if (FF) {
            Object.assign(json, manifestAdditionsFF);
          }

          return JSON.stringify(
            Object.assign({}, json, {
              description: process.env.npm_package_description,
              version: process.env.npm_package_version || '0.0.1'
          }), null, 2);
        }
      }
    ]),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      // chunksSortMode: 'none',
      chunks: ['app'], // , 'webpack-manifest'],
      inject: true
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'background.html'),
      filename: 'background.html',
      // chunksSortMode: 'none',
      chunks: ['background'] //, 'webpack-manifest']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'options.html'),
      filename: 'options.html',
      // chunksSortMode: 'none',
      chunks: ['options'] //, 'webpack-manifest']
    }),
    new WriteFilePlugin(),
    new FriendlyErrors()
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
