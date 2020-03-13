import Vue from 'vue'
import Vuex from 'vuex'
import VueToast from 'vue-toast-notification';
import router from '../plugins/router'

Vue.use(Vuex);
Vue.use(VueToast);

let colorArray = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#00BCD4',
    '#009688',
];

const colorHeaterBed = '#2196F3';
const colorChamber = '#4CAF50';
const temperaturChartSampleInterval = 1000;
const temperaturChartSampleLength = 600;

export default new Vuex.Store({
    state: {
        socket: {
            isConnected: false,
            loadingGcodeUpload: false,
            loadingGcodeRefresh: false,
            loadingEmergencyStop: false,
            loadingPrintPause: false,
            loadingPrintResume: false,
            loadingHomeX: false,
            loadingHomeY: false,
            loadingHomeZ: false,
            loadingRestart: false,
            loadingRestartFirmware: false,
        },
        printer: {
            hostname: '',
            version: '',
            toolhead: {
                position: [],
                homed_axes: [],
                status: "",
                print_time: 0,
                printing_time: 0,
                estimated_print_time: 0,
            },
            pause_resume: {
                is_paused: false
            },
            idle_timeout: {
                printing_time: 0,
                state: "",
            },
            virtual_sdcard: {
                process: 0,
                current_file: "",
                is_active: false,
                filament_used: 0,
                file_position: 0,
                print_duration: 0,
                total_duration: 0,
            }
        },
        object: {
            heater: {
                available_heaters: []
            }
        },
        temperaturChart: {
            labels: [],
            datasets: [],
        },
        files: [],
        events: []
    },

    getters: {
        toolhead(state) {
            return (state.socket.isConnected) ? state.printer.toolhead : null;
        },

        heaters: state => {
            let heaters = [];

            if (state.object.heater.available_heaters) {
                for (let [key, value] of Object.entries(state.printer)) {
                    if (state.object.heater.available_heaters.includes(key)) {
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

        current_file_size: state =>  {
            let current_file = state.printer.virtual_sdcard.current_file;
            let files = state.files;

            if (current_file !== '') {
                files.filter(file => file.name == current_file);
                if (files.length) return files[0].size;
            }

            return 0;
        },
    },

    mutations: {
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

        setFileList(state, data) {
            state.files = data;
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

        setLoadingHomeX(state, value) {
            state.socket.loadingHomeX = value;
        },

        setLoadingHomeY(state, value) {
            state.socket.loadingHomeY = value;
        },

        setLoadingHomeZ(state, value) {
            state.socket.loadingHomeZ = value;
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
    },

    actions: {
        socket_on_open ({ commit }) {
            commit('setConnected');
            window.console.log('Socket connected');
        },

        socket_on_close ({ commit }, event) {
            commit('setDisconnected')
            if (event.wasClean) {
                window.console.log('Socket closed clear')
            } else {
                window.console.error('Connection failure')
            }
            window.console.error('Code: ' + event.code)
        },

        socket_on_error ({ commit }, data) {
            commit('reportError', data);
        },

        socket_on_message ({ commit, state }, data) {
            if (!state.socket.isConnected) commit('setConnected');
            switch(data.method) {
                case 'notify_status_update':
                    commit('setPrinterData', data.params[0]);
                    break;

                case 'notify_gcode_response':
                    commit('addGcodeResponse', data.params[0]);
                    break;

                case 'notify_printer_state_changed':
                    commit('setPrinterStatus', data.params[0]);
                    break;

                /*case 'notify_klippy_state_changed':
                    commit('setPrinterStatus', data.params[0]);
                    break;*/

                case 'notify_filelist_changed':
                    commit('setFileList', data.params[0].filelist);
                    break;

                case 'notify_paused_state_changed':
                    commit('setPausedState', data.params[0]);
                    break;

                default:
                    if (data.result !== "ok") {
                        window.console.log("Default return");
                        if (data.error) window.console.error("JSON-RPC: " + data.error.message);
                        else window.console.log(data);
                    }
            }
        },

        socket_reconnect ({ commit }, count) {
            commit('setConnected');
            window.console.log(count)
        },

        socket_reconnect_error ({ commit }) {
            commit('setDisconnected');
            window.console.error('Socket disconnected')
        },

        getKlipperInfo({ commit }, data) {
            commit('setPrinterData', {
                hostname: data.hostname,
                version: data.version
            });
        },

        getObjectInfo({ commit }, data) {
            commit('setObjectData', data);
        },

        addSubscription(state, data) {
            window.console.log(state);
            window.console.log(data);
        },

        getFileList({ commit }, data) {
            commit('setFileList', data);
            commit('setLoadingGcodeRefresh', false);
        },

        setLoadingSendGcode({commit}, value) {
            commit('setLoadingSendGcode', value);
        },

        setLoadingEmergencyStop({commit}) {
            commit('setLoadingEmergencyStop', false);
        },

        setLoadingPrintPause({commit}) {
            commit('setLoadingPrintPause', false);
        },

        setLoadingPrintResume({commit}) {
            commit('setLoadingPrintResume', false);
        },

        setLoadingPrintCancel({commit}) {
            commit('setLoadingPrintCancel', false);
        },

        sendGcode({commit}, data) {
            commit('setLoadingSendGcode', false);
            commit('sendGcode', data);
        },

        responseHomeX({commit}) {
            commit('setLoadingHomeX', false);
        },

        responseHomeY({commit}) {
            commit('setLoadingHomeY', false);
        },

        responseHomeZ({commit}) {
            commit('setLoadingHomeZ', false);
        },

        responseRestart({commit}) {
            commit('setLoadingRestart', false);
        },

        responseRestartFirmware({commit}) {
            commit('setLoadingRestartFirmware', false);
        },

        switchToDashboard() {
            router.push("/");
        }
    }
});