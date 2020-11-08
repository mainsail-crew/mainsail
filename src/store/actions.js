import Vue from 'vue'
import router from "../plugins/router";
import store from "./index";
import axios from "axios";


export default {
    socket_on_open ({ commit, dispatch }) {
        commit('setConnected');
        dispatch('initServer');
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

            case 'notify_metadata_update':
                commit('setMetadata', data.params[0]);
                break;

            default:
                if (data.result !== "ok") {
                    if (
                        data.error &&
                        data.error.message !== "Klippy Request Timed Out" &&
                        data.error.message !== "Klippy Disconnected"
                    ) window.console.error("JSON-RPC: " + data.error.message);
                    else if (!data.error) window.console.log(data);
                }
        }
    },

    initServer() {
        Vue.prototype.$socket.sendObj('server.files.get_directory', { path: '/config' }, 'getDirectoryRoot');
        Vue.prototype.$socket.sendObj('server.info', {}, 'getServerInfo');
        Vue.prototype.$socket.sendObj('server.gcode_store', {}, 'getGcodeStore');
    },

    initPrinter() {

        Vue.prototype.$socket.sendObj('printer.info', {}, 'getKlipperInfo');

        // only available with klipper is ready
        Vue.prototype.$socket.sendObj('server.files.get_directory', { path: 'gcodes' }, 'getDirectory');
    },

    getDirectoryRoot({ commit }, data) {
        if (data.files && data.files.filter((file) => file.filename === "gui.json").length) {
            fetch('//'+store.state.socket.hostname+':'+store.state.socket.port+'/server/files/config/gui.json?time='+Date.now())
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
        formData.append('root', 'config');

        axios.post('//' + state.socket.hostname + ':' + state.socket.port + '/server/files/upload',
            formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        ).then(() => {
            commit('setLoadingSaveGuiConfige', false);
        }).catch(() => {
            window.console.error("Error save gui.json!");
        });
    },

    getServerInfo({ commit, dispatch }, data) {
        commit('setServerInfo', {
            klippy_connected: data.klippy_connected,
        })

        if (data.klippy_connected) {
            Vue.prototype.$socket.sendObj('server.files.get_directory', { path: 'config' }, 'getDirectory');
            Vue.prototype.$socket.sendObj('server.files.get_directory', { path: 'config_examples' }, 'getDirectory');

            //load plug data
            if (data.plugins.includes("power") !== false) Vue.prototype.$socket.sendObj('machine.gpio_power.devices', {}, 'getPowerDevices');

            dispatch('initPrinter');
        } else {
            setTimeout(function(){
                Vue.prototype.$socket.sendObj('server.info', {}, 'getServerInfo');
            }, 1000);
        }
    },

    getGcodeStore({ commit }, data) {
        commit('setGcodeStore', data);
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

        Vue.prototype.$socket.sendObj('printer.objects.list', {}, 'getObjectsList');
        Vue.prototype.$socket.sendObj('printer.gcode.help', {}, 'getHelpList');
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

        if (subscripts !== {}) Vue.prototype.$socket.sendObj('printer.objects.subscribe', { objects: subscripts }, "getPrinterData");
        Vue.prototype.$socket.sendObj("server.temperature_store", {}, "getHeatersHistory");
    },

    getPrinterData({ commit }, data) {
        if (data.status) commit('setPrinterData', data.status);
    },

    getHeatersHistory({ commit }, data) {
        commit('setHeaterHistory', data);
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

    getPowerDevices({ commit }, data) {
        if (data.error) {
            if (data.error.code !== -32601) {
                Vue.$toast.error(data.error.message);
            }
        } else {
            commit('setPowerDevices', data.devices);

            Vue.prototype.$socket.sendObj('machine.gpio_power.status', {}, 'getPowerDevicesStatus');
        }
    },

    getPowerDevicesStatus({ commit }, data) {
        if (data.error) {
            if (data.error.code !== -32601) {
                Vue.$toast.error(data.error.message);
            }
        } else {
            commit('setPowerDevicesStatus', data);
        }
    },

    setHeaterChartVisibility({ commit, dispatch }, data) {
        commit('setHeaterChartVisibility', data);
        dispatch('saveGuiSettings');
    },

    setGuiGcodefilesMetadata({ commit, dispatch }, data) {
        commit('setGuiGcodefilesMetadata', data);
        dispatch('saveGuiSettings');
    },

    setGuiGcodefilesShowHiddenFiles({ commit, dispatch }, data) {
        commit('setGuiGcodefilesShowHiddenFiles', data);
        dispatch('saveGuiSettings');
    },

    respondPrintPause({commit}) {
        commit('removeLoading', { name: 'statusPrintPause' });
    },

    respondPrintResume({commit}) {
        commit('removeLoading', { name: 'statusPrintResume' });
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

    responsePowerToggle({ commit }, data) {
        commit('setPowerDevicesStatus', data);
    },

    switchToDashboard() {
        router.push("/");
    },

    setSettings({ commit }, data) {
        commit('setSettings', data);
    },
}
