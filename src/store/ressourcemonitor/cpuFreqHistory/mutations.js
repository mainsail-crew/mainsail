import { getDefaultState } from './index'

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

				if (datasets.ramusage) {
					let max = datasets.ramusage.length;
					for (let i = 0; i < max; i++) {
						let time = new Date(now.getTime() - 1000 * (max - i));

						this.commit('ressourcenmonitor/cpuTempHistory/addValue', {
							name: key,
							value: datasets.ramusage[i],
							type: keySplit[0],
							time: time
						});

						this.commit('ressourcenmonitor/cpuTempHistory/addValue', {
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
		console.log(payload)
	},
	addValue(state, payload) {
		// definations for delete old entries
		let timeOld = new Date().getTime() - (1000 * 60 * 10)
		let minResolution = 1000   // value in ms
		//let deletedIndex

		let mainDataset = state.datasets.find(element => element.name === payload.name)
		console.log(mainDataset)
		if (!mainDataset) {
			switch (payload.name) {
				default: break;
			}

			mainDataset = {
				name: payload.name,
				data: [],
				type: "line",
			}
			mainDataset = state.datasets.push(mainDataset);
		}

		// update current temp in temperature chart
		if (mainDataset && payload.value !== undefined) {
			if (Array.isArray(payload.value)) {
				window.console.log("array")
			} else {
				if (mainDataset.data && mainDataset.data.length) {
					let lastTemp = mainDataset.data[mainDataset.data.length - 1][1]
					let lastTime = mainDataset.data[mainDataset.data.length - 1][0]

					if (
						payload.time - lastTime > minResolution &&
						(lastTemp !== payload.value || payload.time - lastTime > minResolution)
					) {
						if (
							payload.name.includes('_target') &&
							lastTemp !== payload.value
						) {
							mainDataset.data.push([
								payload.time-1,
								lastTemp
							]);
						}

						mainDataset.data.push([
							payload.time-1,
							lastTemp
						]);
					}

					let i
					while ((i = mainDataset.data.findIndex(item => timeOld > item.x)) > -1) {
						mainDataset.data.splice(i, 1)
					}
				} else if (mainDataset.data) {
					mainDataset.data.push([
						payload.time,
						payload.value
					]);
				}
			}
		}
	},
}