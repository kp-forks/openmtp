'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const devConfig = require('./webpack.config.dev');
const prodConfig = require('./webpack.config.prod');
const IS_DEV = process.env.NODE_ENV !== 'production';
const IS_PROD = process.env.NODE_ENV === 'production';
const buildPath = path.join(__dirname, '..');

const baseConfig = {
  mode: process.env.NODE_ENV,
  entry: {
    index: './docs/index.js'
  },
  output: {
    filename: 'bundle/[name].[hash:20].js',
    path: buildPath
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './docs/templates/index.html',
      inject: true,
      chunks: ['index'],
      filename: 'index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  edge: '12'
                }
              }
            ]
          ],
          cacheDirectory: true
        }
      },
      {
        test: /\.(?:ico|jpe?g|png|gif|webp)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'bundle/[name].[hash:20].[ext]'
            }
          }
        ]
      }
    ]
  }
};

module.exports = merge.smart(baseConfig, IS_PROD ? prodConfig : devConfig);
