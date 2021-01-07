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
			boolScale: false,
			boolScaleAvailable: false,
			boolNeopixelCenterAvailable: false,
			hiddenMacros: [],
			hiddenTempChart: [],
		},
		neopixelcenter:{
			color:"#FFFFFFFF",
			stripname:"",
		},
		modules: {
			scaleUrl: "",
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