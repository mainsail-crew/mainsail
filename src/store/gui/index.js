import actions from './actions'
import mutations from './mutations'
import getters from './getters'

export function getDefaultState() {
	return {
		general: {
			printername: "",
		},
		dashboard: {
			boolWebcam: false,
			boolTempchart: true,
			boolConsole: true,
			hiddenMacros: [],
			hiddenTempChart: [],
			control: {
				feedrateXY: 100,
				stepsXY: [ 100, 10, 1 ],
				feedrateZ: 25,
				stepsZ: [ 25, 1, 0.1 ],
			},
			extruder: {
				feedamounts: [ 50, 25, 10, 5, 1 ],
				feedrates: [ 60, 30, 15, 5, 1 ],
			}
		},
		webcam: {
			url: "",
			rotate: false,
			rotateDegrees: 90,
			flipX: false,
			flipY: false,
			bool: false,
		},
		tempchart: {
			intervalChartUpdate: 1000,
			intervalDatasetUpdate: 500,
			autoscale: false,
			datasetSettings: {

			},
		},
		console: {
			hideWaitTemperatures: true,
			boolCustomFilters: false,
			customFilters: "",
		},
		gcodefiles: {
			countPerPage: 10,
			showHiddenFiles: false,
			hideMetadataColums: []
		},
		settings: {
			configfiles: {
				countPerPage: 10,
				showHiddenFiles: false,
			}
		},
		remotePrinters: [],
		presets: [],
		cooldownGcode: "TURN_OFF_HEATERS"
	}
}

// initial state
const state = getDefaultState()

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}