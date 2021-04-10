export default {

	getDatasetColor: state => (name) => {
		let dataset = state.series.find(element => element.name === name)

		return (dataset && 'lineStyle' in dataset) ? dataset.lineStyle.color : null
	},

	getSeries: state => (name) => {
		return state.series.find(element => element.name === name)
	},

	getCurrentMaxTemp: state => {
		let maxTemp = 0

		state.series.forEach(serie => {
			if (
				serie.name.lastIndexOf("_") === -1 ||
				!['power', 'speed'].includes(serie.name.substr(serie.name.lastIndexOf("_")+1))
			) {
				if (
					serie.data.length && (
						(
							'lineStyle' in serie &&
							'opacity' in serie.lineStyle &&
							serie.lineStyle.opacity
						) || (
							'areaStyle' in serie &&
							'opacity' in serie.areaStyle &&
							serie.areaStyle.opacity
						)
					)
				) {
					const max = Math.max(...serie.data.map(data => data[1]))
					if (maxTemp < max) maxTemp = max
				}
			}
		})

		return Math.ceil((maxTemp + 1) / 10) * 10
	},

	getBoolDisplayPwmAxis: state => {
		return state.series.findIndex(serie =>
			serie.name.lastIndexOf("_") &&
			['power', 'speed'].includes(serie.name.substr(serie.name.lastIndexOf("_")+1)) &&
			'lineStyle' in serie &&
			'opacity' in serie.lineStyle &&
			serie.lineStyle.opacity > 0
		) !== -1
	},

	getAvg: state => (name, serieName) => {
		const serie = state.series.find((serie) => serie.name === name+"_"+serieName)
		if (serie && 'data' in serie && serie.data.length) {
			const maxTime = new Date().getTime() - (1000 * 60)
			const data = serie.data.filter((item) => item[0] > maxTime)

			if (data.length) {
				let value = 0

				data.forEach((item) => {
					value += item[1]
				})

				return value / data.length
			}
		}

		return 0
	},

	getAvgPower: (state, getters) => (name) => {
		return getters['getAvg'](name, 'power')
	},

	getAvgSpeed: (state, getters) => (name) => {
		return getters['getAvg'](name, 'speed')
	},
}