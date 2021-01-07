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
				!prop.startsWith("gcode_macro _") &&
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

	getHeaters: (state, getters) => {
		let heaters = []
		let colorOff = "grey darken-2"
		let colorHot = "grey lighten-5"

		if (state.heaters.available_heaters) {
			for (let [key, value] of Object.entries(state)) {
				if (state.heaters.available_heaters.includes(key)) {
					let name = key;
					let nameSplit = key.split(" ");

					if (nameSplit.length > 1 && nameSplit[0] === "heater_generic") name = nameSplit[1];

					let icon = "printer-3d-nozzle-alert"
					let color = colorOff
					if (value.target) color = colorHot

					if(nameSplit[0].startsWith("extruder")) {
						let min_extrude_temp = key in state.configfile.config && 'min_extrude_temp' in state.configfile.config[key] ? parseFloat(state.configfile.config[key].min_extrude_temp) : 170
						if (value.temperature >= min_extrude_temp) icon = "printer-3d-nozzle"
					} else if (nameSplit[0] === "heater_bed") {
						icon = "radiator-disabled"
						if (value.temperature > 50 || (value.target && value.temperature > value.target-5)) icon = "radiator"
					} else if (nameSplit[0].startsWith("heater_generic")) icon = "fire"

					heaters.push({
						name: name,
						type: nameSplit[0],
						icon: icon,
						color: color,
						target: value.target,
						temperature: value.temperature,
						power: 'power' in value ? value.power : null,
						chartColor: getters["tempHistory/getDatasetColor"](name),
						min_temp: state.configfile.config[key] !== undefined ? parseFloat(state.configfile.config[key].min_temp) : undefined,
						max_temp: state.configfile.config[key] !== undefined ? parseFloat(state.configfile.config[key].max_temp) : undefined,
					});
				}
			}
		}

		return heaters.sort(caseInsensitiveNameSort);
	},

	getTemperatureFans: (state, getters) => {
		let fans = []

		for (let [key, value] of Object.entries(state)) {
			let nameSplit = key.split(" ")

			if (nameSplit[0] === "temperature_fan") {
				fans.push({
					name: nameSplit[1],
					target: value.target,
					temperature: value.temperature,
					speed: value.speed,
					chartColor: getters["tempHistory/getDatasetColor"](nameSplit[1]),
				})
			}
		}

		return fans.sort(caseInsensitiveNameSort)
	},

	getTemperatureSensors: (state, getters) => {
		let sensors = []

		for (let [key, value] of Object.entries(state)) {
			let nameSplit = key.split(" ")

			if (nameSplit[0] === "temperature_sensor") {
				let icon = "mdi-thermometer"
				let min_temp = (state.configfile.config[key] && state.configfile.config[key].min_temp) ? parseInt(state.configfile.config[key].min_temp) : 0
				let max_temp = (state.configfile.config[key] && state.configfile.config[key].max_temp) ? parseInt(state.configfile.config[key].max_temp) : 210
				let split = (max_temp - min_temp) / 3

				if (value.temperature <= min_temp + split) icon = "mdi-thermometer-low"
				if (value.temperature >= max_temp - split) icon = "mdi-thermometer-high"

				sensors.push({
					name: nameSplit[1],
					temperature: value.temperature,
					icon: icon,
					min_temp: min_temp,
					max_temp: max_temp,
					measured_min_temp: value.measured_min_temp,
					measured_max_temp: value.measured_max_temp,
					chartColor: getters["tempHistory/getDatasetColor"](nameSplit[1]),
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

	getBedMeshProfiles: state => {
		let profiles = [];
		let currentProfile = "";
		if (state.bed_mesh) {
			currentProfile = state.bed_mesh.profile_name;
		}

		for (let [key, value] of Object.entries(state.configfile.config)) {
			let nameSplit = key.split(" ");

			if (nameSplit.length > 1 && nameSplit[0] === "bed_mesh" && nameSplit[1] !== undefined) {
				profiles.push({
					name: nameSplit[1],
					data: value,
					is_active: (currentProfile === nameSplit[1]),
				});
			}
		}

		return profiles.sort(caseInsensitiveNameSort);
	},

	getExtrudePossible: state => {
		if ("toolhead" in state) {
			let extruderName = state.toolhead.extruder;

			if (extruderName in state && extruderName in state.configfile.config) {
				let extruder = state[extruderName];
				let extruderConfig = state.configfile.config[extruderName];
				let min_extrude_temp = "min_extrude_temp" in extruderConfig ? extruderConfig["min_extrude_temp"] : 170

				return  (min_extrude_temp <= extruder["temperature"])
			}
		}

		return true;
	},

	getBedMeshProfileName: state => {
		if ('bed_mesh' in state && 'profile_name' in state.bed_mesh) return state.bed_mesh.profile_name

		return ''
	},

	getMaxTemp: state => {
		let maxtemp = 0

		Object.entries(state.configfile.config).forEach(([key, value]) => {
			if (
				Array.isArray(state.heaters.available_heaters) &&
				state.heaters.available_heaters.length
			) {
				let keySplit = key.split(" ")

				if (
					(
						state.heaters.available_heaters.includes(key) ||
						keySplit[0] === "temperature_fan" ||
						keySplit[0] === "temperature_sensor"
					) &&
					'max_temp' in value &&
					maxtemp < parseInt(value.max_temp)
				) maxtemp = parseInt(value.max_temp)
			}
		})

		return (maxtemp > 0 ? maxtemp + 10 : 300)
	},

	existPrinterConfig: state => {
		if (
			typeof(state.configfile.config) === "object" &&
			Object.entries(state.configfile.config).length > 1
		) return true;

		return false;
	},

	checkConfigVirtualSdcard: state => {
		return 'virtual_sdcard' in state.configfile.config;
	},

	checkConfigPauseResume: state => {
		return 'pause_resume' in state.configfile.config;
	},

	checkConfigDisplayStatus: state => {
		return 'display_status' in state.configfile.config;
	},

	checkConfigMacroPause: state => {
		return Object.keys(state.configfile.config).findIndex(key => key.toLowerCase() === 'gcode_macro pause') !== -1;
	},

	checkConfigMacroResume: state => {
		return Object.keys(state.configfile.config).findIndex(key => key.toLowerCase() === 'gcode_macro resume') !== -1;
	},

	checkConfigMacroCancel: state => {
		return Object.keys(state.configfile.config).findIndex(key => key.toLowerCase() === 'gcode_macro cancel_print') !== -1;
	},
}