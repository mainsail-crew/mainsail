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
			boolScale: false,
			boolScaleAvailable: true,
			hiddenMacros: [],
			hiddenTempChart: [],
		},
		scale: {
			offset1: 0,
			tare1: 0,
			raw1: 0,
			position1: '',
			offset2: 0,
			tare2: 0,
			raw2: 0,
			position2: '',
		},
		webcam: {
			url: "",
			rotate: false,
			rotateDegrees: 90,
			flipX: false,
			flipY: false,
			bool: false,
		},
		discord: {
			token: "",
			prefix: "ms!",
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