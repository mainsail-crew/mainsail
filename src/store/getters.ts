import { GetterTree } from "vuex"
import { RootState } from "@/store/types"

// eslint-disable-next-line
export const getters: GetterTree<RootState, any> = {
    getVersion: state => {
        return state.packageVersion
    },

    getTitle: (state, getters) => {
        if (state.socket?.isConnected) {
            if (state.server?.klippy_state !== "ready") return "ERROR"
            else if (state.printer?.print_stats?.state === "paused") return "Pause Print"
            else if (state.printer?.print_stats?.state === "printing") {
				const eta = getters["printer/getEstimatedTimeETA"]

				let output = (getters["printer/getPrintPercent"] * 100).toFixed(0)+"% Printing"
				if (eta) {
					const date = new Date(eta)
					const h = date.getHours() >= 10 ? date.getHours() : "0"+date.getHours()
					const m = date.getMinutes() >= 10 ? date.getMinutes() : "0"+date.getMinutes()
					const diff = eta - new Date().getTime()
					output += " - ETA: "+h+":"+m+((diff > 60*60*24*1000) ? "+"+(diff / (60*60*24*1000)).toFixed() : "")
				}
				output += " - "+state.printer.print_stats?.filename

				return output
			} else if (state.printer?.print_stats?.state === "complete") return "Complete - "+state.printer.print_stats.filename

            return state.gui?.general.printername ?? state.printer?.hostname ?? "Mainsail"
        }

        return "Mainsail"
    },
}
