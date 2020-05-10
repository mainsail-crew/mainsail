export default {
    toolhead(state) {
        return (state.socket.isConnected) ? state.printer.toolhead : null;
    },

    heaters: state => {
        let heaters = [];

        if (state.object.heaters.available_heaters) {
            for (let [key, value] of Object.entries(state.printer)) {
                if (state.object.heaters.available_heaters.includes(key)) {
                    heaters.push({
                        name: key,
                        target: value.target,
                        temperature: value.temperature,
                    });
                }
            }
        }

        return heaters.sort((a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();

            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return 0;
        });
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

        return fans.sort((a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();

            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return 0;
        });
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
        }

        return sensors.sort((a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();

            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return 0;
        });
    },

    current_file_size: state =>  {
        let file = state.files.filter((file) => file.filename === state.printer.virtual_sdcard.current_file);

        if (file.length) return file[0]['size'];

        return 0;
    },

    current_file_metadata: state => {
        let file = state.files.filter((file) => file.filename === state.printer.virtual_sdcard.current_file);

        if (file.length) return file[0];

        return []
    },

    current_file_estimated_time: state =>  {
        let file = state.files.filter((file) => file.filename === state.printer.virtual_sdcard.current_file);

        if (file.length) return file[0]['estimated_time'];

        return 0;
    },

    current_file_filament_total: state =>  {
        let file = state.files.filter((file) => file.filename === state.printer.virtual_sdcard.current_file);

        if (file.length) return file[0]['filament_total'];

        return 0;
    },

    bool_fan: state => {
        return Object.entries(state.object).indexOf('fan');
    },

    is_printing: state => {
        return (state.printer.virtual_sdcard.current_file !== "");
    },

    getMacros: state => {
        let array = [];
        let hiddenMacros = [];
        state.gui.dashboard.hiddenMacros.forEach(function(item,index) {
            hiddenMacros[index] = item.toLowerCase();
        });

        for (let prop in state.config) {
            if (prop.startsWith('gcode_macro') &&
                !Object.hasOwnProperty.call(state.config[prop], 'rename_existing') &&
                !(hiddenMacros.indexOf(prop.replace('gcode_macro ', '').toLowerCase()) > -1)
            ) {
                array.push({
                    'name': prop.replace('gcode_macro ', ''),
                    'prop': state.config[prop]
                });
            }
        }

        return array.sort((a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();

            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return 0;
        });
    },

    getAllMacros: state => {
        let array = [];

        for (let prop in state.config) {
            if (prop.startsWith('gcode_macro') &&
                !Object.hasOwnProperty.call(state.config[prop], 'rename_existing')) {
                array.push({
                    'name': prop.replace('gcode_macro ', ''),
                    'prop': state.config[prop]
                });
            }
        }

        return array.sort((a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();

            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return 0;
        });
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

        return sensors.sort((a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();

            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return 0;
        });
    },

    getBedMeshProfiles: state => {
        let profiles = [];

        for (let [key, value] of Object.entries(state.config)) {
            let nameSplit = key.split(" ");

            if (nameSplit[0] === "bed_mesh" && nameSplit[1] !== undefined) {
                profiles.push({
                    name: nameSplit[1],
                    data: value
                });
            }
        }

        return profiles.sort((a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();

            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return 0;
        });
    },

    getTitle: state => {
        if (state.socket.isConnected) {
            if (state.printer.pause_resume.is_paused) return "Pause Print";
            else if (state.printer.virtual_sdcard.is_active) return (state.printer.virtual_sdcard.progress * 100).toFixed(0)+"% Printing - "+state.printer.virtual_sdcard.current_file;

            return state.printer.hostname;
        } else return "KlipperWebControl";
    },

    showDashboardWebcam: state => {
        return (state.webcam.url !== "" && state.gui.dashboard.boolWebcam);
    }
}