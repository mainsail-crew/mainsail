import { getDefaultState } from './index'
import { datasetTypesInPercents } from '@/store/variables'
import Vue from "vue";

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

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
				dataset.data.push([
					payload.time,
					Math.round(payload.value * multi * 100)/100
				])

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

	setVisible(state, payload) {
		const datasetName = payload.type !== 'temperature' ? payload.name+'_'+payload.type : payload.name

		const datasetIndex = state.series.findIndex(element => element.name === datasetName)
		if (datasetIndex !== -1) {
			if (payload.type === "target" && 'areaStyle' in state.series[datasetIndex]) {
				Vue.set(state.series[datasetIndex].areaStyle, 'opacity', payload.value ? 0.1 : 0)
				Vue.set(state.series[datasetIndex].emphasis.areaStyle, 'opacity', payload.value ? 0.1 : 0)
			} else if ('lineStyle' in state.series[datasetIndex]) {
				Vue.set(state.series[datasetIndex].lineStyle, 'opacity', payload.value ? 0.9 : 0)
				Vue.set(state.series[datasetIndex].emphasis.lineStyle, 'opacity', payload.value ? 0.9 : 0)
			}
		}
	},

	setColor(state, payload) {
		state.series.forEach(element => {
			if (
				'lineStyle' in element && (
					element.name === payload.name ||
					element.name === payload.name+'_target' ||
					element.name === payload.name+'_power'
				)
			) element.lineStyle.color = payload.value

			if (element.name === payload.name+'_target' && 'areaStyle' in element) {
				element.areaStyle.color = payload.value
			}
		})
	},
}