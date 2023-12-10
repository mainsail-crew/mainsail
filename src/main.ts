import 'regenerator-runtime' // async polyfill used by the gcodeviewer
import 'resize-observer-polyfill' // polyfill needed by the responsive class detection
import Vue from 'vue'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import i18n, { setAndLoadLocale } from '@/plugins/i18n'
import store from '@/store'
import router from '@/plugins/router'
import { WebSocketPlugin } from '@/plugins/webSocketClient'
// vue-observe-visibility
import { ObserveVisibility } from 'vue-observe-visibility'
//vue-meta
import VueMeta from 'vue-meta'
//vue-load-image
import VueLoadImage from 'vue-load-image'
//vue-toast-notifications
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
//overlayerscrollbars-vue
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue'
import 'overlayscrollbars/css/OverlayScrollbars.css'
// Directives
import './directives/longpress'
import './directives/responsive-class'

// Echarts
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'

// import ECharts modules manually to reduce bundle size
import { SVGRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { DatasetComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
// vue-resize
import 'vue-resize/dist/vue-resize.css'
// @ts-ignore
import VueResize from 'vue-resize'
import { defaultTheme } from './store/variables'

Vue.config.productionTip = false

Vue.directive('observe-visibility', ObserveVisibility)

Vue.use(VueMeta)

Vue.component('VueLoadImage', VueLoadImage)

Vue.use(VueToast, {
    duration: 3000,
})

const isSafari = navigator.userAgent.includes('Safari') && navigator.userAgent.search('Chrome') === -1
const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints > 0 && navigator.maxTouchPoints !== 256)
Vue.use(OverlayScrollbarsPlugin, {
    className: 'os-theme-light',
    scrollbars: {
        visibility: 'auto',
        autoHide: isSafari && isTouch ? 'scroll' : 'move',
    },
})

use([SVGRenderer, LineChart, BarChart, LegendComponent, PieChart, DatasetComponent, GridComponent, TooltipComponent])
Vue.component('EChart', ECharts)

Vue.use(VueResize)

const initLoad = async () => {
    try {
        //load config.json
        const res = await fetch('/config.json')
        const file = (await res.json()) as Record<string, unknown>

        window.console.debug('Loaded config.json')

        await store.dispatch('importConfigJson', file)
        if ('defaultLocale' in file) {
            await setAndLoadLocale(file.defaultLocale as string)
        }

        // Handle theme outside of store init and before vue mount for consistency in dialog
        const theme = file.defaultTheme ?? defaultTheme
        vuetify.framework.theme.dark = theme !== 'light'
    } catch (e) {
        window.console.error('Failed to load config.json')
        window.console.error(e)
    }

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
