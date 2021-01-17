import {caseInsensitiveNameSort} from "@/plugins/helpers";

export default {

	getPreheatPresets:(state) => {
		const output = []

		for (const [key, preset] of Object.entries(state.presets)) {
			output.push({ ...preset, index: key })
		}

		return output.sort(caseInsensitiveNameSort)
	}
}