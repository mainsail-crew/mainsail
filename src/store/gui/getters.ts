import {caseInsensitiveSort} from "@/plugins/helpers";
import {GetterTree} from "vuex";
import {GuiState} from "@/store/gui/types";

export const getters: GetterTree<GuiState, any> = {

	getPreheatPresets:(state) => {
		const output = []

		for (const [key, preset] of Object.entries(state.presets)) {
			output.push(Object.assign({}, preset, { index: parseInt(key) }))
		}

		return caseInsensitiveSort(output, 'name')
	},

	getConsoleFilters:(state) => {
		const output = []

		for (const [key, filter] of Object.entries(state.console.customFilters)) {
			output.push(Object.assign({}, filter, { index: key }))
		}

		return caseInsensitiveSort(output, 'name')
	},

	getConsoleFilterRules:(state) => {
		const output = []

		if (state.console.hideWaitTemperatures)
			output.push('^(?:ok\\s+)?(B|C|T\\d*):')

		if (Array.isArray(state.console.customFilters) && state.console.customFilters.length) {
			state.console.customFilters.filter((filter: any) => filter.bool === true).forEach((filter: any) => {
				filter.regex.split("\n").forEach((rule: string) => {
					if (rule !== "") output.push(rule)
				})
			})
		}

		return output
	},

	getWebcams:(state) => {
		const output = []

		for (const [key, webcam] of Object.entries(state.webcam.configs)) {
			output.push(Object.assign({}, webcam, { index: key }))
		}

		return caseInsensitiveSort(output, 'name')
	},

	getDatasetValue: (state) => (payload: any) => {
		if (
			payload.name in state.tempchart.datasetSettings &&
			payload.type in state.tempchart.datasetSettings[payload.name]
		) return state.tempchart.datasetSettings[payload.name][payload.type]

		if (["temperature", "target"].includes(payload.type)) return true

		return false
	},

	getDatasetAdditionalSensorValue: (state) => (payload: any) => {
		if (
			payload.name in state.tempchart.datasetSettings &&
			'additionalSensors' in state.tempchart.datasetSettings[payload.name] &&
			payload.sensor in state.tempchart.datasetSettings[payload.name].additionalSensors
		) return state.tempchart.datasetSettings[payload.name].additionalSensors[payload.sensor]

		return true
	},

	getPresetsFromHeater: state => (payload: any) => {
		interface preset {
			value: number
			values?: {
				[key: string]: {
					bool: boolean
					name: string
					value: number
				}
			}
		}

		const output: preset[] = []

		output.push({
			value: 0
		})

		Object.values(state.presets).forEach((preset: any) => {
			if (
				payload.name in preset.values &&
				preset.values[payload.name].bool &&
				output.findIndex((entry: any) => entry.value === preset.values[payload.name].value) === -1
			) {
				output.push({
					value: preset.values[payload.name].value,
				})
			}
		})

		return output.sort((a: preset,b: preset) => {
			if (a.value > b.value) return -1
			if (a.value < b.value) return 1

			return 0
		})
	}
}
