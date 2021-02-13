export default {

	getDatasetColor: state => (name) => {
		let dataset = state.series.find(element => element.name === name)

		return (dataset && 'lineStyle' in dataset) ? dataset.lineStyle.color : null
	},

	getSeries: state => (name) => {
		return state.series.find(element => element.name === name)
	},
}