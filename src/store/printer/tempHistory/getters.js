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
	}
}