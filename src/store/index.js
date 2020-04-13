import Vue from 'vue'
import Vuex from 'vuex'
import VueToast from 'vue-toast-notification';
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex);
Vue.use(VueToast);

export default new Vuex.Store({
    state: {
        socket: {
            hostname: window.location.hostname,
            port: 8080,
            reconnectInterval: 3000,
            reconnectAttempts: 1000,
            isConnected: false,
            loadingGcodeUpload: false,
            loadingGcodeRefresh: false,
            loadingEmergencyStop: false,
            loadingPrintPause: false,
            loadingPrintResume: false,
            loadingHome: false,
            loadingHomeX: false,
            loadingHomeY: false,
            loadingHomeZ: false,
            loadingQGL: false,
            loadingRestart: false,
            loadingRestartFirmware: false,
            loadingSaveGuiConfig: false,
        },
        webcam: {
            url: ""
        },
        gui: {
            dashboard: {
                boolWebcam: true,
                boolTempchart: true,
                hiddenMacros: [],
            },
            webcam: {
                bool: false,
            },
            gcodefiles: {
                countPerPage: 10,
            }
        },
        config: {

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
                max_velocity: 0,
                max_accel: 0,
                max_accel_to_decel: 0,
                square_corner_velocity: 0,
            },
            pause_resume: {
                is_paused: false
            },
            idle_timeout: {
                printing_time: 0,
                state: "",
            },
            virtual_sdcard: {
                progress: 0,
                current_file: "",
                is_active: false,
                filament_used: 0,
                file_position: 0,
                print_duration: 0,
                total_duration: 0,
            },
            gcode: {
                extrude_factor: 1,
                speed_factor: 1,
            },
            fan: {
                speed: 0,
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
        helplist: [],
        files: [],
        events: []
    },

    getters: getters,
    mutations: mutations,
    actions: actions
});