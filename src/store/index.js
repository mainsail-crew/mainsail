import Vue from 'vue'
import Vuex from 'vuex'
import VueToast from 'vue-toast-notification';
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import printer from './printer'

Vue.use(Vuex);
Vue.use(VueToast);

export default new Vuex.Store({
    state: {
        socket: {
            hostname: window.location.hostname,
            port: window.location.port,
            reconnectInterval: 3000,
            isConnected: false,

            loadingRestart: false,
            loadingRestartFirmware: false,
            loadingRebootHost: false,
            loadingShutdownHost: false,
            loadingSaveGuiConfig: false,
            loadingEndstopStatus: false,
        },
        gui: {
            general: {
                printername: "",
            },
            dashboard: {
                boolWebcam: true,
                boolTempchart: true,
                boolConsole: false,
                hiddenMacros: [],
                hiddenTempChart: [],
            },
            webcam: {
                url: "",
                rotate: false,
                rotateDegrees: 90,
                flipX: false,
                flipY: false,
                bool: false,
            },
            gcodefiles: {
                countPerPage: 10,
            },
            settings: {
                configfiles: {
                    countPerPage: 10,
                }
            }
        },
        loadings: [],
        printer: printer,
        object: [],
        temperaturChart: [],
        power: {
            devices: []
        },
        helplist: [],
        filetree: [
            {
                isDirectory: true,
                filename: 'gcodes',
                modified: new Date(),
                childrens: []
            },
            {
                isDirectory: true,
                filename: 'config_examples',
                modified: new Date(),
                childrens: []
            },
            {
                isDirectory: true,
                filename: 'config',
                modified: new Date(),
                childrens: []
            }
        ],
        events: []
    },

    getters: getters,
    mutations: mutations,
    actions: actions
});