import Vue from 'vue'
import router from "../plugins/router";
import store from "./index";
import axios from "axios";


export default {
    socket_on_open ({ commit }) {
        commit('setConnected');
        Vue.prototype.$socket.sendObj('get_printer_objects_status', { }, 'getHelpData');
        Vue.prototype.$socket.sendObj('get_directory', { path: 'gcodes' }, 'getDirectoryRoot');
        Vue.prototype.$socket.sendObj('get_printer_info', {}, 'getKlipperInfo');
    },

    socket_on_close ({ commit }, event) {
        commit('setDisconnect');
        if (event.wasClean) window.console.log('Socket closed clear')
        else window.console.error('Connection failure')

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
                commit('setKlippyStatus', data.params[0]);
                break;

            case 'notify_filelist_changed':
                commit('setFileList', data.params[0].filelist);
                break;

            case 'notify_paused_state_changed':
                commit('setPausedState', data.params[0]);
                break;

            default:
                if (data.result !== "ok") {
                    if (data.error && data.error.message !== "Klippy Request Timed Out") window.console.error("JSON-RPC: " + data.error.message);
                }
        }
    },

    getDirectoryRoot({ commit }, data) {
        if (data.files && data.files.filter((file) => file.filename === "gui.json")) {
            fetch('http://'+store.state.socket.hostname+':'+store.state.socket.port+'/server/files/gcodes/gui.json')
                .then(res => res.json()).then(file => {
                commit('setSettings', file);
            });
        }
    },

    saveGuiSettings({ commit, state }) {
        commit('setLoadingSaveGuiConfige', true);
        let file = new File([JSON.stringify({ webcam: state.webcam, gui: state.gui })], 'gui.json');

        let formData = new FormData();
        formData.append('file', file);

        axios.post('http://' + state.socket.hostname + ':' + state.socket.port + '/server/files/upload',
            formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        ).then(() => {
            commit('setLoadingSaveGuiConfige', false);
        }).catch(() => {
            window.console.error("Error save gui.json!");
        });
    },

    getKlipperInfo({ commit, state }, data) {
        if (data !== undefined && data.is_ready && !state.socket.is_ready) {
            commit('resetPrinter');
            commit('setPrinterData', {
                hostname: data.hostname,
                version: data.version
            });

            commit('setPrinterStatus', 'ready');

            Vue.prototype.$socket.sendObj('get_printer_objects_list', {}, 'getObjectInfo');
            Vue.prototype.$socket.sendObj('get_printer_objects_status', { heaters: [] }, 'getHeatersInfo');
            Vue.prototype.$socket.sendObj('get_printer_objects_status', { configfile: ['config'] }, 'getPrinterConfig');
            Vue.prototype.$socket.sendObj('post_printer_objects_subscription', {
                gcode: [],
                toolhead: [],
                virtual_sdcard: [],
                heaters: [],
                fan: [],
                pause_resume: [],
                idle_timeout: [],
                display_status: [],
            });
            Vue.prototype.$socket.sendObj('get_file_list', {}, 'getFileList');
            Vue.prototype.$socket.sendObj('get_directory', { path: 'gcodes' }, 'getDirectory');
            Vue.prototype.$socket.sendObj('get_printer_gcode_help', {}, 'getHelpList');
        } else if (data !== undefined && !data.is_ready) commit('setPrinterStatus', 'disconnect');

        commit('setPrinterStatusDetails', data);

        setTimeout(function() {
            if (state.socket.is_ready) Vue.prototype.$socket.sendObj('get_printer_info', {}, 'getKlipperInfo');
        }, 5000);
    },

    getObjectInfo({ commit }, data) {
        commit('setObjectData', data);

        let subscripts = {}

        for (let key of Object.keys(data)) {
            let nameSplit = key.split(" ");

            if (
                nameSplit[0] === "temperature_fan" ||
                nameSplit[0] === "temperature_probe" ||
                nameSplit[0] === "temperature_sensors" ||
                nameSplit[0] === "filament_switch_sensor" ||
                nameSplit[0] === "bed_mesh"
            )  subscripts = {...subscripts, [key]: []}
        }

        if (subscripts !== {}) Vue.prototype.$socket.sendObj('post_printer_objects_subscription', subscripts);
        if (subscripts.bed_mesh) Vue.prototype.$socket.sendObj('get_printer_objects_status', { bed_mesh: [] }, 'getPrinterData');
    },

    getPrinterData({ commit }, data) {
        commit('setPrinterData', data);
    },

    getHeatersInfo({ commit }, data) {
        commit('setObjectData', data);

        if (data.heaters && data.heaters.available_heaters && data.heaters.available_heaters.length) {
            let subscripts = {};

            data.heaters.available_heaters.forEach(function(heater) {
                subscripts = {...subscripts, [heater]: []}
            });

            Vue.prototype.$socket.sendObj('post_printer_objects_subscription', subscripts );
            Vue.prototype.$socket.sendObj("get_server_temperature_store", {}, "getHeatersHistory");
        }

    },

    getHeatersHistory({ commit }, data) {
        commit('setHeaterHistory', data);
    },

    getPrinterConfig({commit}, data) {
        commit('setPrinterConfig', data);
    },

    getFileList({ commit }, data) {
        commit('setFileList', data);
        commit('removeLoading', 'loadingGcodeRefresh');
    },

    getDirectory({ commit }, data) {
        commit('setDirectory', data);
        commit('removeLoading', { name: 'loadingGcodeRefresh' });
    },

    getMetadata({ commit }, data) {
        commit('setMetadata', data);
    },

    getMetadataCurrentFile({ commit }, data) {
        commit('setMetadataCurrentFile', data);
    },

    getPostDirectory({ commit }, data) {
        if (data.error) {
            Vue.$toast.error(data.error.message);
        } else if (data.result === "ok") {
            let currentPath = data.requestParams.path.substr(0, data.requestParams.path.lastIndexOf("/"));
            let newPath = data.requestParams.path.substr(data.requestParams.path.lastIndexOf("/")+1);

            Vue.$toast.success("Successfully created "+newPath);
            Vue.prototype.$socket.sendObj('get_directory', { path: currentPath }, 'getDirectory');
            commit('voidMutation');
        }
    },

    getDeleteDirectory({ commit }, data) {
        if (data.error) {
            Vue.$toast.error(data.error.message);
        } else if (data.result === "ok") {
            let currentPath = data.requestParams.path.substr(0, data.requestParams.path.lastIndexOf("/"));
            let newPath = data.requestParams.path.substr(data.requestParams.path.lastIndexOf("/")+1);

            Vue.$toast.success("Successfully deleted "+newPath);
            Vue.prototype.$socket.sendObj('get_directory', { path: currentPath }, 'getDirectory');
            commit('voidMutation');
        }
    },

    getPostFileMove({ commit }, data) {
        if (data.error) {
            Vue.$toast.error(data.error.message);
        } else if (data.result === "ok") {
            let filename = data.requestParams.dest.substr(data.requestParams.dest.lastIndexOf("/")).replace("/", "");

            Vue.$toast.success("Successfully renamed "+filename);

            commit('renameMetadataFilename', {
                source: data.requestParams.source,
                dest: data.requestParams.dest
            });
        }
    },

    getHelpList({ commit }, data) {
        commit('setHelpList', data);
    },

    setHeaterChartVisibility({ commit, dispatch }, data) {
        commit('setHeaterChartVisibility', data);
        dispatch('saveGuiSettings');
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
        commit('removeLoading', { name: 'loadingSendGcode' });
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

    responseBedMeshLoad({commit}) {
        commit('removeLoading', { name: 'bedMeshLoad' });
    },

    responseBedMeshClear({commit}) {
        commit('removeLoading', { name: 'bedMeshClear' });
    },

    responseBedMeshCalibrate({commit}) {
        commit('removeLoading', { name: 'bedMeshCalibrate' });
    },

    responseBedMeshSave({commit}) {
        commit('removeLoading', { name: 'bedMeshSave' });
    },

    responseBedMeshRemove({commit}) {
        commit('removeLoading', { name: 'bedMeshRemove' });
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