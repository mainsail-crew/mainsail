import { GetterTree } from "vuex"
import { ServerPowerState } from "@/store/server/power/types"

export const getters: GetterTree<ServerPowerState, any> = {
	getDevices: state => {
		return state.devices;
	},
}