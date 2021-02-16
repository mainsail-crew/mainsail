export default {

	getFilterdEvents: (state, getters, rootState) => {
		let events = state.events

		if (rootState.gui.console.hideWaitTemperatures) {
			const regex = new RegExp('^(?:ok\\s+)?(B|C|T\\d*):')
			events = events.filter(event => !regex.test(event.message))
		}

		if (rootState.gui.console.boolCustomFilters) {
			const filters = rootState.gui.console.customFilters.split('\n')
			filters.forEach(filter => {
				try {
					const regex = new RegExp(filter)
					events = events.filter(event => !regex.test(event.message))
				} catch { window.console.error("Custom console filter '"+filter+"' doesn't work")}
			})
		}

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