import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'


Vue.use(Vuetify)

export default new Vuetify({
	theme: { dark: true },
	icons: {
		iconfont: 'mdi',
	},
	breakpoint: {
		mobileBreakpoint: 768
	}
})
