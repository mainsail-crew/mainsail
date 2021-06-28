import { GuiState } from "@/store/gui/types"
import { Module } from "vuex"
import { actions } from '@/store/gui/actions'
import { mutations } from '@/store/gui/mutations'
import { getters } from '@/store/gui/getters'

export const getDefaultState = (): GuiState => {
	return {
		general: {
			printername: "",
			language: "en",
			displayCancelPrint: false,
			displayZOffsetStandby: false,
		},
		dashboard: {
			boolTempchart: true,
			hiddenMacros: [],
			hiddenTempChart: [],
			control: {
				feedrateXY: 100,
				stepsXY: [ 100, 10, 1 ],
				feedrateZ: 25,
				stepsZ: [ 25, 1, 0.1 ],
				stepsAll: [0.1, 1, 10, 25, 50, 100],
				selectedCrossStep: null,
				reverseX: false,
				reverseY: false,
				reverseZ: false,
				useCross: false
			},
			extruder: {
				feedamount: 25,
				feedamounts: [ 50, 25, 10, 5, 1 ],
				feedrate: 5,
				feedrates: [ 60, 30, 15, 5, 1 ],
			}
		},
		webcam: {
			selectedCam: "",
			boolDashboard: false,
			boolNavi: false,
			configs: [{
				name: 'Default',
				icon: 'mdi-webcam',
				service: "mjpegstreamer-adaptive",
				targetFps: 15,
				url: "/webcam/?action=stream",
				flipX: false,
				flipY: false,
			}],
		},
		tempchart: {
			autoscale: false,
			datasetSettings: {

			},
		},
		console: {
			hideWaitTemperatures: true,
			boolDashboard: true,
			customFilters: [],
		},
		gcodefiles: {
			countPerPage: 10,
			sortBy: 'modified',
			sortDesc: true,
			showHiddenFiles: false,
			showPrintedFiles: true,
			hideMetadataColums: []
		},
		heightmap: {
			probed: true,
			mesh: false,
			flat: false,
			wireframe: true,
			scale: 0.5,
		},
		history: {
			countPerPage: 10,
			toggleChartCol3: 'filament_usage',
			hideColums: [
				'size',
				'modified',
				'end_time',
				'total_duration',
				'filament_total',
				'first_layer_extr_temp',
				'first_layer_bed_temp',
				'first_layer_height',
				'layer_height',
				'object_height',
			]
		},
		settings: {
			configfiles: {
				countPerPage: 10,
				sortBy: 'filename',
				sortDesc: false,
				showHiddenFiles: false,
			}
		},
		editor: {
			minimap: false
		},
		//moonraker DB api dont accept camel case key names
		remotePrinters: [],
		presets: [],
		cooldownGcode: "TURN_OFF_HEATERS"
	}
}

// initial state
const state = getDefaultState()

export const gui: Module<GuiState, any> = {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
