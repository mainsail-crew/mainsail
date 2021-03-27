import { caseInsensitiveNameSort } from '@/plugins/helpers'
import { additionalSensors } from '@/store/variables'

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

	getHeaters: (state, getters, rootState, rootGetters) => {
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
						additionValues: getters.getAdditionSensors(nameSplit[1]),
						tempListAdditionValues: getters.getTempListAdditionSensors(nameSplit[1]),
						power: 'power' in value ? value.power : null,
						presets: rootGetters["gui/getPresetsFromHeater"]({ name: key }),
						chartColor: getters["tempHistory/getDatasetColor"](name),
						chartTemperature: getters["tempHistory/getSeries"](name),
						chartTarget: getters["tempHistory/getSeries"](name+"_target"),
						chartPower: getters["tempHistory/getSeries"](name+'_power'),
						chartSpeed: getters["tempHistory/getSeries"](name+'_speed'),
						min_temp: state.configfile.config[key] !== undefined ? parseFloat(state.configfile.config[key].min_temp) : undefined,
						max_temp: state.configfile.config[key] !== undefined ? parseFloat(state.configfile.config[key].max_temp) : undefined,
					});
				}
			}
		}

		return heaters.sort(caseInsensitiveNameSort);
	},

	getTemperatureFans: (state, getters, rootState, rootGetters) => {
		let fans = []

		for (let [key, value] of Object.entries(state)) {
			let nameSplit = key.split(" ")

			if (nameSplit[0] === "temperature_fan") {
				fans.push({
					name: nameSplit[1],
					target: value.target,
					temperature: value.temperature,
					additionValues: getters.getAdditionSensors(nameSplit[1]),
					tempListAdditionValues: getters.getTempListAdditionSensors(nameSplit[1]),
					speed: value.speed,
					rpm: 'rpm' in value ? value.rpm : false,
					presets: rootGetters["gui/getPresetsFromHeater"]({ name: key }),
					chartColor: getters["tempHistory/getDatasetColor"](nameSplit[1]),
					chartTemperature: getters["tempHistory/getSeries"](nameSplit[1]),
					chartTarget: getters["tempHistory/getSeries"](nameSplit[1]+"_target"),
					chartPower: getters["tempHistory/getSeries"](nameSplit[1]+'_power'),
					chartSpeed: getters["tempHistory/getSeries"](nameSplit[1]+'_speed'),
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
					additionValues: getters.getAdditionSensors(nameSplit[1]),
					tempListAdditionValues: getters.getTempListAdditionSensors(nameSplit[1]),
					icon: icon,
					min_temp: min_temp,
					max_temp: max_temp,
					measured_min_temp: value.measured_min_temp,
					measured_max_temp: value.measured_max_temp,
					chartColor: getters["tempHistory/getDatasetColor"](nameSplit[1]),
					chartTemperature: getters["tempHistory/getSeries"](nameSplit[1]),
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

	getMiscellaneous: state => {
		let output = [];
		const supportedObjects = [
			'controller_fan',
			'heater_fan',
			'fan_generic',
			'fan',
			'output_pin'
		]

		const controllableFans = [
			'fan_generic',
			'fan',
		]

		for (const [key, value] of Object.entries(state)) {
			let nameSplit = key.split(" ")

			if (supportedObjects.includes(nameSplit[0])) {
				let name = nameSplit.length > 1 ? nameSplit[1] : nameSplit[0]
				if (!name.startsWith("_")) {
					let controllable = controllableFans.includes(nameSplit[0].toLowerCase())
					let power = 'speed' in value ? value.speed : ('value' in value ? value.value : 0)
					let rpm = 'rpm' in value ? value.rpm : false
					let pwm = controllable
					let scale = 1

					if (nameSplit[0].toLowerCase() === "fan") scale = 255

					if (nameSplit[0].toLowerCase() === "output_pin") {
						controllable = true
						pwm = false
						if ('settings' in state.configfile && key.toLowerCase() in state.configfile.settings) {
							if ('pwm' in state.configfile.settings[key.toLowerCase()])
								pwm = state.configfile.settings[key.toLowerCase()].pwm

							if ('scale' in state.configfile.settings[key.toLowerCase()])
								scale = state.configfile.settings[key.toLowerCase()].scale
						}
					}

					const tmp = {
						name: name,
						type: nameSplit[0],
						power: power,
						controllable: controllable,
						pwm: pwm,
						rpm: rpm,
						scale: scale,
						object: value,
						config: state.configfile.settings[key]
					}

					if ('settings' in state.configfile && key.toLowerCase() in state.configfile.settings) {
						if ('off_below' in state.configfile.settings[key.toLowerCase()])
							tmp['off_below'] = state.configfile.settings[key.toLowerCase()].off_below

						if ('max_power' in state.configfile.settings[key.toLowerCase()])
							tmp['max_power'] = state.configfile.settings[key.toLowerCase()].max_power
					}

					output.push(tmp)
				}
			}
		}

		return output.sort((a, b) => {
			if (a.type === "fan") return -1
			if (b.type === "fan") return 1

			if (a.pwm < b.pwm) return 1
			if (a.pwm > b.pwm) return -1

			if (a.controllable < b.controllable) return 1
			if (a.controllable > b.controllable) return -1

			const nameA = a.name.toUpperCase()
			const nameB = b.name.toUpperCase()

			if (nameA < nameB) return -1
			if (nameA > nameB) return 1

			return 0
		})
	},

	getAdditionSensors: (state, getters, rootState, rootGetters) => (name) => {
		let additionValues = {}
		additionalSensors.forEach(sensorName => {
			if (sensorName+" "+name in state) {
				Object.keys(state[sensorName+" "+name]).forEach(key => {
					if (key !== "temperature") {
						let tmp = {}
						tmp[key] = {}
						tmp[key]['value'] = state[sensorName+" "+name][key]
						tmp[key]['gui'] = rootGetters["gui/getDatasetAdditionalSensorValue"]({
							name: name,
							sensor: key
						})

						switch(key) {
							case 'pressure':
								tmp[key]['unit'] = "hPa"
								break

							case 'humidity':
								tmp[key]['unit'] = "%"
								break

							default:
								tmp[key]['unit'] = ""
						}

						additionValues = Object.assign(additionValues, tmp)
					}
				})
			}
		})

		return additionValues
	},

	getTempListAdditionSensors: (state, getters, rootState, rootGetters) => (name) => {
		let additionValues = {}
		additionalSensors.forEach(sensorName => {
			if (sensorName+" "+name in state) {
				Object.keys(state[sensorName+" "+name]).forEach(key => {
					if (key !== "temperature") {
						const settings = rootGetters["gui/getDatasetAdditionalSensorValue"]({
							name: name,
							sensor: key
						})

						if (settings.boolList) {
							let tmp = {}
							tmp[key] = {}
							tmp[key]['value'] = state[sensorName+" "+name][key]


							switch(key) {
								case 'pressure':
									tmp[key]['unit'] = "hPa"
									break

								case 'humidity':
									tmp[key]['unit'] = "%"
									break

								default:
									tmp[key]['unit'] = ""
							}

							additionValues = Object.assign(additionValues, tmp)
						}
					}
				})
			}
		})

		return additionValues
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
				let points = []
				value.points.split("\n").forEach(function(row) {
					if (row !== "") {
						row.split(', ').forEach(function(col) {
							points.push(parseFloat(col))
						})
					}
				})

				const min = Math.min(...points)
				const max = Math.max(...points)

				profiles.push({
					name: nameSplit[1],
					data: value,
					points: points,
					min: min,
					max: max,
					variance: Math.abs(min - max),
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

	getEstimatedTimeFile: (state, getters) => {
		if (
			'print_stats' in state &&
			'print_duration' in state.print_stats &&
			state.print_stats.print_duration > 0 &&
			getters.getPrintPercent > 0
		) {
			return (state.print_stats.print_duration / getters.getPrintPercent - state.print_stats.print_duration).toFixed(0)
		}

		return 0
	},

	getEstimatedTimeFilament: (state) => {
		if (
			'print_stats' in state &&
			'print_duration' in state.print_stats &&
			'filament_used' in state.print_stats &&
			'current_file' in state &&
			'filament_total' in state.current_file &&
			state.print_stats.print_duration > 0 &&
			state.current_file.filament_total > 0 &&
			state.current_file.filament_total > state.print_stats.filament_used
		) {
			return (state.print_stats.print_duration / (state.print_stats.filament_used / state.current_file.filament_total) - state.print_stats.print_duration).toFixed(0)
		}

		return 0
	},

	getEstimatedTimeSlicer: (state) => {
		if (
			'print_stats' in state &&
			'print_duration' in state.print_stats &&
			'current_file' in state &&
			'estimated_time' in state.current_file &&
			state.print_stats.print_duration > 0 &&
			state.current_file.estimated_time > 0 &&
			state.current_file.estimated_time > state.print_stats.print_duration
		) {
			return (state.current_file.estimated_time - state.print_stats.print_duration).toFixed(0)
		}

		return 0
	},

	getEstimatedTimeETA: (state, getters) => {
		let time = 0
		let timeCount = 0

		if (getters.getEstimatedTimeFile > 0) {
			time += parseInt(getters.getEstimatedTimeFile)
			timeCount++
		}

		if (getters.getEstimatedTimeFilament > 0) {
			time += parseInt(getters.getEstimatedTimeFilament)
			timeCount++
		}

		if (getters.getEstimatedTimeSlicer > 0) {
			time += parseInt(getters.getEstimatedTimeSlicer)
			timeCount++
		}

		if (time && timeCount) return Date.now() + (time / timeCount) * 1000

		return 0
	}
}
