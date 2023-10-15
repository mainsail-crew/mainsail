import 'core-js/stable' // polyfills for older browsers
import 'regenerator-runtime' // async polyfill used by the gcodeviewer
import 'resize-observer-polyfill' // polyfill needed by the responsive class detection

import Vue from 'vue'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import i18n from '@/plugins/i18n'
import store from '@/store'
import router from '@/plugins/router'
import { WebSocketPlugin } from '@/plugins/webSocketClient'

Vue.config.productionTip = false

// vue-observe-visibility
import { ObserveVisibility } from 'vue-observe-visibility'
Vue.directive('observe-visibility', ObserveVisibility)

//vue-meta
import VueMeta from 'vue-meta'
Vue.use(VueMeta)

//vue-load-image
import VueLoadImage from 'vue-load-image'
Vue.component('VueLoadImage', VueLoadImage)

//vue-toast-notifications
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

Vue.use(VueToast, {
    duration: 3000,
})

//overlayerscrollbars-vue
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue'
import 'overlayscrollbars/css/OverlayScrollbars.css'

const isSafari = navigator.userAgent.includes('Safari') && navigator.userAgent.search('Chrome') === -1
const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints > 0 && navigator.maxTouchPoints !== 256)
Vue.use(OverlayScrollbarsPlugin, {
    className: 'os-theme-light',
    scrollbars: {
        visibility: 'auto',
        autoHide: isSafari && isTouch ? 'scroll' : 'move',
    },
})

// Directives
import './directives/longpress'
import './directives/responsive-class'

// Echarts
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'

// import ECharts modules manually to reduce bundle size
import { SVGRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent, DatasetComponent } from 'echarts/components'

use([SVGRenderer, LineChart, BarChart, LegendComponent, PieChart, DatasetComponent, GridComponent, TooltipComponent])
Vue.component('EChart', ECharts)

// vue-resize
import 'vue-resize/dist/vue-resize.css'
// @ts-ignore
import VueResize from 'vue-resize'
import { defaultTheme } from './store/variables'
Vue.use(VueResize)

const initLoad = async () => {
    //load config.json
    await fetch('/config.json')
        .then((res) => res.json())
        .then(async (file) => {
            window.console.debug('Loaded config.json')

            store.dispatch('importConfigJson', file)
            if ('defaultLocale' in file) i18n.locale = file.defaultLocale

            // Handle theme outside of store init and before vue mount for consistency in dialog
            let theme = file.defaultTheme ?? defaultTheme
            const uiSettingsUrl =
                store.getters['socket/getUrl'] + '/server/database/item?namespace=mainsail&key=uiSettings'
            const response = await fetch(uiSettingsUrl)
                .then((response) => response?.json())
                .catch(() => undefined)
            if (response.result?.value && Object.keys(response.result?.value).includes('theme'))
                theme = response.result?.value['theme']
            vuetify.framework.theme.dark = theme == 'light' ? false : true
        })
        .catch(() => window.console.error('config.json not found or cannot be decoded!'))

    const url = store.getters['socket/getWebsocketUrl']
    Vue.use(WebSocketPlugin, { url, store })
    if (store?.state?.instancesDB === 'moonraker') Vue.$socket.connect()
}

initLoad().then(() =>
    new Vue({
        vuetify,
        router,
        store,
        i18n,
        render: (h) => h(App),
    }).$mount('#app')
)
