import { getDefaultState } from './index'
import Vue from "vue";

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	setStatus(state, payload) {
		if ('version_info' in payload) {
			Object.entries(payload.version_info).forEach(([key, value]) => {
				Vue.set(state, key, value)
			})
		}

		if ('busy' in payload && payload.busy === false) {
			Vue.set(state.updateResponse, 'complete', true)
		}
	},

	setUpdateResponse(state, payload) {
		Vue.set(state, 'updateResponse', payload)

		if (payload.application === "client" && payload.complete) window.location.reload(true)
	}
}