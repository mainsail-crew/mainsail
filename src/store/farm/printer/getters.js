import {themeDir} from "@/store/variables";


export default {

	getSocketUrl: (state) => {
		return state.socket.protocol+"://"+state.socket.hostname+":"+state.socket.port+"/websocket"
	},

	getSocketData: (state) => {
		return state.socket
	},

	isCurrentPrinter: (state, getters, rootState) => {
		return (
			rootState.socket.hostname === state.socket.hostname &&
			rootState.socket.port === state.socket.port
		)
	},

	getPrinterName: (state) => {
		if (
			'gui' in state.data &&
			'general' in state.data.gui &&
			'printername' in state.data.gui.general &&
			state.data.gui.general.printername !== ""
		) return state.data.gui.general.printername

		return parseInt(state.socket.port) !== 80 ? state.socket.hostname+':'+state.socket.port : state.socket.hostname
	},

	getStatus: (state, getters) => {
		if (!state.socket.isConnected) {
			return state.socket.isConnecting ? "Connecting..." : "Disconnected"
		} else if (state.data.print_stats && state.data.print_stats.state) {
			if (state.data.print_stats.state === "printing") {
				const percent = getters["getPrintPercent"]

				return Math.round(percent*100)+"% Printing"
			}

			return state.data.print_stats.state.charAt(0).toUpperCase() + state.data.print_stats.state.slice(1)
		}

		return "Unknown"
	},

	getCurrentFilename: (state) => {
		if (
			'print_stats' in state.data &&
			'filename' in state.data.print_stats
		) {
			return state.data.print_stats.filename
		}

		return ""
	},

	getPrintPercent: (state) => {
		if (
			'filename' in state.current_file &&
			'gcode_start_byte' in state.current_file &&
			'gcode_end_byte' in state.current_file &&
			state.current_file.filename === state.data.print_stats.filename
		) {
			if (state.data.virtual_sdcard.file_position <= state.current_file.gcode_start_byte) return 0
			if (state.data.virtual_sdcard.file_position >= state.current_file.gcode_end_byte) return 1

			let currentPosition = state.data.virtual_sdcard.file_position - state.current_file.gcode_start_byte
			let maxPosition = state.current_file.gcode_end_byte - state.current_file.gcode_start_byte

			if (currentPosition > 0 && maxPosition > 0) return 1 / maxPosition * currentPosition
		}

		return state.data.virtual_sdcard.progress
	},

	getImage: state => {
		if (
			'gui' in state.data &&
			'webcam' in state.data.gui.webcam &&
			'url' in state.data.gui.webcam &&
			state.data.gui.webcam.url !== "" &&
			'bool' in state.data.gui.webcam &&
			state.data.gui.webcam.bool &&
			'dashbaord' in state.data.gui &&
			'boolWebcam' in state.data.gui.dashboard &&
			state.data.gui.dashboard.boolWebcam
		) {
			return state.data.gui.webcam.url
		} else if (
			state.current_file &&
			"thumbnails" in state.current_file &&
			state.current_file.thumbnails.find((element) => element.width === 400 && element.height === 300)
		) {
			return 'data:image/gif;base64,'+state.current_file.thumbnails.find((element) => element.width === 400 && element.height === 300).data
		} else return "/img/sidebar-background.png"
	},

	getLogo: state => {
		let file = state.theme_files.find(element =>
			element === themeDir+'/sidebar-logo.svg' ||
			element === themeDir+'/sidebar-logo.jpg' ||
			element === themeDir+'/sidebar-logo.png' ||
			element === themeDir+'/sidebar-logo.gif'
		)
		if (file) return "//"+state.socket.hostname+":"+state.socket.port+'/server/files/config/'+file

		return '/img/logo.svg'
	},

	getPosition: state => {
		if (
			'toolhead' in state.data &&
			'position' in state.data.toolhead
		) return state.data.toolhead.position

		return []
	},

	getPrinterPreview: (state, getters) => {
		const output = []

		Object.keys(state.data).filter((key) => key.startsWith("extruder")).forEach((key) => {
			if (
				'temperature' in state.data[key] &&
				'target' in state.data[key]
			) {
				output.push({
					name: key,
					value: state.data[key].temperature.toFixed(0)+"° / "+state.data[key].target.toFixed(0)+"°",
				})
			}
		})

		if ('heater_bed' in state.data) {
			output.push({
				name: 'heater_bed',
				value: state.data.heater_bed.temperature.toFixed(0)+"° / "+state.data.heater_bed.target.toFixed(0)+"°"
			})
		}

		if ('temperature_fan chamber' in state.data) {
			output.push({
				name: 'chamber',
				value: state.data['temperature_fan chamber'].temperature.toFixed(0)+"° / "+state.data['temperature_fan chamber'].target.toFixed(0)+"°"
			})
		}

		if ('temperature_sensor chamber' in state.data) {
			output.push({
				name: 'chamber',
				value: state.data['temperature_sensor chamber'].temperature.toFixed(0)+"°"
			})
		}

		if (
			'print_stats' in state.data &&
			'state' in state.data.print_stats &&
			'print_duration' in state.data.print_stats &&
			state.data.print_stats.state === "printing" &&
			state.data.print_stats.print_duration &&
			getters["getPrintPercent"] > 0
		) {
			const eta = new Date(new Date().getTime() + (state.data.print_stats.print_duration / getters["getPrintPercent"] - state.data.print_stats.print_duration).toFixed() * 1000)
			output.push({
				name: "ETA",
				value: (eta.getHours() > 9 ? eta.getHours() : '0'+eta.getHours())+":"+(eta.getMinutes() > 9 ? eta.getMinutes() : '0'+eta.getMinutes())
			})
		}

		return output
	},
}