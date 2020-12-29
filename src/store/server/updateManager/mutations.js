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

	addUpdateResponse(state, payload) {
		if (state.updateResponse.application !== payload.application)
			Vue.set(state.updateResponse, 'application', payload.application)

		if (state.updateResponse.complete !== payload.complete)
			Vue.set(state.updateResponse, 'complete', payload.complete)

		state.updateResponse.messages.push({
			date: new Date(),
			message: payload.message
		})
	},

	resetUpdateResponse(state) {
		Vue.set(state, 'updateResponse', {
			application: '',
			complete: true,
			messages: []
		})
	}
}