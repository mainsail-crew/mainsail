import {colorArray, colorChamber, colorHeaterBed, datasetTypes} from "@/store/variables";
import {convertName} from "@/plugins/helpers";

export default {
	reset({ commit }) {
		commit('reset')
	},

	getHistory({ commit, state, rootGetters }, payload) {
		const now = new Date()
		if (payload !== undefined) {
			Object.entries(payload).sort().forEach(([name, datasets]) => {
				let keySplit = name.split(" ")
				if (keySplit.length > 1) name = keySplit[1]
				const type = keySplit[0]

				if ('temperatures' in datasets) {
					let datasetTemperature = state.datasets.find(element => element.name === name)
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
								color = colorArray[state.datasets.filter(element =>
									!element.name.endsWith("_target") && element.name !== "heater_bed" && element.name !== "chamber"
								).length];
								break;
						}

						datasetTemperature = {
							type: "line",
							name: name,
							legendText: convertName(name),
							xValueType: "dateTime",
							dataPoints:[],
							showInLegend: true,
							markerType: 'circle',
							color: rootGetters["gui/getDatasetValue"]({ name: name, type: 'color' }) || color,
							visible: (rootGetters["gui/getDatasetValue"]({ name: name, type: 'temperature' })) ? 1 : 0,
						}

						commit('addDataset', datasetTemperature)
					} else commit('clearDataset', name)

					commit('addValue', {
						name: name,
						value: datasets.temperatures,
						type: type,
						time: now
					})

					if ('targets' in datasets && (type.startsWith("extruder") || ["heater_bed", "temperature_fan"].includes(type))) {
						let datasetTarget = state.datasets.find(element => element.name === name+"_target")
						if (datasetTarget === undefined) {
							datasetTarget = {
								type: "stepArea",
								name: name+"_target",
								xValueType: "dateTime",
								dataPoints:[],
								showInLegend: false,
								markerType: 'none',
								color: datasetTemperature.color,
								fillOpacity: .1,
								lineThickness: 0,
								visible: (rootGetters["gui/getDatasetValue"]({ name: name, type: 'target' })) ? 1 : 0,
							}

							commit('addDataset', datasetTarget)
						} else commit('clearDataset', name+"_target")

						commit('addValue', {
							name: name+"_target",
							value: datasets.targets,
							type: type,
							time: now
						})
					}

					['power', 'speed'].forEach(additionalType => {
						if (additionalType+"s" in datasets && (type.startsWith("extruder") || ["heater_bed", "temperature_fan"].includes(type))) {
							let datasetAdditinal = state.datasets.find(element => element.name === name+"_"+additionalType)
							if (datasetAdditinal === undefined) {
								datasetAdditinal = {
									type: "line",
									name: name+"_"+additionalType,
									xValueType: "dateTime",
									axisYType: "secondary",
									dataPoints:[],
									showInLegend: false,
									markerType: 'none',
									lineDashType: "dot",
									lineThickness: 1,
									visible: (rootGetters["gui/getDatasetValue"]({ name: name, type: additionalType })) ? 1 : 0,
									color: datasetTemperature.color,
								}

								commit('addDataset', datasetAdditinal)
							} else commit('clearDataset', name+"_"+additionalType)

							commit('addValue', {
								name: name+"_"+additionalType,
								value: datasets[additionalType+"s"],
								type: type,
								time: now
							})
						}
					})
				}
			})
		}
	},

	updateDatasets({ commit, rootState }) {
		if (
			'heaters' in rootState.printer &&
			'available_sensors' in rootState.printer.heaters &&
			rootState.printer.heaters.available_sensors.length
		) {
			const now = new Date()
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
								time: now
							})
						}
					})
				}
			})
		}
	}
}