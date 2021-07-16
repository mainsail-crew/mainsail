import {additionalSensors, checkKlipperConfigModules} from '@/store/variables'
import { GetterTree } from "vuex"
import {
	PrinterState, PrinterStateBedMesh,
	PrinterStateFan, PrinterStateFilamentSensors,
	PrinterStateHeater, PrinterStateTemperatureFan,
	PrinterStateMiscellaneous,
	PrinterStateSensor, PrinterStateMacro
} from "@/store/printer/types"
import {caseInsensitiveSort, formatFrequency} from "@/plugins/helpers";
import {RootState} from "@/store/types";

export const getters: GetterTree<PrinterState, RootState> = {

	getPrintPercent: state => {
		if (
			state.current_file?.filename &&
			state.current_file?.gcode_start_byte &&
			state.current_file?.gcode_end_byte &&
			state.current_file.filename === state.print_stats.filename
		) {
			if (state.virtual_sdcard.file_position <= state.current_file.gcode_start_byte) return 0
			if (state.virtual_sdcard.file_position >= state.current_file.gcode_end_byte) return 1

			const currentPosition = state.virtual_sdcard.file_position - state.current_file.gcode_start_byte;
			const maxPosition = state.current_file.gcode_end_byte - state.current_file.gcode_start_byte;

			if (currentPosition > 0 && maxPosition > 0) return 1 / maxPosition * currentPosition;
		}

		return state.virtual_sdcard.progress
	},

	getPositions: (state) => {
		const position = state.toolhead?.position ?? [0,0,0]
		const gcode_position = state.gcode_move?.gcode_position ?? [0,0,0]
		const absolute = state.gcode_move?.absolute_coordinates ?? true

		return {
			coordinates: absolute,
			x: position[0]?.toFixed(2) ?? '--',
			y: position[1]?.toFixed(2) ?? '--',
			z: position[2]?.toFixed(2) ?? '--',
			gcode_z: gcode_position[2]?.toFixed(2) ?? '--',
		}
	},

	getMacros: (state, getters, rootState) => {
		const array: PrinterStateMacro[] = []
		const hiddenMacros: string[] = []

		rootState.gui?.dashboard.hiddenMacros.forEach((item: string, index: number) => {
			hiddenMacros[index] = item.toLowerCase()
		})

		if (state.configfile?.config) {
			Object.keys(state.configfile?.config).forEach((prop) => {
				if (
					prop.startsWith("gcode_macro") &&
					!prop.startsWith("gcode_macro _") &&
					!("rename_existing" in state.configfile.config[prop]) &&
					!(hiddenMacros.indexOf(prop.replace("gcode_macro ", "").toLowerCase()) > -1)
				) {
					array.push({
						"name": prop.replace("gcode_macro ", ""),
						"description": state.configfile.config[prop].description ?? null,
						"prop": state.configfile.config[prop]
					})
				}
			})
		}

		return caseInsensitiveSort(array, 'name')
	},

	getHeaters: (state, getters, rootState, rootGetters) => {
		const heaters: PrinterStateHeater[] = []
		const colorOff = "grey darken-2"
		const colorHot = "grey lighten-5"

		if (state.heaters?.available_heaters) {
			for (const [key, value] of Object.entries(state)) {
				if (state.heaters.available_heaters.includes(key)) {
					let name = key;
					const nameSplit = key.split(" ");

					if (nameSplit.length > 1 && nameSplit[0] === "heater_generic") name = nameSplit[1];

					let icon = "printer-3d-nozzle-alert"
					let color = colorOff
					if (value.target) color = colorHot

					if(nameSplit[0].startsWith("extruder")) {
						const min_extrude_temp = key in state.configfile.config && 'min_extrude_temp' in state.configfile.config[key] ? parseFloat(state.configfile.config[key].min_extrude_temp) : 170
						if (value.temperature >= min_extrude_temp) icon = "printer-3d-nozzle"
					} else if (nameSplit[0] === "heater_bed") {
						icon = "radiator-disabled"
						if (value.temperature > 50 || (value.target && value.temperature > value.target-5)) icon = "radiator"
					} else if (nameSplit[0].startsWith("heater_generic")) icon = "fire"

					heaters.push({
						name: name,
						type: nameSplit[0],
						icon: icon,
						iconColor: color,
						target: Math.round(value.target * 10) / 10,
						temperature: Math.round(value.temperature * 10) / 10,
						additionSensors: getters.getAdditionSensors(nameSplit[1]),
						power: Math.round((value.power ?? 0) * 100),
						avgPower: Math.round(getters["tempHistory/getAvgPower"](name) ?? 0),
						presets: rootGetters["gui/getPresetsFromHeater"]({ name: key }),
						chartColor: getters["tempHistory/getDatasetColor"](name),
						chartSeries: getters["tempHistory/getSerieNames"](name),
						min_temp: parseInt(state.configfile?.config[key]?.min_temp ?? 0),
						max_temp: parseInt(state.configfile?.config[key]?.max_temp ?? 0),
					})
				}
			}
		}

		return caseInsensitiveSort(heaters, 'name')
	},

	getTemperatureFans: (state, getters, rootState, rootGetters) => {
		const fans: PrinterStateTemperatureFan[] = []

		for (const [key, value] of Object.entries(state)) {
			const nameSplit = key.split(" ")

			if (nameSplit[0] === "temperature_fan") {
				fans.push({
					name: nameSplit[1],
					icon: "fan",
					target: Math.round(value.target * 10) / 10,
					temperature: Math.round(value.temperature * 10) / 10,
					additionSensors: getters.getAdditionSensors(nameSplit[1]),
					speed: Math.round((value.speed ?? 0) * 100),
					avgSpeed: Math.round(getters["tempHistory/getAvgSpeed"](name) ?? 0),
					rpm: value.rpm !== null ? Math.round(value.rpm) : null,
					presets: rootGetters["gui/getPresetsFromHeater"]({ name: key }),
					chartColor: getters["tempHistory/getDatasetColor"](nameSplit[1]),
					chartSeries: getters["tempHistory/getSerieNames"](nameSplit[1]),
					min_temp: parseInt(state.configfile?.config[key]?.min_temp ?? 0),
					max_temp: parseInt(state.configfile?.config[key]?.max_temp ?? 0),
				})
			}
		}

		return caseInsensitiveSort(fans, 'name')
	},

	getTemperatureSensors: (state, getters) => {
		const sensors: PrinterStateSensor[] = []

		for (const [key, value] of Object.entries(state)) {
			const nameSplit = key.split(" ")

			if (nameSplit[0] === "temperature_sensor") {
				let icon = "thermometer"
				const min_temp = state.configfile?.settings[key]?.min_temp ?? 0
				const max_temp = state.configfile?.settings[key]?.max_temp ?? 210
				const split = (max_temp - min_temp) / 3

				if (value.temperature <= min_temp + split) icon = "thermometer-low"
				if (value.temperature >= max_temp - split) icon = "thermometer-high"

				sensors.push({
					name: nameSplit[1],
					temperature: Math.round(value.temperature * 10) / 10,
					additionSensors: getters.getAdditionSensors(nameSplit[1]),
					icon: icon,
					min_temp: min_temp,
					max_temp: max_temp,
					measured_min_temp: Math.round(value.measured_min_temp * 10) / 10,
					measured_max_temp: Math.round(value.measured_max_temp * 10) / 10,
					chartColor: getters["tempHistory/getDatasetColor"](nameSplit[1]),
					chartSeries: getters["tempHistory/getSerieNames"](nameSplit[1]),
				})
			}
		}

		return caseInsensitiveSort(sensors, 'name')
	},

	getPartFanSpeed: state => {
		return "fan" in state ? state.fan.speed : 0;
	},

	getFans: state => {
		const fans: PrinterStateFan[] = [];
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
			const nameSplit = key.split(" ")

			if (supportedFans.includes(nameSplit[0])) {
				const name = nameSplit.length > 1 ? nameSplit[1] : nameSplit[0]

				fans.push({
					name: name,
					type: nameSplit[0],
					speed: 'speed' in value ? value.speed : 0,
					controllable: controllableFans.includes(nameSplit[0]),
				})
			}
		}

		return fans.sort((a, b) => {
			if (a.controllable < b.controllable) return 1
			if (a.controllable > b.controllable) return -1

			const nameA = a.name.toUpperCase()
			const nameB = b.name.toUpperCase();

			if (nameA < nameB) return -1
			if (nameA > nameB) return 1

			return 0
		})
	},

	getMiscellaneous: state => {
		const output: PrinterStateMiscellaneous[] = [];
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
			const nameSplit = key.split(" ")

			if (supportedObjects.includes(nameSplit[0])) {
				const name = nameSplit.length > 1 ? nameSplit[1] : nameSplit[0]
				if (!name.startsWith("_")) {
					let controllable = controllableFans.includes(nameSplit[0].toLowerCase())
					const power = 'speed' in value ? value.speed : ('value' in value ? value.value : 0)
					const rpm = 'rpm' in value ? value.rpm : false
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
						config: state.configfile.settings[key],
						off_below: undefined,
						max_power: undefined
					}

					if ('settings' in state.configfile && key.toLowerCase() in state.configfile.settings) {
						if ('off_below' in state.configfile.settings[key.toLowerCase()])
							tmp.off_below = state.configfile.settings[key.toLowerCase()].off_below

						if ('max_power' in state.configfile.settings[key.toLowerCase()])
							tmp.max_power = state.configfile.settings[key.toLowerCase()].max_power
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

	getAdditionSensors: (state, getters, rootState, rootGetters) => (name: string) => {
		let additionValues = {}
		additionalSensors.forEach(sensorName => {
			if (sensorName+" "+name in state) {
				Object.keys(state[sensorName+" "+name]).forEach(key => {
					if (key !== "temperature") {
						const tmp: any = {}
						tmp[key] = {}
						tmp[key]['value'] = state[sensorName+" "+name][key].toFixed(1)
						tmp[key]['bool'] = rootGetters["gui/getDatasetAdditionalSensorValue"]({
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

	getAllMacros: state => {
		const array: PrinterStateMacro[] = []

		Object.keys(state.configfile.config).forEach(prop => {
			if (prop.startsWith("gcode_macro") &&
				!prop.startsWith("gcode_macro _") &&
				!Object.hasOwnProperty.call(state.configfile.config[prop], "rename_existing")) {
				array.push({
					"name": prop.replace("gcode_macro ", ""),
					"description": state.configfile.config[prop].description ?? null,
					"prop": state.configfile.config[prop]
				})
			}
		})

		return caseInsensitiveSort(array, 'name')
	},

	getFilamentSensors: state => {
		const sensorObjectNames = ['filament_switch_sensor', 'filament_motion_sensor']
		const sensors: PrinterStateFilamentSensors[] = []

		for (const [key, value] of Object.entries(state)) {
			const nameSplit = key.split(" ")

			if (sensorObjectNames.includes(nameSplit[0])) {
				sensors.push({
					name: nameSplit[1],
					enabled: value.enabled,
					filament_detected: value.filament_detected,
				})
			}
		}

		return caseInsensitiveSort(sensors, 'name')
	},

	getMcus: (state, getters) => {
		const mcus: any[] = []

		Object.keys(state).forEach((key) => {
			if (key === "mcu" || key.startsWith("mcu ")) {
				const mcu = state[key]
				const versionOutput = (mcu.mcu_version ?? "unknown").split("-").slice(0, 4).join("-")

				let load = 0
				if (mcu.last_stats?.mcu_task_avg && mcu.last_stats?.mcu_task_stddev) {
					load = mcu.last_stats.mcu_task_avg + 3 * mcu.last_stats?.mcu_task_stddev / 0.0025
				}

				let loadProgressColor = 'primary'
				if (load > 0.95) loadProgressColor = 'error'
				else if (load > 0.8) loadProgressColor = 'warning'

				mcus.push({
					name: key,
					mcu_constants: mcu.mcu_constants,
					last_stats: mcu.last_stats,
					version: versionOutput,
					chip: mcu.mcu_constants?.MCU ?? null,
					freq: mcu.last_stats?.freq ?? null,
					freqFormat: formatFrequency(mcu.last_stats?.freq ?? 0),
					awake: ((mcu.last_stats?.mcu_awake ?? 0) / 5).toFixed(2),
					load: load.toFixed(2),
					loadPercent: load < 1 ? Math.round(load * 100) : 100,
					loadProgressColor: loadProgressColor,
					tempSensor: getters.getMcuTempSensor(key)
				})
			}
		})

		return mcus
	},

	getPrinterObject: (state) => (objectName: string) => {
		if (objectName in state) return state[objectName]

		return null
	},

	getPrinterConfigObjects: (state) => (objectNames: string[]) => {
		const output: any = {}

		if (state.configfile?.settings) {
			Object.keys(state.configfile.settings).forEach((key) => {
				const keySplits = key.split(" ")

				if (objectNames.includes(keySplits[0])) {
					output[key] = state.configfile.settings[key]
				}
			})
		}

		return output
	},

	getHostTempSensor: (state, getters) => {
		const sensorTypes = ['rpi_temperature', 'temperature_host']
		const checkObjects = ['temperature_sensor', 'temperature_fan']
		let output: null | { temperature: number, measured_min_temp: number, measured_max_temp: number } = null

		const objects = getters.getPrinterConfigObjects(checkObjects)
		Object.keys(objects).forEach((key) => {
			const settings = objects[key]
			if (
				'sensor_type' in settings &&
				sensorTypes.includes(settings.sensor_type) &&
				key in state
			) {
				const value = state[key]

				output = {
					temperature: value.temperature?.toFixed(0),
					measured_min_temp: value.measured_min_temp?.toFixed(1),
					measured_max_temp: value.measured_max_temp?.toFixed(1)
				}
			}
		})

		return output
	},

	getMcuTempSensors: (state, getters) => {
		const checkObjects = ['temperature_sensor', 'temperature_fan']
		const output: any = []

		const objects = getters.getPrinterConfigObjects(checkObjects)
		Object.keys(objects).forEach((key) => {
			const value = objects[key]
			if ('sensor_type' in value && value.sensor_type === 'temperature_mcu' && 'sensor_mcu' in value) {
				output.push({
					key: key,
					settings: value,
					object: key in state ? state[key] : {}
				})
			}
		})

		return output
	},

	getMcuTempSensor: (state, getters) => (mcuName: string) => {
		let output: any = null

		const sensors = getters.getMcuTempSensors
		sensors.forEach((sensor: any) => {
			if (sensor.settings?.sensor_mcu === mcuName) {
				output = {
					temperature: sensor.object.temperature.toFixed(0),
					measured_min_temp: sensor.object.measured_min_temp.toFixed(1),
					measured_max_temp: sensor.object.measured_max_temp.toFixed(1)
				}
			}
		})

		return output
	},

	getBedMeshProfiles: (state) => {
		const profiles: PrinterStateBedMesh[] = []
		let currentProfile = ""
		if (state.bed_mesh) currentProfile = state.bed_mesh.profile_name

		if (state.configfile?.config) {
			Object.keys(state.configfile.config).filter((key) => key.startsWith('bed_mesh ')).forEach((key: string) => {
				// eslint-disable-next-line
				const value: any = state.configfile.settings[key.toLowerCase()]
				const nameSplit = key.split(" ")

				const points: number[] = []
				value.points.split("\n").forEach((row: string) => {
					if (row !== "") {
						row.split(', ').forEach((col: string) => {
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
				})
			})
		}

		return caseInsensitiveSort(profiles, 'name')
	},

	getExtrudePossible: state => {
		const extruderName = state.toolhead?.extruder ?? "extruder"

		return state[extruderName]?.can_extrude ?? false
	},

	getBedMeshProfileName: state => {
		if ('bed_mesh' in state && 'profile_name' in state.bed_mesh) return state.bed_mesh.profile_name

		return ''
	},

	getMaxTemp: state => {
		let maxtemp = 0

		state.heaters?.available_sensors?.forEach((sensorName: string) => {
			const settings = state.configfile?.settings[sensorName]
			if (
				settings && 'max_temp' in settings &&
				Math.round(settings.max_temp) > maxtemp &&
				Math.round(settings.max_temp) < 10000
			) maxtemp = Math.round(settings.max_temp)
		})

		return (maxtemp > 0 ? maxtemp + 10 : 300)
	},

	existPrinterConfig: (state) => {
		if (state.configfile?.config) return Object.keys(state.configfile.config).length > 0

		return false
	},

	checkConfig: (state) => (configName: string) => {
		if (!state.configfile.config) return false

		const configObjects = Object.keys(state.configfile.config)
		return (configObjects.findIndex((module) => module.toLowerCase() === configName.toLowerCase()) !== -1)
	},

	checkNecessaryConfig: (state, getters) => {
		const missingModules: string[] = []

		checkKlipperConfigModules.forEach((module: string) => {
			if (!getters.checkConfig(module)) missingModules.push(module)
		})

		return missingModules
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

	getEstimatedTimeAvg: (state, getters) => {
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

		if (time && timeCount) return (time / timeCount)

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
