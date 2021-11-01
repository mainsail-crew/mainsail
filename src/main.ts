import Vue from 'vue'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import i18n from '@/plugins/i18n'
import './plugins/longpress'
import store from '@/store'
import router from '@/plugins/router'

Vue.config.productionTip = false

// vue-observe-visibility
import VueObserveVisibility from 'vue-observe-visibility'
Vue.use(VueObserveVisibility)

//vue-headful
import vueHeadful from 'vue-headful'
Vue.component('vue-headful', vueHeadful)

//vue-load-image
import VueLoadImage from 'vue-load-image'
Vue.component('vue-load-image', VueLoadImage)

//vue-toast-notification
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import {WebSocketPlugin} from '@/plugins/webSocketClient'

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
        autoHide: 'scroll'
    }
})

//vue-echarts-ts
import { plugin } from 'echarts-for-vue'
import * as echarts from 'echarts/core'
Vue.use(plugin, { echarts })

//load config.json and init vue
fetch('/config.json')
    .then(res => res.json())
    .then(file => {
        store.commit('socket/setData', file)

        const url = store.getters['socket/getWebsocketUrl']
        Vue.use(WebSocketPlugin, {
            url: url,
            store: store,
        })

        if (!store?.state?.socket?.remoteMode) Vue.$socket.connect()

        new Vue({
            vuetify,
            router,
            store,
            i18n,
            render: h => h(App)
        }).$mount('#app')

    })
    .catch((error) => {
        const p = document.createElement('p')
        const content = document.createTextNode('config.json not found or cannot be decoded!')
        p.appendChild(content)
    document.getElementById('app')?.append(p)
    window.console.error('Error:', error)
    })


