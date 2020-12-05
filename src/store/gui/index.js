import actions from './actions'
import mutations from './mutations'
import getters from './getters'

export function getDefaultState() {
	return {
		general: {
			printername: "",
		},
		dashboard: {
			boolWebcam: true,
			boolTempchart: true,
			boolConsole: false,
			hiddenMacros: [],
			hiddenTempChart: [],
		},
		webcam: {
			url: "",
			rotate: false,
			rotateDegrees: 90,
			flipX: false,
			flipY: false,
			bool: false,
		},
		gcodefiles: {
			countPerPage: 10,
			showHiddenFiles: true,
			showMetadata: {
				size: true,
				modified: true,
				object_height: true,
				layer_height: true,
				filament_total: true,
				estimated_time: true,
				slicer: true,
			}
		},
		settings: {
			configfiles: {
				countPerPage: 10,
				showHiddenFiles: false,
			}
		}
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