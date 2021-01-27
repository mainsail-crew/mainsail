import {colorArray, colorChamber, colorHeaterBed} from "@/store/variables";

export default {
	reset({ commit }) {
		commit('reset')
	},

	getHistory({ commit, state }, payload) {
		window.console.log("getHistory")
		window.console.log(payload)

		if (payload !== undefined) {
			Object.entries(payload).sort().forEach(([name, datasets]) => {
				let keySplit = name.split(" ")
				if (keySplit.length > 1) name = keySplit[1]
				const type = keySplit[0]

				if (datasets.temperatures) {
					let now = new Date()
					window.console.log(datasets)

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
							type: "spline",
							name: name,
							legendText: name,
							xValueType: "dateTime",
							dataPoints:[],
							showInLegend: true,
							markerType: 'none',
							toolTipContent: "{name}: {y}°C",
							color: color,
						}

						commit('addDataset', datasetTemperature)
					}

					commit('addValue', {
						name: name,
						value: datasets.temperatures,
						type: type,
						time: now
					})

					if ('targets' in datasets && (type.startsWith("extruder") || type === "heater_bed" || type === "temperature_fan")) {
						let datasetTarget = state.datasets.find(element => element.name === name+"_target")
						if (datasetTarget === undefined) {
							datasetTarget = {
								type: "stepArea",
								name: name+"_target",
								legendText: name+"_target",
								xValueType: "dateTime",
								dataPoints:[],
								showInLegend: false,
								markerType: 'none',
								toolTipContent: "{name}: {y}°C",
								color: datasetTemperature.color,
								fillOpacity: .1,
								lineThickness: 0,
							}

							commit('addDataset', datasetTarget)
						}

						commit('addValue', {
							name: name+"_target",
							value: datasets.targets,
							type: type,
							time: now
						})
					}

					if ('powers' in datasets && (type.startsWith("extruder") || type === "heater_bed")) {
						let datasetPower = state.datasets.find(element => element.name === name+"_power")
						if (datasetPower === undefined) {
							datasetPower = {
								type: "spline",
								name: name+"_power",
								legendText: name+"_power",
								xValueType: "dateTime",
								dataPoints:[],
								showInLegend: false,
								markerType: 'none',
								lineDashType: "dot",
								lineThickness: 1,
								visible: 0,
								toolTipContent: "{name}: {y}%",
								color: datasetTemperature.color,
							}

							commit('addDataset', datasetPower)
						}

						commit('addValue', {
							name: name+"_power",
							value: datasets.powers,
							type: type,
							time: now
						})
					}
				}
			})
		}
	},
}