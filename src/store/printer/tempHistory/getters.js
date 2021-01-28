export default {

	getDatasetColor: state => (name) => {
		let dataset = state.datasets.find(element => element.name === name)

		return (dataset) ? dataset.color : null
	},

	getDataset: state => (name) => {
		return state.datasets.find(element => element.name === name)
	},
}