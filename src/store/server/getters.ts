import {GetterTree} from "vuex";
import {ServerState} from "@/store/server/types";

export const getters: GetterTree<ServerState, any> = {

	getFilteredEvents: (state, getters, rootState, rootGetters) => {
		let events = state.events

		const filters = rootGetters["gui/getConsoleFilterRules"]
		filters.forEach((filter: any) => {
			try {
				const regex = new RegExp(filter)
				events = events.filter(event => !regex.test(event.message))
			} catch { window.console.error("Custom console filter '"+filter+"' doesn't work")}
		})

		return events
	},

	getConfig: (state) => (section: string, attribute: string) => {
		if (
			section in state.config &&
			attribute in state.config[section]
		) return state.config[section][attribute]

		return null
	}
}