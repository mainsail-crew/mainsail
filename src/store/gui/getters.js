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
	}
}