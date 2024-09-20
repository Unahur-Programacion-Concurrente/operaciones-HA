const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');  // Importar Webpack
const dotenv = require('dotenv').config({ path: './.env' });  // Cargar variables de entorno desde .env

module.exports = {
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  mode: process.env.NODE_ENV || 'production',  // Cambia el modo según la variable de entorno
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',    // Nombre del archivo generado en build
      inject: 'body',
    }),
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL),  // Definir API_URL
    }),
  ],
};