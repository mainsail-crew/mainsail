module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  pwa: {
    serviceWorker:false,
    workboxPluginMode:"InjectManifest",
    workboxOptions: {
      //swSrc: './src/registerServiceWorker.js',
    },
    iconPaths: {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon-180x180.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/mstile-150x150.png'
    },
    manifestPath: 'manifest.json',
    name: 'Mainsail',
    themeColor: '#000000',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    manifestOptions: {
      "name": "Mainsail",
      "short_name": "Mainsail",
      "start_url": "/",
      "prefer_related_applications": false,
      "display": "standalone",
      "theme_color": "#000000",
      "background_color": "#000000",
      "icons": [
        {
          "src": "./img/icons/android-chrome-192x192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "./img/icons/android-chrome-512x512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "./img/icons/android-chrome-maskable-192x192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "maskable"
        },
        {
          "src": "./img/icons/android-chrome-maskable-512x512",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "maskable"
        },
        {
          "src": "./img/icons/apple-touch-icon-60x60.png",
          "sizes": "60x60",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "./img/icons/apple-touch-icon-76x76.png",
          "sizes": "76x768",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "./img/icons/apple-touch-icon-120x120.png",
          "sizes": "120x120",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "./img/icons/apple-touch-icon-152x152.png",
          "sizes": "152x152",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "./img/icons/apple-touch-icon-180x180.png",
          "sizes": "180x180",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "./img/icons/favicon-16x16.png",
          "sizes": "16x16",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "./img/icons/favicon-32x32.png",
          "sizes": "32x32",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "./img/icons/msapplication-icon-144x144.png",
          "sizes": "144x144",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "./img/icons/mstile-150x150.png",
          "sizes": "150x150",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "./img/icons/safari-pinned-tab.svg",
          "sizes": "150x150",
          "type": "image/svg+xml",
          "purpose": "any"
        }
      ]
    }
  }
}