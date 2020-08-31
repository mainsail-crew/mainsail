import Vue from 'vue'
import router from "../plugins/router";
import store from "./index";
import axios from "axios";


export default {
    socket_on_open ({ commit }) {
        commit('setConnected');
        Vue.prototype.$socket.sendObj('get_directory', { path: '/gcodes' }, 'getDirectoryRoot');
        Vue.prototype.$socket.sendObj('get_printer_info', {}, 'getKlipperInfo');
    },

    socket_on_close ({ commit }, event) {
        commit('setDisconnected');
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

            case 'notify_klippy_disconnected':
                commit('setKlippyDisconnected');
                commit('resetPrinter');
                break;

            case 'notify_filelist_changed':
                switch(data.params[0].action) {
                    case 'upload_file':
                        commit('setFileChangeUploadFile', data.params[0]);
                        break;

                    case 'delete_file':
                        commit('setFileChangeDeleteFile', data.params[0]);
                        break;

                    case 'move_item':
                        commit('setFileChangeMoveItem', data.params[0]);
                        break;

                    case 'create_dir':
                        commit('setFileChangeCreateDirectory', data.params[0]);
                        break;

                    case 'delete_dir':
                        commit('setFileChangeDeleteDirectory', data.params[0]);
                        break;

                    default:
                        window.console.error("Unknown filelist_changed action: "+data.params[0].action);
                        break;
                }
                break;

            default:
                if (data.result !== "ok") {
                    if (data.error && data.error.message !== "Klippy Request Timed Out") window.console.error("JSON-RPC: " + data.error.message);
                }
        }
    },

    getDirectoryRoot({ commit }, data) {
        if (data.files && data.files.filter((file) => file.filename === "gui.json")) {
            fetch('http://'+store.state.socket.hostname+':'+store.state.socket.port+'/server/files/gcodes/gui.json?time='+Date.now())
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

    getKlipperInfo({ commit }, data) {
        commit('setPrinterData', {
            hostname: data.hostname,
            software_version: data.software_version,
            cpu_info: data.cpu_info,
            webhooks: {
                state: data.state,
                state_message: data.state_message,
            }
        });

        Vue.prototype.$socket.sendObj('get_printer_objects_list', {}, 'getObjectsList');
        Vue.prototype.$socket.sendObj('get_directory', { path: 'gcodes' }, 'getDirectory');
        Vue.prototype.$socket.sendObj('get_directory', { path: 'config' }, 'getDirectory');
        Vue.prototype.$socket.sendObj('get_directory', { path: 'config_examples' }, 'getDirectory');
        Vue.prototype.$socket.sendObj('get_printer_gcode_help', {}, 'getHelpList');
    },

    getObjectsList({ commit }, data) {
        commit('setObjectData', data.objects);

        let subscripts = {}

        for (let key of data.objects) {
            let nameSplit = key.split(" ");

            if (
                nameSplit[0] !== "gcode_macro" &&
                nameSplit[0] !== "menu"
            ) subscripts = {...subscripts, [key]: null }
        }

        if (subscripts !== {}) Vue.prototype.$socket.sendObj('post_printer_objects_subscribe', { objects: subscripts }, "getPrinterData");
        Vue.prototype.$socket.sendObj("get_server_temperature_store", {}, "getHeatersHistory");
    },

    getPrinterData({ commit }, data) {
        if (data.status) commit('setPrinterData', data.status);
    },

    getHeatersHistory({ commit }, data) {
        commit('setHeaterHistory', data);
    },

    getPrinterConfig({commit}, data) {
        commit('setPrinterConfig', data);
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
            let newPath = data.requestParams.path.substr(data.requestParams.path.lastIndexOf("/")+1);

            Vue.$toast.success("Successfully created "+newPath);
            commit('voidMutation');
        }
    },

    getDeleteDirectory({ commit }, data) {
        if (data.error) {
            Vue.$toast.error(data.error.message);
        } else if (data.result === "ok") {
            let delPath = data.requestParams.path.substr(data.requestParams.path.lastIndexOf("/")+1);

            Vue.$toast.success("Successfully deleted "+delPath);
            commit('voidMutation');
        }
    },

    getPostFileMove({ commit }, data) {
        if (data.error) {
            Vue.$toast.error(data.error.message);
        } else if (data.result === "ok") {
            let filename = data.requestParams.dest.substr(data.requestParams.dest.lastIndexOf("/")).replace("/", "");
            let sourceDir = data.requestParams.dest.substr(0, data.requestParams.dest.lastIndexOf("/"));
            let destDir = data.requestParams.dest.substr(0, data.requestParams.dest.lastIndexOf("/"));

            if (sourceDir === destDir) Vue.$toast.success("Successfully renamed "+filename);
            else Vue.$toast.success("Successfully moved "+filename);
            commit('voidMutation');
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

    respondPrintPause({commit}) {
        commit('removeLoading', { name: 'statusPrintCancel' });
    },

    respondPrintResume({commit}) {
        commit('removeLoading', { name: 'statusPrintCancel' });
    },

    respondPrintCancel({commit}) {
        commit('removeLoading', { name: 'statusPrintCancel' });
    },

    respondPrintClear({commit}) {
        commit('removeLoading', { name: 'statusPrintClear' });
    },

    respondPrintReprint({commit}) {
        commit('removeLoading', { name: 'statusPrintReprint' });
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
        commit('removeLoading', { name: 'controlQGL' });
    },

    responseZTilt({commit}) {
        commit('removeLoading', { name: 'controlZTilt' });
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

    respondeBabySteppingDownFine({commit}) {
        commit('removeLoading', { name: 'babySteppingDownFine' });
    },

    respondeBabySteppingDown({commit}) {
        commit('removeLoading', { name: 'babySteppingDown' });
    },

    respondeBabySteppingUpFine({commit}) {
        commit('removeLoading', { name: 'babySteppingUpFine' });
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

    setSettings({ commit }, data) {
        commit('setSettings', data);
    },
}