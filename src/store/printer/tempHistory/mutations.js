import { getDefaultState } from './index'
import { colorArray, colorChamber, colorHeaterBed } from "@/store/variables"

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},
	
	setHistory(state, payload) {
		let now = new Date();

		if (payload !== undefined) {
			Object.entries(payload).sort().forEach(([key, datasets]) => {
				let keySplit = key.split(" ");

				if (keySplit.length > 1) key = keySplit[1];

				if (datasets.temperatures) {
					let max = datasets.temperatures.length;
					for (let i = 0; i < max; i++) {
						let time = new Date(now.getTime() - 1000 * (max - i));

						this.commit('printer/tempHistory/addValue', {
							name: key,
							value: datasets.temperatures[i],
							type: keySplit[0],
							time: time
						});

						this.commit('printer/tempHistory/addValue', {
							name: key+'_target',
							value: datasets.targets[i],
							type: keySplit[0],
							time: time
						});
					}
				}
			});
		}
	},

	addValue(state, payload) {
		// definations for delete old entries
		let timeOld = new Date().getTime() - (1000 * 60 * 10)
		let minResolution = 1000   // value in ms
		//let deletedIndex

		let mainDataset = state.datasets.find(element => element.name === payload.name)
		if (!mainDataset) {
			//TODO load hidden sensors from gui store
			//let hidden = this.rootState.gui.dashboard.hiddenTempChart.indexOf(payload.name.toUpperCase()) >= 0;
			//let hidden = false

			if (payload.name.includes('_target')) {
				let masterDataset = state.datasets.find(element => element.name === payload.name.replace('_target', ''))

				if (masterDataset) {
					mainDataset = {
						type: "stepArea",
						name: payload.name,
						legendText: payload.name,
						xValueType: "dateTime",
						dataPoints:[],
						showInLegend: false,
						markerType: 'none',
						fillOpacity: .3,
						lineThickness: 0,
						toolTipContent: "{name}: {y}°C",
						color: masterDataset.color || '#666'
					}
				}
			} else {
				let color = '';

				switch (payload.name) {
					case 'heater_bed': color = colorHeaterBed; break;
					case 'chamber': color = colorChamber; break;
					default: color = colorArray[state.datasets.filter(element => !element.name.endsWith("_target") && element.name !== "heater_bed" && element.name !== "chamber").length]; break;
				}

				mainDataset = {
					type: "spline",
					name: payload.name,
					legendText: payload.name,
					xValueType: "dateTime",
					dataPoints:[],
					showInLegend: true,
					markerType: 'none',
					toolTipContent: "{name}: {y}°C",
					color: color,
				}
			}

			mainDataset = state.datasets.push(mainDataset);
		}

		// update current temp in temperature chart
		if (mainDataset && payload.value !== undefined) {
			if (Array.isArray(payload.value)) {
				for (let i = 0; i < payload.value.length; i++) {
					mainDataset.data.push({
						x: payload.time - 1000 * i,
						y: Math.round(payload.value[i]*100)/100
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
}