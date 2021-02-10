import {caseInsensitiveNameSort} from "@/plugins/helpers";

export default {

	getPreheatPresets:(state) => {
		const output = []

		for (const [key, preset] of Object.entries(state.presets)) {
			output.push({ ...preset, index: key })
		}

		return output.sort(caseInsensitiveNameSort)
	},

	getDatasetValue: (state) => (payload) => {
		if (
			payload.name in state.tempchart.datasetSettings &&
			payload.type in state.tempchart.datasetSettings[payload.name]
		) return state.tempchart.datasetSettings[payload.name][payload.type]

		if (["temperature", "target"].includes(payload.type)) return true

		return false
	},
	getDatasetAdditionalSensorValue: (state) => (payload) => {
		if (
			payload.name in state.tempchart.datasetSettings &&
			'additionalSensors' in state.tempchart.datasetSettings[payload.name] &&
			payload.sensor in state.tempchart.datasetSettings[payload.name]['additionalSensors']
		) return state.tempchart.datasetSettings[payload.name]['additionalSensors'][payload.sensor]

		return {
			'boolList': true
		}
	},
	getPresetsFromHeater: state => (payload) => {
		const output = []

		output.push({
			value: 0
		})

		for (const [, preset] of Object.entries(state.presets)) {
			if (
				payload.name in preset.values &&
				preset.values[payload.name].bool &&
				output.findIndex(entry => entry.value === preset.values[payload.name].value) === -1
			) {
				output.push({
					value: preset.values[payload.name].value,
				})
			}
		}

		return output.sort((a,b) => {
			if (a.value > b.value) return -1
			if (a.value < b.value) return 1

			return 0
		})
	}
}