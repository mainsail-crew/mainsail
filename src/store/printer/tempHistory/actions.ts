import {
	colorArray,
	colorChamber,
	colorHeaterBed,
	datasetInterval,
	datasetTypes,
	datasetTypesInPercents
} from "@/store/variables";
import {ActionTree} from "vuex";
import {
	PrinterTempHistoryState,
	PrinterTempHistoryStateSerie,
	PrinterTempHistoryStateSourceEntry
} from "@/store/printer/tempHistory/types"
import {RootState} from "@/store/types";

export const actions: ActionTree<PrinterTempHistoryState, RootState> = {
	reset({ commit }) {
		commit('reset')
	},

	init({ commit, rootGetters, dispatch }, payload) {
		const now = new Date()
		const maxHistory = rootGetters['server/getConfig']('server', 'temperature_store_size') || 1200

		if ('requestParams' in payload) delete payload.requestParams

		if (payload !== undefined) {
			Object.values(payload).forEach((datasetValues: any) => {
				datasetTypes.forEach((datasetKey) => {
					if (datasetKey+'s' in datasetValues) {
						const length = maxHistory - datasetValues[datasetKey+'s'].length
						datasetValues[datasetKey+'s'] = [...Array.from({ length }, () => 0), ...datasetValues[datasetKey+'s']]
					}
				})
			})

			const objectKeys = Object.keys(payload)
			const tempDataset = []
			for (let i = 0; i < maxHistory; i++) {
				const tmpDataset: PrinterTempHistoryStateSourceEntry = {
					date: new Date(now.getTime() - (1000 * (maxHistory - i)))
				}

				objectKeys.forEach((key) => {
					let name = key
					if (key.includes(' ')) name = key.split(' ')[1]

					datasetTypes.forEach((attrKey) => {
						if (attrKey === 'temperature') tmpDataset[name] = payload[key]['temperatures'][i]
						else if (attrKey+'s' in payload[key]) tmpDataset[name+"-"+attrKey] = payload[key][attrKey+'s'][i]
					})
				})

				tempDataset.push(tmpDataset)
			}

			commit('setInitSource', tempDataset)

			const tempDatasetKeys = Object.keys(tempDataset[0]).filter((tmp) => tmp !== "date")
			const masterDatasetKeys = tempDatasetKeys.filter((tmp) => !tmp.includes('-') && !tmp.startsWith('_')).sort()
			const series: PrinterTempHistoryStateSerie[] = []
			let colorNumber = 0

			masterDatasetKeys.forEach((name) => {
				let color = rootGetters["gui/getDatasetValue"]({ name: name, type: 'color' })

				if (!color) {
					switch (name) {
						case 'heater_bed':
							color = colorHeaterBed
							break

						case 'chamber':
							color = colorChamber
							break

						default:
							color = colorArray[colorNumber]
							colorNumber++
							break
					}
				}

				const serie: PrinterTempHistoryStateSerie = {
					id: series.length + 1,
					color: color,
					type: "line",
					name: name,
					encode: { x: 'date', y: name },
					animation: false,
					yAxisIndex: 0,
					lineStyle: {
						color: color,
						width: 2,
						opacity: 0.9,
					},
					showSymbol: false,
					emphasis: {
						lineStyle: {
							color: color,
							width: 2,
							opacity: 0.9
						}
					},
				}

				series.push(serie)

				datasetTypes.forEach((attrKey) => {
					const subName = name+"-"+attrKey

					if (tempDatasetKeys.includes(subName)) {
						const subSerie: PrinterTempHistoryStateSerie = {
							id: series.length + 1,
							color: color,
							type: "line",
							name: subName,
							encode: { x: 'date', y: subName },
							animation: false,
							yAxisIndex: 0,
							lineStyle: {
								color: color,
								width: 2,
								opacity: 0.1,
							},
							showSymbol: false,
							emphasis: {
								lineStyle: {
									color: color,
									width: 2,
									opacity: 0.1
								}
							},
						}

						if (attrKey === "target") {
							subSerie.lineStyle.width = 0
							subSerie.emphasis.lineStyle.width = 0

							subSerie.areaStyle = {
								color: color,
								opacity: 0.1
							}

							subSerie.emphasis.areaStyle = {
								color: color,
								opacity: 0.1
							}
						} else if (datasetTypesInPercents.includes(attrKey)) {
							subSerie.yAxisIndex = 1

							subSerie.lineStyle.width = 1.5
							subSerie.lineStyle.opacity = 0.75
							subSerie.lineStyle.type = 'dotted'
							subSerie.emphasis.lineStyle.width = 1.5
							subSerie.emphasis.lineStyle.opacity = 0.75
							subSerie.emphasis.lineStyle.type = 'dotted'
						}

						series.push(subSerie)
					}
				})
			})

			commit('setInitSeries', series)

			setInterval(() => {
				dispatch("updateSource")
			}, datasetInterval)
		}
	},

	updateSource({ commit, rootState, rootGetters }) {
		if (rootState?.printer?.heaters?.available_sensors?.length) {
			const data: PrinterTempHistoryStateSourceEntry = {
				date: new Date()
			}

			rootState.printer.heaters.available_sensors.forEach((key: string) => {
				let name = key
				if (key.includes(' ')) name = key.split(' ')[1]

				if (rootState.printer && rootState.printer[key]) {
					if ('temperature' in rootState.printer[key]) data[name] = rootState.printer[key].temperature
					if ('target' in rootState.printer[key]) data[name+"-target"] = Math.round(rootState.printer[key].target * 10) / 10
					if ('power' in rootState.printer[key]) data[name+"-power"] = Math.round(rootState.printer[key].power * 1000) / 1000
					if ('speed' in rootState.printer[key]) data[name+"-speed"] = Math.round(rootState.printer[key].speed * 1000) / 1000
				}
			})

			commit('addToSource', {
				data: data,
				maxHistory: rootGetters['server/getConfig']('server', 'temperature_store_size') || 1200
			})
		}
	},
}