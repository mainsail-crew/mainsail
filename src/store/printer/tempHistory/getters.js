import {datasetTypes, datasetTypesInPercents} from '@/store/variables'

export default {

	getDatasetColor: state => (name) => {
		let dataset = state.series.find(element => element.name === name)

		return (dataset && 'lineStyle' in dataset) ? dataset.lineStyle.color : null
	},

	getSeries: state => (name) => {
		return state.series.find(element => element.name === name)
	},

	getBoolDisplayPwmAxis: (state, getter) => {
		const legends = getter["getSelectedLegends"]

		return Object.keys(legends).filter(key => {
			return (
				legends[key] === true && (
					key.endsWith('-power') ||
					key.endsWith('-speed')
				)
			)
		}).length > 0
	},

	getAvg: state => (name, serieName) => {
		const key = serieName && serieName !== 'temperature' ? name+'-'+serieName : name
		const maxTime = new Date().getTime() - (1000 * 60)
		let value = 0
		let counter = 0

		state.source.filter(data => data.date > maxTime).forEach(item => {
			if (key in item) {
				value += item[key]
				counter++
			}
		})

		if (counter && datasetTypesInPercents.includes(serieName)) return (value / counter) * 100
		else if (counter) return (value / counter)

		return 0
	},

	getAvgPower: (state, getters) => (name) => {
		return getters['getAvg'](name, 'power')
	},

	getAvgSpeed: (state, getters) => (name) => {
		return getters['getAvg'](name, 'speed')
	},

	getSelectedLegends: (state, getters, rootState, rootGetters) => {
		const selected = {}

		if (rootState.printer.heaters?.available_sensors?.length) {
			rootState.printer.heaters?.available_sensors.forEach((key) => {
				if (key in rootState.printer) {
					let name = key
					if (key.includes(' ')) name = key.split(' ')[1]

					datasetTypes.forEach(datasetType => {
						if (datasetType in rootState.printer[key]) {
							const tmpName = datasetType === 'temperature' ? name : name+'-'+datasetType
							selected[tmpName] = rootGetters['gui/getDatasetValue']({name: name, type: datasetType})
						}
					})
				}
			})
		}

		return selected
	},
}