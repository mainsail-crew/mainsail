import Vue from "vue";
import { colorArray, colorChamber, colorHeaterBed, temperaturChartSampleInterval, temperaturChartSampleLength } from './variables';

export default {
    setConnected (state) {
        state.socket.isConnected = true;
    },

    setDisconnected (state) {
        state.socket.isConnected = false
        Vue.prototype.$socket.reconnect();
    },

    setPrinterData(state, data) {
        Object.assign(state.printer, data);

        if (Array.isArray(state.object.heater.available_heaters) && state.object.heater.available_heaters.length) {
            let boolAddValues = false;
            let now = new Date();

            if (state.temperaturChart.labels.length === 0 || now - state.temperaturChart.labels[state.temperaturChart.labels.length - 1] > temperaturChartSampleInterval) {
                for (let [key, value] of Object.entries(data)) {
                    let keySplit = key.split(" ");

                    if (state.object.heater.available_heaters.includes(key) || keySplit[0] === "temperature_fan") {
                        if (keySplit[0] === "temperature_fan") key = keySplit[1];

                        let index =  state.temperaturChart.datasets.findIndex(element => element.label === key);

                        if (index >= 0) state.temperaturChart.datasets[index].data.push(value.temperature.toFixed(1));
                        else {
                            let color = '#f87979';

                            switch (key) {
                                case 'heater_bed': color = colorHeaterBed; break;
                                case 'chamber': color = colorChamber; break;
                                default: color = colorArray[state.temperaturChart.datasets.length]; break;
                            }

                            state.temperaturChart.datasets.push({
                                label: key,
                                data: [value.temperature.toFixed(1)],
                                borderColor: color,
                                backgroundColor: color,
                                fill: false,
                                borderDash: undefined,
                                borderWidth: 2,
                                pointRadius: 0,
                                pointHitRadius: 0,
                                showLine: true
                            });
                        }

                        boolAddValues = true;
                    }
                }

                if (boolAddValues) {
                    state.temperaturChart.labels.push(now);

                    if (state.temperaturChart.labels.length > temperaturChartSampleLength) {
                        state.temperaturChart.labels.splice(0, state.temperaturChart.labels.length-temperaturChartSampleLength)
                    }
                }

                for (let [key, dataset] of Object.entries(state.temperaturChart.datasets)) {
                    if (dataset.data.length > temperaturChartSampleLength) {
                        state.temperaturChart.datasets[key].data.splice(0, dataset.data.length-temperaturChartSampleLength)
                    }
                }

            }
        }
    },

    setObjectData(state, data) {
        Object.assign(state.object, data);

        for (let key of Object.keys(data)) {
            let nameSplit = key.split(" ");

            if (nameSplit[0] === "temperature_fan") {
                Vue.prototype.$socket.sendObj('post_printer_subscriptions', { [key]: [] });
            }
        }
    },

    setPrinterConfig(state, data) {
        Vue.set(state, 'config', data.configfile.config);
    },

    setFileList(state, data) {
        state.files = [];

        for (let [key, file] of Object.entries(data)) {
            state.files.push({
                number: key,
                filename: file.filename,
                modified: Date.parse(file.modified),
                size: file.size,
            });
        }
        //state.files = data;
    },

    addGcodeResponse(state, data) {
        state.events.push({
            date: new Date(),
            message: data
        });

        if (data.substring(0,2) === "!!") {
            Vue.$toast.error(data);
        }
    },

    setLoadingSendGcode(state, value) {
        state.socket.loadingSendGcode = value;
    },

    sendGcode(state) {
        state.socket.loadingSendGcode = false;
    },

    setPrinterStatus(state, value) {
        state.printer.toolhead.status = value;
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

    setLoadingHome(state, value) {
        state.socket.loadingHome = value;
    },

    setLoadingHomeX(state, value) {
        state.socket.loadingHomeX = value;
    },

    setLoadingHomeY(state, value) {
        state.socket.loadingHomeY = value;
    },

    setLoadingHomeZ(state, value) {
        state.socket.loadingHomeZ = value;
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