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
        },
        printer: {
            hostname: '',
            version: '',
            toolhead: {
                position: [],
                status: "",
                print_time: 0,
                printing_time: 0,
                estimated_print_time: 0,
            },
            pause_resume: {
                is_paused: false
            },
            idle_timeout: {
                printing_time: 0
            },
            virtual_sdcard: {
                process: 0
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
        }
    },

    mutations: {
        setConnected (state) {
            state.socket.isConnected = true;
        },

        setDisconnected (state) {
            state.socket.isConnected = false
        },

        setPrinterData(state, data) {
            Object.assign(state.printer, data);

            if (state.object.heater.available_heaters.length) {
                let boolAddValues = false;
                let now = new Date();

                if (state.temperaturChart.labels.length === 0 || now - state.temperaturChart.labels[state.temperaturChart.labels.length - 1] > temperaturChartSampleInterval) {
                    for (let [key, value] of Object.entries(data)) {
                        if (state.object.heater.available_heaters.includes(key)) {
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
        },

        setFileList(state, data) {
            state.files = data;
        },

        addGcodeResponse(state, data) {
            state.events.push({
                date: new Date(),
                message: data
            });

            if (data.substring(0,2) === "//") {
                data = data.replace("//", "");
                Vue.$toast.warning(data);
            } else if (data.substring(0,2) === "!!") {
                data = data.replace("!!", "");
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

        reportError(state, data) {
            Vue.$toast.error(data.message);
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
                    window.console.log("Default return");
                    if (data.error) window.console.error("JSON-RPC: " + data.error.message);
                    else window.console.log(data);
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

        switchToDashboard(state) {
            window.console.log(state);
            router.push("/");
        }
    }
});