const webpack = require('webpack')
const generate = require('generate-file-webpack-plugin')
const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

module.exports = {
  productionSourceMap: false,
  "transpileDependencies": [
    "vuetify"
  ],
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          PACKAGE_VERSION: '"' + version + '"'
        }
      }),
      generate({
        file: '.version',
        content: 'v'+version
      })
    ]
  },
  pwa: {
    serviceWorker:false,
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
