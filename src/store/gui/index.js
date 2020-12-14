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
			calibrateweight1: 0,
			offset1: 0,
			referenceunit1: 0,
			raw1: 0,
			tare1: 0,
			position1: '',
			calibrateweight2: 0,
			offset2: 0,
			referenceunit2: 0,
			raw2: 0,
			tare2: 0,
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
		preheatbutton: {
			profiles: [
				{
					id: 1,
					material: "pla",
					heater: 185,
					bed:50
				},
				{
					id: 2,
					material: "petg",
					heater: 200,
					bed:70
				},
				{
					id: 3,
					material: "abs",
					heater: 230,
					bed:90
				},
				{
					id: 4,
					material: "",
					heater: 0,
					bed:0
				},
				{
					id: 5,
					material: "",
					heater: 0,
					bed:0
				},
			]
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