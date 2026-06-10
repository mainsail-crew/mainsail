import 'regenerator-runtime'
import 'resize-observer-polyfill'
import { createApp } from 'vue'
import App from '@/App.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import 'overlayscrollbars/overlayscrollbars.css'

import { WebSocketClient, type WebSocketPluginOptions } from '@/plugins/webSocketClient'
import { SOCKET_KEY } from '@/composables/useSocket'
import vLongpress from '@/directives/longpress'
import vResponsiveClass from '@/directives/responsive-class'

import { defaultMode } from '@/store/variables'
import { setAndLoadLocale } from '@/plugins/i18n'
import router from '@/plugins/router'
import store from '@/store'
import i18n from '@/plugins/i18n'

const vuetify = createVuetify({
    components,
    directives: vuetifyDirectives,
    theme: {
        defaultTheme: 'dark',
        themes: {
            dark: { dark: true, colors: {} },
            light: { dark: false, colors: {} },
        },
    },
    defaults: {
        VBtn: { variant: 'text' },
    },
    display: {
        mobileBreakpoint: 768,
    },
})

const app = createApp(App)

// Provide the same global properties Vue 2 plugins expected
app.config.globalProperties.$vuetify = vuetify

const initLoad = async () => {
    try {
        const base = import.meta.env.BASE_URL ?? '/'
        const res = await fetch(`${base}config.json`)
        const file = (await res.json()) as Record<string, unknown>

        window.console.debug('Loaded config.json')

        await store.dispatch('importConfigJson', file)

        const locale = (file.defaultLocale ?? 'en') as string
        await setAndLoadLocale(locale)

        const mode = file.defaultMode ?? defaultMode
    } catch (e) {
        window.console.error('Failed to load config.json')
        window.console.error(e)
    }

    const url = store.getters['socket/getWebsocketUrl']
    const socket = new WebSocketClient({ url, store: store as unknown as WebSocketPluginOptions['store'] })

    app.provide(SOCKET_KEY, socket)
    app.config.globalProperties.$socket = socket

    if (store?.state?.instancesDB === 'moonraker') socket.connect()
}

app.use(vuetify)
app.use(i18n)
app.use(router)
app.use(VueToast, { duration: 3000, position: 'top-right' })

app.directive('longpress', vLongpress)
app.directive('responsive-class', vResponsiveClass)

initLoad().then(() => {
    app.use(store)
    app.mount('#app')
})
