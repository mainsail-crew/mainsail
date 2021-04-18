import { themeDir } from "@/store/variables"
import { convertName } from "@/plugins/helpers"

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

	getSetting: (state) => (name, fallback) => {
		return state.settings[name] ?? fallback
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

		if (
			'virtual_sdcard' in state.data &&
			'progress' in state.data.virtual_sdcard
		) return state.data.virtual_sdcard.progress

		return 0
	},

	getImage: state => {
		if (
			state.current_file &&
			"filename" in state.current_file &&
			"thumbnails" in state.current_file &&
			state.current_file.thumbnails.length
		) {
			const indexLastDir = state.current_file.filename.lastIndexOf('/')
			const dir = (indexLastDir !== -1) ? state.current_file.filename.substr(0, indexLastDir)+"/" : ""
			const thumbnail = state.current_file.thumbnails.find(thumb => thumb.width >= 300 && thumb.width <= 400)

			if (thumbnail && 'relative_path' in thumbnail) return "//"+state.socket.hostname+":"+state.socket.port+'/server/files/gcodes/'+dir+thumbnail.relative_path
		}

		return "/img/sidebar-background.png"
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
					name: convertName(key),
					value: state.data[key].temperature.toFixed(0)+"° / "+state.data[key].target.toFixed(0)+"°",
				})
			}
		})

		if (
			'heater_bed' in state.data &&
			'temperature' in state.data.heater_bed &&
			'target' in state.data.heater_bed
		) {
			output.push({
				name: convertName('heater_bed'),
				value: state.data.heater_bed.temperature.toFixed(0)+"° / "+state.data.heater_bed.target.toFixed(0)+"°"
			})
		}

		if (
			'temperature_fan chamber' in state.data &&
			'temperature' in state.data['temperature_fan chamber'] &&
			'target' in state.data['temperature_fan chamber']
		) {
			output.push({
				name: convertName('chamber'),
				value: state.data['temperature_fan chamber'].temperature.toFixed(0)+"° / "+state.data['temperature_fan chamber'].target.toFixed(0)+"°"
			})
		}

		if ('temperature_sensor chamber' in state.data) {
			output.push({
				name: convertName('chamber'),
				value: state.data['temperature_sensor chamber'].temperature.toFixed(0)+"°"
			})
		}

		if (
			'print_stats' in state.data &&
			'state' in state.data.print_stats &&
			state.data.print_stats.state === "printing" &&
			getters["getPrintPercent"] > 0
		) {
			const eta = new Date(getters.estimated_time_eta)
			const h = eta.getHours() >= 10 ? eta.getHours() : "0"+eta.getHours()
			const m = eta.getMinutes() >= 10 ? eta.getMinutes() : "0"+eta.getMinutes()

			output.push({
				name: "ETA",
				value: h+":"+m,
				file: getters.estimated_time_file,
				filament: getters.estimated_time_filament,
				slicer: getters.estimated_time_slicer,
				eta: getters.estimated_time_eta,
			})
		}

		return output
	},

	estimated_time_file: (state, getters) => {
		if (
			'print_stats' in state.data &&
			'print_duration' in state.data.print_stats &&
			state.data.print_stats.print_duration > 0 && getters.getPrintPercent > 0) {
			return (state.data.print_stats.print_duration / getters.getPrintPercent - state.data.print_stats.print_duration).toFixed(0)
		}

		return 0
	},

	estimated_time_filament: (state) => {
		if (
			'print_stats' in state.data &&
			'print_duration' in state.data.print_stats &&
			'filament_used' in state.data.print_stats &&
			'filament_total' in state.current_file &&

			state.data.print_stats.filament_used > 0 &&
			state.current_file.filament_total > state.data.print_stats.filament_used) {
			return (state.data.print_stats.print_duration / (state.data.print_stats.filament_used / state.current_file.filament_total) - state.data.print_stats.print_duration).toFixed(0)
		}

		return 0
	},

	estimated_time_slicer: (state) => {
		if (
			'print_stats' in state.data &&
			'print_duration' in state.data.print_stats &&
			'estimated_time' in state.current_file &&

			state.current_file.estimated_time > state.data.print_stats.print_duration) {
			return (state.current_file.estimated_time - state.data.print_stats.print_duration).toFixed(0)
		}

		return 0
	},

	estimated_time_eta: (state, getters) => {
		let time = 0
		let timeCount = 0

		if (getters.estimated_time_file > 0) {
			time += parseInt(getters.estimated_time_file)
			timeCount++
		}

		if (getters.estimated_time_filament > 0) {
			time += parseInt(getters.estimated_time_filament)
			timeCount++
		}

		if (getters.estimated_time_slicer > 0) {
			time += parseInt(getters.estimated_time_slicer)
			timeCount++
		}

		if (time && timeCount) return Date.now() + (time / timeCount) * 1000

		return 0
	},

	getPrinterWebcams: (state) => {
		if (
			'gui' in state.data &&
			'webcam' in state.data.gui &&
			'bool' in state.data.gui.webcam &&
			'configs' in state.data.gui.webcam &&
			'dashboard' in state.data.gui &&
			'boolWebcam' in state.data.gui.dashboard &&
			(state.data.gui.dashboard.boolWebcam || state.data.gui.webcam.bool)
		) return state.data.gui.webcam.configs

		return []
	}
}