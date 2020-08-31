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
            metadataRequestDelay: 1000,

            loadingEmergencyStop: false,
            loadingRestart: false,
            loadingRestartFirmware: false,
            loadingRebootHost: false,
            loadingShutdownHost: false,
            loadingSaveGuiConfig: false,
            loadingEndstopStatus: false,
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
            },
            settings: {
                configfiles: {
                    countPerPage: 10,
                }
            }
        },
        loadings: [],
        config: {

        },
        printer: {
            software_version: '',
            hostname: '',
            cpu_info: '',
            webhooks: {
                state: '',
                state_message: '',
            },
            heaters: {
                available_heaters: [],

            },
            toolhead: {
                position: [],
                homed_axes: "",
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
                is_active: false,
                file_position: 0,
            },
            print_stats: {
                print_duration: 0,
                filament_used: 0,
                total_duration: 0,
                filename: "",
                state: "",
                message: ""
            },
            current_file: {

            },
            gcode_move: {
                extrude_factor: 1,
                speed_factor: 1,
                base_zpos: 0,
                absolute_coordinates: true,
                absolute_extrude: true,
                speed: 0,
            },
            /*fan: {
                speed: 0,
            },*/
            endstops: {},
            configfile: {
                config: {}
            }
        },
        object: [],
        temperaturChart: [],
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