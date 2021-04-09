import Vue from "vue"

export default {
    reportError(state, payload) {
        window.console.error(payload)
    },

	setNaviDrawer(state, payload) {
		Vue.set(state, "naviDrawer", payload)
	},

    void() {

    },
}
