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
		// definations for delete old entries
		let timeOld = new Date().getTime() - (1000 * 60 * 10)
		let minResolution = 1000   // value in ms
		const multi = payload.name.endsWith("_power") ? 100 : 1
		//let deletedIndex

		let mainDataset = state.datasets.find(element => element.name === payload.name)

		// update current temp in temperature chart
		if (mainDataset !== undefined && payload.value !== undefined) {
			if (Array.isArray(payload.value)) {
				for (let i = payload.value.length; i > 0; i--) {
					mainDataset.dataPoints.push({
						x: payload.time - (i*1000),
						y: Math.round(payload.value[payload.value.length - i] * multi * 100)/100
					})
				}
			} else {
				if (mainDataset.dataPoints && mainDataset.dataPoints.length) {
					let lastTemp = mainDataset.dataPoints[mainDataset.dataPoints.length - 1].y
					let lastTime = mainDataset.dataPoints[mainDataset.dataPoints.length - 1].x

					if (
						payload.time - lastTime > minResolution &&
						(lastTemp !== payload.value || payload.time - lastTime > minResolution)
					) {
						mainDataset.dataPoints.push({
							x: payload.time,
							y: Math.round(payload.value * multi * 100)/100
						});
					}

					let i
					while ((i = mainDataset.dataPoints.findIndex(item => timeOld > item.x)) > -1) {
						mainDataset.dataPoints.splice(i, 1)
					}
				} else if (mainDataset.dataPoints) {
					mainDataset.dataPoints.push({
						x: payload.time,
						y:  Math.round(payload.value * multi * 100)/100
					});
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