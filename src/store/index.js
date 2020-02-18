import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        socket: {
            isConnected: false,
        },
        printer: {
            hostname: '',
            version: '',
            toolhead: {},
        },
        object: {
            heater: {
                available_heaters: []
            }
        },
        files: []
    },

    getters: {
        toolhead(state) {
            return (state.socket.isConnected) ? state.printer.toolhead : null;
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
        },

        setObjectData(state, data) {
            Object.assign(state.object, data);
        },

        setFileList(state, data) {
            state.files = data;
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
            commit('voidMutation');
            window.console.error('Socket Error: ' + data.message);
        },

        socket_on_message ({ commit, state }, data) {
            if (!state.socket.isConnected) commit('setConnected');
            switch(data.method) {
                case 'notify_status_update':
                    commit('setPrinterData', data.params[0]);
                    break;

                default:
                    window.console.log("Default return");
                    if (data.error) window.console.error("JSON-RPC: " + data.error.message);
                    else window.console.log(data);
            }
        },

        socket_reconnect ({ commit }, count) {
            commit('setConnected')
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
        }
    }
});