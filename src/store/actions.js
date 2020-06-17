import Vue from 'vue'
import router from "../plugins/router";
import store from "./index";
import axios from "axios";


export default {
    socket_on_open ({ commit }) {
        commit('setConnected');
        Vue.prototype.$socket.sendObj('get_printer_status', { }, 'getHelpData');

        fetch('http://'+store.state.socket.hostname+':'+store.state.socket.port+'/printer/files/gui.json')
        .then(res => res.json()).then(file => {
            store.commit('setSettings', file);
        }).catch(function() {
            window.console.warn('No mainsail config file found.');
        });

        Vue.prototype.$socket.sendObj('get_printer_info', {}, 'getKlipperInfo');
    },

    socket_on_close ({ commit }, event) {
        commit('setDisconnected');
        if (event.wasClean) {
            window.console.log('Socket closed clear')
        } else {
            window.console.error('Connection failure')
        }
        window.console.error('Code: ' + event.code)
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

            case 'notify_klippy_state_changed':
                commit('setPrinterStatus', data.params[0]);
                break;

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

    saveGuiSettings({ commit, state }) {
        commit('setLoadingSaveGuiConfige', true);
        let file = new File([JSON.stringify({ webcam: state.webcam, gui: state.gui })], 'gui.json');

        let formData = new FormData();
        formData.append('file', file);

        axios.post('http://' + state.socket.hostname + ':' + state.socket.port + '/printer/files/upload',
            formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        ).then(() => {
            commit('setLoadingSaveGuiConfige', false);
        }).catch(() => {
            window.console.error("Error save gui.json!");
        });
    },

    getKlipperInfo({ commit }, data) {
        if (data !== undefined && data.is_ready) {
            commit('setPrinterData', {
                hostname: data.hostname,
                version: data.version
            });

            commit('setPrinterStatus', 'ready');

            Vue.prototype.$socket.sendObj('get_printer_objects', {}, 'getObjectInfo');
            Vue.prototype.$socket.sendObj('get_printer_status', { heaters: [] }, 'getHeatersInfo');
            Vue.prototype.$socket.sendObj('get_printer_status', { configfile: ['config'] }, 'getPrinterConfig');
            Vue.prototype.$socket.sendObj('post_printer_subscriptions', {
                gcode: [],
                toolhead: [],
                virtual_sdcard: [],
                heaters: [],
                fan: [],
                pause_resume: [],
                idle_timeout: [],
                display_status: [],
            });
            Vue.prototype.$socket.sendObj('get_printer_files', {}, 'getFileList');
            Vue.prototype.$socket.sendObj('get_printer_gcode_help', {}, 'getHelpList');
        } else {
            commit('setPrinterStatus', 'disconnected');

            setTimeout(function() {
                Vue.prototype.$socket.sendObj('get_printer_info', {}, 'getKlipperInfo');
            }, 1000);
        }
    },

    getObjectInfo({ commit }, data) {
        commit('setObjectData', data);
    },

    getHeatersInfo({ commit }, data) {
        commit('setObjectData', data);

        if (data.heaters.available_heaters.length) {
            data.heaters.available_heaters.forEach(function(heater) {
                Vue.prototype.$socket.sendObj('post_printer_subscriptions', { [heater]: [] });
            })
        }

        Vue.prototype.$socket.sendObj("get_server_temperature_store", {}, "getHeatersHistory");
    },

    getHeatersHistory({ commit }, data) {
        commit('setHeaterHistory', data);
    },

    getPrinterConfig({commit}, data) {
        commit('setPrinterConfig', data);
    },

    getFileList({ commit }, data) {
        commit('setFileList', data);
        commit('setLoadingGcodeRefresh', false);
    },

    getHelpList({ commit }, data) {
        commit('setHelpList', data);
    },

    setHeaterChartVisibility({ commit, dispatch }, data) {
        commit('setHeaterChartVisibility', data);
        dispatch('saveGuiSettings');
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
        commit('addGcodeResponse', data);
    },

    responseHome({commit}) {
        commit('removeLoading', { name: 'controlHomeAll' });
    },

    responseHomeX({commit}) {
        commit('removeLoading', { name: 'controlHomeX' });
    },

    responseHomeY({commit}) {
        commit('removeLoading', { name: 'controlHomeY' });
    },

    responseHomeZ({commit}) {
        commit('removeLoading', { name: 'controlHomeZ' });
    },

    responseQGL({commit}) {
        commit('setLoadingQGL', false);
    },

    responseRestart({commit}) {
        commit('setLoadingRestart', false);
    },

    responseRestartFirmware({commit}) {
        commit('setLoadingRestartFirmware', false);
    },

    responseEndstopStatus({ commit }, data) {
        commit('setLoadingEndstopStatus', false);
        commit('setEndstopStatus', data);
    },

    respondeExtruderRetract({commit}) {
        commit('removeLoading', { name: 'extruderRetract' });
    },

    respondeExtruderDetract({commit}) {
        commit('removeLoading', { name: 'extruderDetract' });
    },

    respondeBabySteppingDown({commit}) {
        commit('removeLoading', { name: 'babySteppingDown' });
    },

    respondeBabySteppingUp({commit}) {
        commit('removeLoading', { name: 'babySteppingUp' });
    },

    switchToDashboard() {
        router.push("/");
    },

    getHelpData({ commit }, data) {
        commit('voidMutation', data);
    },

    setSettings({ commit }, data) {
        commit('setSettings', data);
    },
}