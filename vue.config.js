const webpack = require('webpack')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          PACKAGE_VERSION: '"' + version + '"'
        }
      }),
      new SWPrecacheWebpackPlugin({
        cacheId: 'mailsail',
        filename: 'service-worker-cache.js',
        staticFileGlobs: ['dist/**/*.{js,css}', '/'],
        minify: true,
        stripPrefix: 'dist/',
        dontCacheBustUrlsMatching: /\.\w{6}\./
      }),
    ]
  },
  pwa: {
    serviceWorker:true,
    iconPaths: {
      favicon16: 'img/icons/favicon-16x16.png',
      favicon32: 'img/icons/favicon-32x32.png',
      appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
      msTileImage: 'img/icons/mstile-150x150.png'
    },
    manifestPath: 'manifest.json',
    name: 'Mainsail',
    themeColor: '#121212',
    msTileColor: '#121212',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    manifestOptions: {
      "short_name": "Mainsail",
      "name": "Mainsail",
      "start_url": "/",
      "display": "standalone",
      "theme_color": "#D51F26",
      "background_color": "#121212",
      "icons": [
        {
          "src": "./img/icons/icon-196-maskable.png",
          "sizes": "196x196",
          "type": "image/png",
          "purpose": "maskable",
        },
        {
          "src": "./img/icons/icon-512-maskable.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "maskable",
        },
      ]
    }
  }
}
