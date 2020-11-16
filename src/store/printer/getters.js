export default {

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