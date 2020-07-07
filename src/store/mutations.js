import Vue from "vue";
const objectAssignDeep = require(`object-assign-deep`);
import { colorArray, colorChamber, colorHeaterBed, temperaturChartSampleLength } from './variables';

export default {

    setConnected (state) {
        state.socket.isConnected = true;

        //reset store
    },

    setDisconnected (state) {
        state.socket.isConnected = false;
        //Vue.prototype.$socket.reconnect();
    },

    resetPrinter(state) {
        window.console.log("restart printer state");
        Vue.set(state, '', {
                state: {
                    loadings: [],
                    config: {},
                    object: {
                        heaters: {
                            available_heaters: []
                        }
                    },
                    temperaturChart: {
                        labels: [],
                        datasets: [],
                    },
                    helplist: [],
                    files: [],
                }
            }
        );
    },

    setPrinterData(state, data) {
        Object.assign(state.printer, data);

        if (Array.isArray(state.object.heaters.available_heaters) && state.object.heaters.available_heaters.length) {
            let now = Date.now();

            for (let [key, value] of Object.entries(data)) {
                let keySplit = key.split(" ");

                if (state.object.heaters.available_heaters.includes(key) || keySplit[0] === "temperature_fan" || keySplit[0] === "temperature_probe") {
                    if (keySplit[0] === "temperature_fan") key = keySplit[1];
                    if (keySplit[0] === "temperature_probe") key = "probe";

                    this.commit('addTemperatureChartValue', { name: key, value: value, time: now });
                }
            }
        }
    },

    setHeaterHistory(state, data) {
        let now = new Date();

        if (data !== undefined) {
            Object.entries(data).sort().forEach(([key, datasets]) => {
                let keySplit = key.split(" ");

                if (keySplit.length > 1) key = keySplit[1];
                if (keySplit[0] === "temperature_probe") key = "probe";

                let max = datasets.temperatures.length;
                for (let i = 0; i < max; i++) {
                    let time = new Date(now.getTime() - 1000 * (max - i));
                    this.commit('addTemperatureChartValue', {
                        name: key,
                        value: {
                            temperature: datasets.temperatures[i],
                            target: datasets.targets[i],
                        },
                        type: keySplit[0],
                        time: time
                    });
                }
            });
        }
    },

    addTemperatureChartValue(state, payload) {
        if (state.temperaturChart.labels.map(Number).indexOf(+payload.time) < 0) {
            state.temperaturChart.labels.push(payload.time);

            if (state.temperaturChart.labels.length > temperaturChartSampleLength) {
                state.temperaturChart.labels = state.temperaturChart.labels.splice(state.temperaturChart.labels.length - temperaturChartSampleLength)
            }
        }

        let index =  state.temperaturChart.datasets.findIndex(element => element.label === payload.name);
        if (index < 0) {
            this.commit('addTemperatureChartHeater', {
                name: payload.name,
                type: payload.type,
            });
            index =  state.temperaturChart.datasets.findIndex(element => element.label === payload.name);
        }
        let index_target =  state.temperaturChart.datasets.findIndex(element => element.label === payload.name+'_target');

        if (index >= 0) state.temperaturChart.datasets[index].data.push(payload.value.temperature.toFixed(1));
        if (index_target >= 0) state.temperaturChart.datasets[index_target].data.push(payload.value.target.toFixed(1));

        if (index >= 0 && state.temperaturChart.datasets[index].data.length > temperaturChartSampleLength) {
            state.temperaturChart.datasets[index].data = state.temperaturChart.datasets[index].data.splice(state.temperaturChart.datasets[index].data.length - temperaturChartSampleLength)
        }

        if (index_target >= 0 && state.temperaturChart.datasets[index_target].data.length > temperaturChartSampleLength) {
            state.temperaturChart.datasets[index_target].data = state.temperaturChart.datasets[index_target].data.splice(state.temperaturChart.datasets[index_target].data.length - temperaturChartSampleLength)
        }
    },

    addTemperatureChartHeater(state, payload) {
        let color = '';

        switch (payload.name) {
            case 'heater_bed': color = colorHeaterBed; break;
            case 'chamber': color = colorChamber; break;
            default: color = colorArray[state.temperaturChart.datasets.length]; break;
        }

        let hidden = state.gui.dashboard.hiddenTempChart.indexOf(payload.name.toUpperCase()) >= 0 ? true : null;

        state.temperaturChart.datasets.push({
            label: payload.name,
            data: [],
            borderColor: color,
            backgroundColor: color,
            fill: false,
            borderDash: undefined,
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 5,
            showLine: true,
            lineTension: 0,
            hidden: hidden,
        });

        if (payload.type !== "temperature_sensor") {
            state.temperaturChart.datasets.push({
                label: payload.name+"_target",
                data: [],
                borderColor: color,
                backgroundColor: color+'20',
                fill: true,
                borderDash: undefined,
                borderWidth: 0,
                pointRadius: 0,
                pointHitRadius: 0,
                showLine: true,
                lineTension: 0,
                hidden: hidden,
            });
        }
    },

    setHeaterChartVisibility(state, data) {
        let index = state.gui.dashboard.hiddenTempChart.indexOf(data.name.toUpperCase());

        if (data.hidden && index === -1) state.gui.dashboard.hiddenTempChart.push(data.name.toUpperCase())
        else if (data.hidden !== true && index > -1) state.gui.dashboard.hiddenTempChart.splice(index, 1);
    },

    setSettings(state, data) {
        state = objectAssignDeep(state, data);
    },

    setObjectData(state, data) {
        Object.assign(state.object, data);

        for (let key of Object.keys(data)) {
            let nameSplit = key.split(" ");

            if (
                nameSplit[0] === "temperature_fan" ||
                nameSplit[0] === "temperature_probe" ||
                nameSplit[0] === "temperature_sensors" ||
                nameSplit[0] === "filament_switch_sensor"
            ) Vue.prototype.$socket.sendObj('post_printer_objects_subscription', { [key]: [] });
        }
    },

    setPrinterConfig(state, data) {
        if (data.configfile) Vue.set(state, 'config', data.configfile.config);
    },

    setFileList(state, data) {
        state.files = [];
        //window.console.log(data);
        let array = Object.entries(data);

        for (let [key, file] of array) {
            if (file.filename !== "gui.json") {
                state.files.push({
                    number: key,
                    filename: file.filename,
                    modified: Date.parse(file.modified),
                    size: file.size,
                    slicer: file.slicer,
                    filament_total: file.filament_total,
                    estimated_time: file.estimated_time,
                    layer_height: file.layer_height,
                    first_layer_height: file.first_layer_height,
                    object_height: file.object_height,
                    thumbnails : file.thumbnails ? file.thumbnails : [],
                });
            }
        }
        //state.files = data;
    },

    setHelpList(state, data) {
        state.helplist = [];

        for (let [command, description] of Object.entries(data)) {
            state.helplist.push({
                'commandLow': command.toLowerCase(),
                'command': command,
                'description': description,
            });
        }
    },

    addGcodeResponse(state, data) {
        state.events.push({
            date: new Date(),
            message: data
        });

        if (data !== undefined && data.substring(0,2) === "!!") {
            Vue.$toast.error(data);
        }
    },

    setEndstopStatus(state, data) {
        Vue.set(state.printer, 'endstops', data);
    },

    setLoadingSendGcode(state, value) {
        state.socket.loadingSendGcode = value;
    },

    sendGcode(state) {
        state.socket.loadingSendGcode = false;
    },

    setLoading(state, data) {
        if (!state.loadings.includes(data.name)) {
            state.loadings.push(data.name);
        }
    },

    removeLoading(state, data) {
        state.loadings = state.loadings.filter(function(ele){ return ele !== data.name; });
    },

    setPrinterStatus(state, value) {
        window.console.log("setPrinterStatus");
        window.console.log(value);
        state.socket.klippy_state = value;
        if (value === "disconnect") state.socket.is_ready = false;
        else if (value === "ready") Vue.prototype.$socket.sendObj('get_printer_info', {}, 'getKlipperInfo');
    },

    setKlippyStatus(state, value) {
        state.socket.klippy_state = value;
        window.console.log("setKlippyStatus");
        window.console.log(value);
    },

    setPrinterStatusDetails(state, data) {
        state.socket.error_detected = data.error_detected;
        state.socket.is_ready = data.is_ready;
        state.socket.klippy_message = data.message;
    },

    setLoadingGcodeUpload(state, value) {
        state.socket.loadingGcodeUpload = value;
    },

    setLoadingGcodeRefresh(state, value) {
        state.socket.loadingGcodeRefresh = value;
    },

    setLoadingEmergencyStop(state, value) {
        state.socket.loadingEmergencyStop = value;
    },

    setLoadingPrintPause(state, value) {
        state.socket.loadingPrintPause = value;
    },

    setLoadingPrintResume(state, value) {
        state.socket.loadingPrintResume = value;
    },

    setLoadingPrintCancel(state, value) {
        state.socket.loadingPrintCancel = value;
    },

    setLoadingQGL(state, value) {
        state.socket.loadingQGL = value;
    },

    setLoadingRestart(state, value) {
        state.socket.loadingRestart = value;
    },

    setLoadingRestartFirmware(state, value) {
        state.socket.loadingRestartFirmware = value;
    },

    setLoadingRebootHost(state, value) {
        state.socket.loadingRebootHost = value;
    },

    setLoadingShutdownHost(state, value) {
        state.socket.loadingShutdownHost = value;
    },

    setLoadingSaveGuiConfige(state, value) {
        state.socket.loadingSaveGuiConfig = value;
    },

    setLoadingEndstopStatus(state, value) {
        state.socket.loadingEndstopStatus = value;
    },

    reportError(state, data) {
        //Vue.$toast.error(data.message);
        window.console.log(data);
    },

    setPausedState(state, data) {
        switch (data) {
            case 'paused':
                state.printer.pause_resume.is_paused = true;
                break;

            case 'resumed':
                state.printer.pause_resume.is_paused = false;
                break;

            case 'cleared':
                state.printer.pause_resume.is_paused = false;
                break;

            default:
                window.console.log('setPausedState -> Default: '+data);
        }
    },

    voidMutation() {

    },
}