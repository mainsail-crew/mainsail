export default {
    getVersion: state => {
        return state.packageVersion
    },

    getTitle: (state, getters) => {
        if (state.socket.isConnected) {
            if (state.server.klippy_state !== "ready") return "ERROR"
            else if (state.printer.print_stats.state === "paused") return "Pause Print"
            else if (state.printer.print_stats.state === "printing") {
				const eta = getters["printer/getEstimatedTimeETA"]
				const date = new Date(eta)
				const h = date.getHours() >= 10 ? date.getHours() : "0"+date.getHours()
				const m = date.getMinutes() >= 10 ? date.getMinutes() : "0"+date.getMinutes()

				let output = (getters["printer/getPrintPercent"] * 100).toFixed(0)+"% Printing"
				output += " - ETA: "+h+":"+m
				output += " - "+state.printer.print_stats.filename

				return output
			}
            else if (state.printer.print_stats.state === "complete") return "Complete - "+state.printer.print_stats.filename

            return state.gui.general.printername ? state.gui.general.printername : state.printer.hostname
        }

        return "Mainsail"
    },

    is_printing: state => {
        return (["printing", "paused"].includes(state.printer.print_stats.state));
    },
}
