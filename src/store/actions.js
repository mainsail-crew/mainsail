import router from "../plugins/router";


export default {
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

    getPrinterConfig({commit}, data) {
        commit('setPrinterConfig', data);
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

    responseHome({commit}) {
        commit('setLoadingHome', false);
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

    responseQGL({commit}) {
        commit('setLoadingQGL', false);
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