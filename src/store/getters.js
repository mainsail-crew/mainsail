function caseInsensitiveNameSort(a, b) {
    let nameA = a.name.toUpperCase();
    let nameB = b.name.toUpperCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;

    return 0;
}

export default {
    heaters: state => {
        let heaters = [];

        if (state.printer.heaters.available_heaters) {
            for (let [key, value] of Object.entries(state.printer)) {
                if (state.printer.heaters.available_heaters.includes(key)) {
                    let name = key;
                    let nameSplit = key.split(" ");

                    if (nameSplit.length > 1 && nameSplit[1] === "heater_generic") name = nameSplit[1];

                    heaters.push({
                        name: name,
                        target: value.target,
                        temperature: value.temperature,
                        min_temp: state.printer.configfile.config[key] !== undefined ? parseFloat(state.printer.configfile.config[key].min_temp) : undefined,
                        max_temp: state.printer.configfile.config[key] !== undefined ? parseFloat(state.printer.configfile.config[key].max_temp) : undefined,
                    });
                }
            }
        }

        return heaters.sort(caseInsensitiveNameSort);
    },

    heatersCount: (state, getters) => {
        return getters.heaters.length;
    },

    temperature_fans: state => {
        let fans = [];

        for (let [key, value] of Object.entries(state.printer)) {
            let nameSplit = key.split(" ");

            if (nameSplit[0] === "temperature_fan") {
                fans.push({
                    name: nameSplit[1],
                    target: value.target,
                    temperature: value.temperature,
                    speed: value.speed,
                });
            }
        }

        return fans.sort(caseInsensitiveNameSort);
    },

    temperature_sensors: state => {
        let sensors = [];

        for (let [key, value] of Object.entries(state.printer)) {
            let nameSplit = key.split(" ");

            if (nameSplit[0] === "temperature_sensor") {
                sensors.push({
                    name: nameSplit[1],
                    temperature: value.temperature,
                    measured_min_temp: value.measured_min_temp,
                    measured_max_temp: value.measured_max_temp,
                });
            }

            if (nameSplit[0] === "temperature_probe") {
                sensors.push({
                    name: "Probe",
                    temperature: value.temperature,
                    //TODO: update measured_temps
                    measured_min_temp: 0,
                    measured_max_temp: 0,
                });
            }
        }

        return sensors.sort(caseInsensitiveNameSort);
    },

    current_file_size: state =>  {
        if (state.printer.print_stats.filename === state.printer.current_file.filename) {
            return state.printer.current_file.size;
        }

        return 0;
    },

    current_file_metadata: state => {
        return state.printer.current_file;
    },

    current_file_estimated_time: state =>  {
        if (state.printer.print_stats.filename === state.printer.current_file.filename) {
            return state.printer.current_file.estimated_time;
        }

        return 0;
    },

    current_file_filament_total: state =>  {
        if (state.printer.print_stats.filename === state.printer.current_file.filename) {
            return state.printer.current_file.filament_total;
        }

        return 0;
    },

    fan: state => {
        return Object.entries(state.printer).indexOf("fan") ? state.printer.fan : false;
    },

    is_printing: state => {
        return (["printing", "paused"].includes(state.printer.print_stats.state));
    },

    getMacros: state => {
        let array = [];
        let hiddenMacros = [];
        state.gui.dashboard.hiddenMacros.forEach(function(item,index) {
            hiddenMacros[index] = item.toLowerCase();
        });

        for (let prop in state.printer.configfile.config) {
            if (prop.startsWith("gcode_macro") &&
                !Object.hasOwnProperty.call(state.printer.configfile.config[prop], "rename_existing") &&
                !(hiddenMacros.indexOf(prop.replace("gcode_macro ", "").toLowerCase()) > -1)
            ) {
                array.push({
                    "name": prop.replace("gcode_macro ", ""),
                    "prop": state.printer.configfile.config[prop]
                });
            }
        }

        return array.sort(caseInsensitiveNameSort);
    },

    getAllMacros: state => {
        let array = [];

        for (let prop in state.printer.configfile.config) {
            if (prop.startsWith("gcode_macro") &&
                !Object.hasOwnProperty.call(state.printer.configfile.config[prop], "rename_existing")) {
                array.push({
                    "name": prop.replace("gcode_macro ", ""),
                    "prop": state.printer.configfile.config[prop]
                });
            }
        }

        return array.sort(caseInsensitiveNameSort);
    },

    getFilamentSwitchSensors: state => {
        let sensors = [];

        for (let [key, value] of Object.entries(state.printer)) {
            let nameSplit = key.split(" ");

            if (nameSplit[0] === "filament_switch_sensor") {
                sensors.push({
                    name: nameSplit[1],
                    enabled: value.enabled,
                    filament_detected: value.filament_detected,
                });
            }
        }

        return sensors.sort(caseInsensitiveNameSort);
    },

    getBedMeshProfiles: state => {
        let profiles = [];
        let currentProfile = "";
        if (state.printer.bed_mesh) {
            currentProfile = state.printer.bed_mesh.profile_name;
        }

        for (let [key, value] of Object.entries(state.printer.configfile.config)) {
            let nameSplit = key.split(" ");

            if (nameSplit.length > 1 && nameSplit[0] === "bed_mesh" && nameSplit[1] !== undefined) {
                profiles.push({
                    name: nameSplit[1],
                    data: value,
                    is_active: (currentProfile === nameSplit[1] ? true: false),
                });
            }
        }

        return profiles.sort(caseInsensitiveNameSort);
    },

    getTitle: state => {
        if (state.socket.isConnected) {
            if (state.printer.webhooks.state !== "ready") return "ERROR";
            else if (state.printer.print_stats.state === "paused") return "Pause Print";
            else if (state.printer.print_stats.state === "printing") return (state.printer.virtual_sdcard.progress * 100).toFixed(0)+"% Printing - "+state.printer.print_stats.filename;
            else if (state.printer.print_stats.state === "complete") return "Complete - "+state.printer.print_stats.filename;

            return state.gui.general.printername ? state.gui.general.printername : state.printer.hostname;
        } else return "Mainsail";
    },

    showDashboardWebcam: state => {
        return (state.gui.webcam.url !== "" && state.gui.dashboard.boolWebcam);
    },

    getCurrentExtruder: state => {
        if (state.printer.configfile.config === null) return null;

        let extruder = {
            name: "",
            status: null,
            config: null,
        };
        let extruderName = state.printer.toolhead.extruder;
        extruder.name = extruderName;

        if (state.printer.configfile.config[extruderName]) {
            extruder.config = state.printer.configfile.config[extruderName];
        }

        if (state.printer[extruderName]) {
            extruder.status = state.printer[extruderName];
        }

        return extruder;
    },

    powerDevices: state => {
        return state.power.devices;
    },

    powerDevicesCount: (state, getters) => {
        return getters.powerDevices.length;
    },
}
