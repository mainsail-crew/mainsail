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
            port: window.location.port,
            reconnectInterval: 3000,
            isConnected: false,
            loadingGcodeUpload: false,
            loadingGcodeRefresh: false,
            loadingEmergencyStop: false,
            loadingPrintPause: false,
            loadingPrintResume: false,
            loadingQGL: false,
            loadingRestart: false,
            loadingRestartFirmware: false,
            loadingRebootHost: false,
            loadingShutdownHost: false,
            loadingSaveGuiConfig: false,
            loadingEndstopStatus: false,
            printer_state: "",
            klippy_state: "disconnect",
            klippy_message: "",
            is_ready: false,
            error_detected: false,
        },
        webcam: {
            url: ""
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
                bool: false,
            },
            gcodefiles: {
                countPerPage: 10,
            }
        },
        loadings: [],
        config: {

        },
        printer: {
            hostname: '',
            version: '',
            toolhead: {
                position: [],
                homed_axes: [],
                extruder: "",
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
            display_status: {
                message: null,
                progress: 0,
            },
            virtual_sdcard: {
                progress: 0,
                filename: "",
                is_active: false,
                filament_used: 0,
                file_position: 0,
                print_duration: 0,
                total_duration: 0,
            },
            current_file: {

            },
            gcode: {
                extrude_factor: 1,
                speed_factor: 1,
                base_zpos: 0,
                absolute_coordinates: true,
                absolute_extrude: true,
            },
            fan: {
                speed: 0,
            },
            endstops: {},
        },
        object: {
            heaters: {
                available_heaters: []
            }
        },
        temperaturChart: {
            labels: [],
            datasets: [],
        },
        helplist: [],
        filetree: [
            {
                isDirectory: true,
                filename: 'gcodes',
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