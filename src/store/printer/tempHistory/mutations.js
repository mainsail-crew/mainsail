import { getDefaultState } from './index'
import Vue from "vue";

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	addDataset(state, payload) {
		state.datasets.push(payload)
	},

	addValue(state, payload) {
		const multi = payload.name.endsWith("_power") ? 100 : 1
		const dataset = state.datasets.find(element => element.name === payload.name)

		if (dataset !== undefined && payload.value !== undefined) {
			if (Array.isArray(payload.value)) {
				for (let i = payload.value.length; i > 0; i--) {
					dataset.dataPoints.push({
						x: payload.time - (i*1000),
						y: Math.round(payload.value[payload.value.length - i] * multi * 100)/100
					})
				}
			} else {
				dataset.dataPoints.push({
					x: payload.time,
					y: Math.round(payload.value * multi * 100)/100
				})

				let i
				const timeOld = new Date().getTime() - (1000 * 60 * 10)
				while ((i = dataset.dataPoints.findIndex(item => timeOld > item.x)) > -1) {
					dataset.dataPoints.splice(i, 1)
				}
			}
		}
	},

	hidePowerDatasets(state) {
		state.datasets.forEach(element => {
			if (element.name.endsWith("_power")) {
				element.visible = false
			}
		})
	},

	showPowerDatasets(state) {
		state.datasets.forEach(element => {
			if (element.name.endsWith("_power")) {
				element.visible = true
			}
		})
	},

	setVisible(state, payload) {
		const datasetName = payload.type !== 'temperature' ? payload.name+'_'+payload.type : payload.name

		const datasetIndex = state.datasets.findIndex(element => element.name === datasetName)
		if (datasetIndex !== -1) {
			Vue.set(state.datasets[datasetIndex], 'visible', payload.value)


		}
	},

	setColor(state, payload) {
		state.datasets.forEach(element => {
			if (
				element.name === payload.name ||
				element.name === payload.name+'_target' ||
				element.name === payload.name+'_power'
			) {
				element.color = payload.value
			}
		})
	},
}