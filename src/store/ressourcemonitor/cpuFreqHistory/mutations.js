import { getDefaultState } from './index'

var colorArray = []

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

				if (datasets.cpufrequsage) {
					let max = datasets.cpufrequsage.length;
					for (let i = 0; i < max; i++) {
						let time = new Date(now.getTime() - 1000 * (max - i));

						this.commit('ressourcenmonitor/cpuFreqHistory/addValue', {
							name: key,
							value: datasets.cpufrequsage[i],
							type: keySplit[0],
							time: time
						});

						this.commit('ressourcenmonitor/cpuFreqHistory/addValue', {
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
	setColors(state,payload){
		colorArray=payload.colors;
	},
	addValue(state, payload) {
		// definations for delete old entries
		let timeOld = new Date().getTime() - (1000 * 60 * 10)
		let minResolution = 1000   // value in ms
		//let deletedIndex

		let mainDataset = state.datasets.find(element => element.label === payload.name)
		if (!mainDataset) {
			//TODO load hidden sensors from gui store
			//let hidden = this.rootState.gui.dashboard.hiddenTempChart.indexOf(payload.name.toUpperCase()) >= 0;
			let hidden = false

			if (payload.name.includes('_target')) {
				let masterDataset = state.datasets.find(element => element.label === payload.name.replace('_target', ''))

				if (masterDataset) {
					mainDataset = {
						label: payload.name,
						data:[],
						fill: true,
						borderWidth: 0,
						markerType: 'none',
						hidden: hidden,
						backgroundColor: masterDataset.borderColor+'00',
					}
				}
			} else {
				let color = '';
				

				switch (payload.name) {
					default: color = colorArray[state.datasets.filter(element => !element.label.endsWith("_target") && element.label !== "heater_bed" && element.label !== "chamber").length]; break;
				}

				mainDataset = {
					label: payload.name,
					data:[],
					fill: false,
					borderWidth: 2,
					markerType: 'none',
					hidden: hidden,
					borderColor: color,
				}
			}

			mainDataset = state.datasets.push(mainDataset);
		}

		// update current temp in temperature chart
		if (mainDataset && payload.value !== undefined) {
			if (Array.isArray(payload.value)) {
				window.console.log("array")
			} else {
				if (mainDataset.data && mainDataset.data.length) {
					let lastTemp = mainDataset.data[mainDataset.data.length - 1].y
					let lastTime = mainDataset.data[mainDataset.data.length - 1].x

					if (
						payload.time - lastTime > minResolution &&
						(lastTemp !== payload.value || payload.time - lastTime > minResolution)
					) {
						if (
							payload.name.includes('_target') &&
							lastTemp !== payload.value
						) {
							mainDataset.data.push({
								x: payload.time-1,
								y: lastTemp
							});
						}

						mainDataset.data.push({
							x: payload.time,
							y: payload.value
						});
					}

					let i
					while ((i = mainDataset.data.findIndex(item => timeOld > item.x)) > -1) {
						mainDataset.data.splice(i, 1)
					}
				} else if (mainDataset.data) {
					mainDataset.data.push({
						x: payload.time,
						y: payload.value
					});
				}
			}
		}
	},
}