import {GetterTree} from "vuex";
import {ServerState} from "@/store/server/types";

export const getters: GetterTree<ServerState, any> = {

	getConsoleEvents: (state) => {
		return [...state.events].slice(-500).reverse() ?? []
	},

	getConfig: (state) => (section: string, attribute: string) => {
		if (
			section in state.config &&
			attribute in state.config[section]
		) return state.config[section][attribute]

		return null
	}
}