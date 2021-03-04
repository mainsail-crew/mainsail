import {colorArray, colorChamber, colorHeaterBed, datasetTypes} from "@/store/variables";

export default {
	reset({ commit }) {
		commit('reset')
	},

	getHistory({ commit, state, rootGetters }, payload) {
		const now = new Date()
		const maxHistory = rootGetters['server/getConfig']('server', 'temperature_store_size') || 1200

		if (payload !== undefined) {
			Object.entries(payload).sort().forEach(([name, datasets]) => {
				let keySplit = name.split(" ")
				if (keySplit.length > 1) name = keySplit[1]
				const type = keySplit[0]

				if ('temperatures' in datasets) {
					let datasetTemperature = state.series.find(element => element.name === name)
					if (datasetTemperature === undefined) {
						let color = ''

						switch (name) {
							case 'heater_bed':
								color = colorHeaterBed;
								break;
							case 'chamber':
								color = colorChamber;
								break;
							default:
								color = colorArray[state.series.filter(element =>
									'name' in element &&
									!element.name.endsWith("_target") &&
									element.name !== "heater_bed" &&
									element.name !== "chamber"
								).length];
								break;
						}

						datasetTemperature = {
							type: "line",
							name: name,
							lineStyle: {
								color: rootGetters["gui/getDatasetValue"]({ name: name, type: 'color' }) || color,
								width: 2,
								opacity: (rootGetters["gui/getDatasetValue"]({ name: name, type: 'temperature' })) ? 0.9 : 0
							},
							symbol: 'none',
							emphasis: {
								lineStyle: {
									color: rootGetters["gui/getDatasetValue"]({ name: name, type: 'color' }) || color,
									width: 2,
									opacity: (rootGetters["gui/getDatasetValue"]({ name: name, type: 'temperature' })) ? 0.9 : 0
								}
							},
							data: [],
						}

						commit('addSeries', datasetTemperature)
					} else commit('clearDataset', name)

					commit('addValue', {
						name: name,
						value: datasets.temperatures,
						type: type,
						time: now,
						maxHistory: maxHistory
					})

					if ('targets' in datasets && (type.startsWith("extruder") || ["heater_bed", "temperature_fan"].includes(type))) {
						let datasetTarget = state.series.find(element => element.name === name+"_target")
						if (datasetTarget === undefined) {
							datasetTarget = {
								type: "line",
								name: name+"_target",
								lineStyle: {
									color: datasetTemperature.lineStyle.color,
									width: 0,
								},
								areaStyle: {
									color: datasetTemperature.lineStyle.color,
									opacity: (rootGetters["gui/getDatasetValue"]({ name: name, type: 'target' })) ? 0.1 : 0
								},
								emphasis: {
									lineStyle: {
										color: datasetTemperature.lineStyle.color,
										width: 0,
									},
									areaStyle: {
										color: datasetTemperature.lineStyle.color,
										opacity: (rootGetters["gui/getDatasetValue"]({ name: name, type: 'target' })) ? 0.1 : 0
									},
								},
								symbol: 'none',
								data: [],
							}

							commit('addSeries', datasetTarget)
						} else commit('clearDataset', name+"_target")

						commit('addValue', {
							name: name+"_target",
							value: datasets.targets,
							type: type,
							time: now,
							maxHistory: maxHistory
						})
					}

					['power', 'speed'].forEach(additionalType => {
						if (additionalType+"s" in datasets && (type.startsWith("extruder") || ["heater_bed", "temperature_fan"].includes(type))) {
							let datasetAdditinal = state.series.find(element => element.name === name+"_"+additionalType)
							if (datasetAdditinal === undefined) {
								datasetAdditinal = {
									type: "line",
									name: name+"_"+additionalType,
									yAxisIndex: 1,
									lineStyle: {
										color: datasetTemperature.lineStyle.color,
										width: 1,
										type: 'dotted',
										opacity: (rootGetters["gui/getDatasetValue"]({ name: name, type: additionalType })) ? 0.9 : 0
									},
									emphasis: {
										lineStyle: {
											color: datasetTemperature.lineStyle.color,
											width: 1,
											type: 'dotted',
											opacity: (rootGetters["gui/getDatasetValue"]({ name: name, type: additionalType })) ? 0.9 : 0
										},
									},
									symbol: 'none',
									data: [],
								}

								commit('addSeries', datasetAdditinal)
							} else commit('clearDataset', name+"_"+additionalType)

							commit('addValue', {
								name: name+"_"+additionalType,
								value: datasets[additionalType+"s"],
								type: type,
								time: now,
								maxHistory: maxHistory
							})
						}
					})
				}
			})
		}
	},

	updateDatasets({ commit, rootState, rootGetters }) {
		if (
			'heaters' in rootState.printer &&
			'available_sensors' in rootState.printer.heaters &&
			rootState.printer.heaters.available_sensors.length
		) {
			const now = new Date()
			const maxHistory = rootGetters['server/getConfig']('server', 'temperature_store_size') || 1200

			rootState.printer.heaters.available_sensors.forEach((objectName) => {
				if (objectName in rootState.printer) {
					const objectNameSplits = objectName.split(" ")
					let name = objectNameSplits[0]
					if (["temperature_fan", "temperature_sensor", "heater_generic"].includes(objectNameSplits[0])) name = objectNameSplits[1]

					datasetTypes.forEach(datasetType => {
						if (datasetType in rootState.printer[objectName]) {
							commit('addValue', {
								name: datasetType === "temperature" ? name : name+"_"+datasetType,
								value: rootState.printer[objectName][datasetType],
								type: objectNameSplits[0],
								time: now,
								maxHistory: maxHistory
							})
						}
					})
				}
			})
		}
	}
}