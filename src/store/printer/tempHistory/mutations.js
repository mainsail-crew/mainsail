import { getDefaultState } from './index'
import { datasetTypesInPercents } from '@/store/variables'
import Vue from "vue";

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	setInitSource(state, payload) {
		Vue.set(state, 'source', payload)
	},

	setInitSeries(state, payload) {
		Vue.set(state, 'series', payload)
	},

	addToSource(state, payload) {
		state.source.push(payload.data)
		while (state.source.length > payload.maxHistory) state.source.splice(0, 1)
	},

	//old shit...
	addSeries(state, payload) {
		state.series.push(payload)
	},

	addValue(state, payload) {
		let multi = 1
		datasetTypesInPercents.forEach(element => {
			if (payload.name.endsWith("_"+element)) multi = 100
		})

		const dataset = state.series.find(element => element.name === payload.name)
		if (dataset !== undefined && payload.value !== undefined) {
			if (Array.isArray(payload.value)) {
				for (let i = payload.value.length; i > 0; i--) {
					dataset.data.push([
						payload.time - (i*1000),
						Math.round(payload.value[payload.value.length - i] * multi * 100)/100
					])
				}
			} else {
				if (
					dataset.data.length &&
					dataset.data[dataset.data.length-1][0] < payload.time
				) {
					dataset.data.push([
						payload.time,
						Math.round(payload.value * multi * 100)/100
					])
				}

				let i
				const timeOld = new Date().getTime() - (1000 * payload.maxHistory)
				while ((i = dataset.data.findIndex(item => timeOld > item[0])) > -1) {
					dataset.data.splice(i, 1)
				}
			}
		}
	},

	clearDataset(state, payload) {
		let dataset = null
		const series = state.series.find(element => element.name === payload.name)
		if (series) dataset = state.datasets[series.datasetIndex]

		if (dataset) {
			Vue.set(dataset, 'source', [])
		}
	},

	setColor(state, payload) {
		state.series.filter(serie => {
			return payload.name === serie.name || serie.name.startsWith(payload.name+'-')
		}).forEach(serie => {
			serie.color = payload.value
			serie.lineStyle.color = payload.value
			serie.emphasis.lineStyle.color = payload.value

			if (serie.name.endsWith('-target')) {
				serie.areaStyle.color = payload.value
				serie.emphasis.areaStyle.color = payload.value
			}
		})
	},
}