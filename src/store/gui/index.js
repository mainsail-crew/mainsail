import actions from './actions'
import mutations from './mutations'
import getters from './getters'

export function getDefaultState() {
	return {
		general: {
			printername: "",
			language: "en",
			displayCancelPrint: false,
			displayZOffsetStandby: false,
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
			selectedCam: "Default",
			bool: false,
			configs: [
				{
					name: 'Default',
					icon: 'mdi-webcam',
					config: {
						service: "mjpegstreamer",
						targetFps: 25,
						url: "/webcam/?action=stream",
						flipX: false,
						flipY: false,
					}
				}
			],
		},
		tempchart: {
			intervalChartUpdate: 1000,
			intervalDatasetUpdate: 1000,
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
			showPrintedFiles: true,
			hideMetadataColums: []
		},
		history: {
			countPerPage: 10,
			toggleChartCol3: 'filament_usage',
			hideColums: []
		},
		settings: {
			configfiles: {
				countPerPage: 10,
				showHiddenFiles: false,
			}
		},
		//moonraker DB api dont accept camel case key names
		remote_printers: [],
		presets: [],
		//moonraker DB api dont accept camel case key names
		cooldown_gcode: "TURN_OFF_HEATERS"
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
