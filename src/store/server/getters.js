export default {

	getFilterdEvents: (state, getters, rootState, rootGetters) => {
		let events = state.events

		const filters = rootGetters["gui/getConsoleFilterRules"]
		filters.forEach(filter => {
			try {
				const regex = new RegExp(filter)
				events = events.filter(event => !regex.test(event.message))
			} catch { window.console.error("Custom console filter '"+filter+"' doesn't work")}
		})

		return events
	},

	getConfig: (state) => (section, attribute) => {
		if (
			section in state.config &&
			attribute in state.config[section]
		) return state.config[section][attribute]

		return null
	}
}