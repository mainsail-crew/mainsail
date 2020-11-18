import { caseInsensitiveNameSort } from '@/plugins/helpers'

export default {

	getPrintPercent: state => {
		if (
			'filename' in state.current_file &&
			'gcode_start_byte' in state.current_file &&
			'gcode_end_byte' in state.current_file &&
			state.current_file.filename === state.print_stats.filename
		) {
			if (state.virtual_sdcard.file_position <= state.current_file.gcode_start_byte) return 0
			if (state.virtual_sdcard.file_position >= state.current_file.gcode_end_byte) return 1

			let currentPosition = state.virtual_sdcard.file_position - state.current_file.gcode_start_byte;
			let maxPosition = state.current_file.gcode_end_byte - state.current_file.gcode_start_byte;

			if (currentPosition > 0 && maxPosition > 0) return 1 / maxPosition * currentPosition;
		}

		return state.virtual_sdcard.progress
	},

	getMacros: (state, getters, rootState) => {
		let array = []
		let hiddenMacros = []
		rootState.gui.dashboard.hiddenMacros.forEach(function(item,index) {
			hiddenMacros[index] = item.toLowerCase()
		});

		for (let prop in state.configfile.config) {
			if (
				prop.startsWith("gcode_macro") &&
				!("rename_existing" in state.configfile.config[prop]) &&
				!(hiddenMacros.indexOf(prop.replace("gcode_macro ", "").toLowerCase()) > -1)
			) {
				array.push({
					"name": prop.replace("gcode_macro ", ""),
					"prop": state.configfile.config[prop]
				});
			}
		}

		return array.sort(caseInsensitiveNameSort);
	},

	getHeaters: state => {
		let heaters = []

		if (state.heaters.available_heaters) {
			for (let [key, value] of Object.entries(state)) {
				if (state.heaters.available_heaters.includes(key)) {
					let name = key;
					let nameSplit = key.split(" ");

					if (nameSplit.length > 1 && nameSplit[0] === "heater_generic") name = nameSplit[1];

					heaters.push({
						name: name,
						target: value.target,
						temperature: value.temperature,
						min_temp: state.configfile.config[key] !== undefined ? parseFloat(state.configfile.config[key].min_temp) : undefined,
						max_temp: state.configfile.config[key] !== undefined ? parseFloat(state.configfile.config[key].max_temp) : undefined,
					});
				}
			}
		}

		return heaters.sort(caseInsensitiveNameSort);
	},

	getTemperatureFans: state => {
		let fans = []

		for (let [key, value] of Object.entries(state)) {
			let nameSplit = key.split(" ")

			if (nameSplit[0] === "temperature_fan") {
				fans.push({
					name: nameSplit[1],
					target: value.target,
					temperature: value.temperature,
					speed: value.speed,
				})
			}
		}

		return fans.sort(caseInsensitiveNameSort)
	},

	getTemperatureSensors: state => {
		let sensors = []

		for (let [key, value] of Object.entries(state)) {
			let nameSplit = key.split(" ")

			if (nameSplit[0] === "temperature_sensor") {
				sensors.push({
					name: nameSplit[1],
					temperature: value.temperature,
					measured_min_temp: value.measured_min_temp,
					measured_max_temp: value.measured_max_temp,
				})
			}
		}

		return sensors.sort(caseInsensitiveNameSort)
	},

	getPartFanSpeed: state => {
		return "fan" in state ? state.fan.speed : 0;
	},

	getFans: state => {
		let fans = [];
		const supportedFans = [
			'temperature_fan',
			'controller_fan',
			'heater_fan',
			'fan_generic',
			'fan',
		]

		const controllableFans = [
			'fan_generic',
			'fan',
		]

		for (const [key, value] of Object.entries(state)) {
			let nameSplit = key.split(" ")

			if (supportedFans.includes(nameSplit[0])) {
				let name = nameSplit.length > 1 ? nameSplit[1] : nameSplit[0]

				fans.push({
					name: name,
					type: nameSplit[0],
					speed: 'speed' in value ? value.speed : 0,
					controllable: controllableFans.includes(nameSplit[0]),
				})
			}
		}

		return fans.sort((a, b) => {
			if (a.controllable < b.controllable) return 1;
			if (a.controllable > b.controllable) return -1;

			let nameA = a.name.toUpperCase();
			let nameB = b.name.toUpperCase();

			if (nameA < nameB) return -1;
			if (nameA > nameB) return 1;

			return 0;
		})
	},

	getAllMacros: state => {
		let array = []

		for (let prop in state.configfile.config) {
			if (prop.startsWith("gcode_macro") &&
				!prop.startsWith("gcode_macro _") &&
				!Object.hasOwnProperty.call(state.configfile.config[prop], "rename_existing")) {
				array.push({
					"name": prop.replace("gcode_macro ", ""),
					"prop": state.configfile.config[prop]
				})
			}
		}

		return array.sort((a, b) => {
			let nameA = a.name.toUpperCase();
			let nameB = b.name.toUpperCase();

			if (nameA < nameB) return -1;
			if (nameA > nameB) return 1;

			return 0;
		})
	},

	getFilamentSwitchSensors: state => {
		let sensors = []

		for (let [key, value] of Object.entries(state)) {
			let nameSplit = key.split(" ")

			if (nameSplit[0] === "filament_switch_sensor") {
				sensors.push({
					name: nameSplit[1],
					enabled: value.enabled,
					filament_detected: value.filament_detected,
				})
			}
		}

		return sensors.sort(caseInsensitiveNameSort)
	},

	getExtrudePossible: state => {
		if ("toolhead" in state) {
			let extruderName = state.toolhead.extruder;

			if (extruderName in state && extruderName in state.configfile.config) {
				let extruder = state[extruderName];
				let extruderConfig = state.configfile.config[extruderName];

				return  ("min_extrude_temp" in extruderConfig && extruderConfig["min_extrude_temp"] <= extruder["temperature"])
			}
		}

		return true;
	},
}