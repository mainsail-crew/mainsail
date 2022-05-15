import 'core-js/stable' // polyfills for older browsers
import 'regenerator-runtime' // async polyfill used by the gcodeviewer
import 'resize-observer-polyfill' // polyfill needed by the responsive class detection

import Vue from 'vue'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import i18n from '@/plugins/i18n'
import store from '@/store'
import router from '@/plugins/router'

import { registerSW } from 'virtual:pwa-register'

// noinspection JSUnusedGlobalSymbols
const updateSW = registerSW({
    onOfflineReady() {},
})

Vue.config.productionTip = false

// vue-observe-visibility
import VueObserveVisibility from 'vue-observe-visibility'
Vue.use(VueObserveVisibility)

//vue-meta
import VueMeta from 'vue-meta'
Vue.use(VueMeta)

//vue-load-image
import VueLoadImage from 'vue-load-image'
Vue.component('VueLoadImage', VueLoadImage)

//vue-toast-notifications
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { WebSocketPlugin } from '@/plugins/webSocketClient'

Vue.use(VueToast, {
    duration: 3000,
})

//overlayerscrollbars-vue
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue'
import 'overlayscrollbars/css/OverlayScrollbars.css'

Vue.use(OverlayScrollbarsPlugin, {
    className: 'os-theme-light',
    scrollbars: {
        visibility: 'auto',
        autoHide: 'move',
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

// vue-resize
import 'vue-resize/dist/vue-resize.css'
// @ts-ignore
import VueResize from 'vue-resize'
Vue.use(VueResize)

use([SVGRenderer, LineChart, BarChart, LegendComponent, PieChart, DatasetComponent, GridComponent, TooltipComponent])
Vue.component('EChart', ECharts)

//load config.json and init vue
fetch('/config.json')
    .then((res) => res.json())
    .then(async (file) => {
        await store.dispatch('importConfigJson', file)

        const url = store.getters['socket/getWebsocketUrl']
        Vue.use(WebSocketPlugin, {
            url: url,
            store: store,
        })

        if (!store?.state?.remoteMode) Vue.$socket.connect()

        new Vue({
            vuetify,
            router,
            store,
            i18n,
            render: (h) => h(App),
        }).$mount('#app')
    })
    .catch((error) => {
        const p = document.createElement('p')
        const content = document.createTextNode('config.json not found or cannot be decoded!')
        p.appendChild(content)
        document.getElementById('app')?.append(p)
        window.console.error('Error:', error)
    })
