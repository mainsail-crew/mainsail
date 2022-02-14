import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import { Touch } from 'vuetify/lib/directives'

Vue.use(Vuetify, {
    directives: { Touch },
})

export default new Vuetify({
    theme: {
        dark: true,
        themes: {
            dark: {
                panel: '#1e1e1e',
                toolbar: '#272727',
            },
        },
        options: { customProperties: true },
    },
    icons: {
        iconfont: 'mdi',
    },
    breakpoint: {
        mobileBreakpoint: 768,
    },
})
