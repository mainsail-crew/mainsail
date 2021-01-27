import { getDefaultState } from './index'

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	addDataset(state, payload) {
		window.console.log("addDataset")
		window.console.log(payload.name)

		state.datasets.push(payload)
	},

	addValue(state, payload) {
		// definations for delete old entries
		let timeOld = new Date().getTime() - (1000 * 60 * 10)
		let minResolution = 1000   // value in ms
		//let deletedIndex

		let mainDataset = state.datasets.find(element => element.name === payload.name)

		// update current temp in temperature chart
		if (mainDataset !== undefined && payload.value !== undefined) {
			if (Array.isArray(payload.value)) {
				for (let i = payload.value.length; i > 0; i--) {
					mainDataset.dataPoints.push({
						x: payload.time - (i*1000),
						y: Math.round(payload.value[payload.value.length - i]*100)/100
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
							y: Math.round(payload.value*100)/100
						});
					}

					let i
					while ((i = mainDataset.dataPoints.findIndex(item => timeOld > item.x)) > -1) {
						mainDataset.dataPoints.splice(i, 1)
					}
				} else if (mainDataset.dataPoints) {
					mainDataset.dataPoints.push({
						x: payload.time,
						y:  Math.round(payload.value*100)/100
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
}