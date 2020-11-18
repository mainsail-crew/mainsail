import { caseInsensitiveNameSort } from '@/plugins/helpers'

export default {
    getVersion: state => {
        return state.packageVersion
    },

    getTitle: (state, getters) => {
        if (state.socket.isConnected) {
            if (state.server.klippy_state !== "ready") return "ERROR"
            else if (state.printer.print_stats.state === "paused") return "Pause Print"
            else if (state.printer.print_stats.state === "printing") return (getters["printer/getPrintPercent"] * 100).toFixed(0)+"% Printing - "+state.printer.print_stats.filename
            else if (state.printer.print_stats.state === "complete") return "Complete - "+state.printer.print_stats.filename

            return state.gui.general.printername ? state.gui.general.printername : state.printer.hostname
        }

        return "Mainsail"
    },

    is_printing: state => {
        return (["printing", "paused"].includes(state.printer.print_stats.state));
    },

    getBedMeshProfiles: state => {
        let profiles = [];
        let currentProfile = "";
        if (state.printer.bed_mesh) {
            currentProfile = state.printer.bed_mesh.profile_name;
        }

        for (let [key, value] of Object.entries(state.printer.configfile.config)) {
            let nameSplit = key.split(" ");

            if (nameSplit.length > 1 && nameSplit[0] === "bed_mesh" && nameSplit[1] !== undefined) {
                profiles.push({
                    name: nameSplit[1],
                    data: value,
                    is_active: (currentProfile === nameSplit[1] ? true: false),
                });
            }
        }

        return profiles.sort(caseInsensitiveNameSort);
    },

    showDashboardWebcam: state => {
        return (state.gui.webcam.url !== "" && state.gui.dashboard.boolWebcam);
    },

    existPrinterConfig: state => {
        if (
            typeof(state.printer.configfile.config) === "object" &&
            Object.keys(state.printer.configfile.config).length > 0
        ) return true;

        return false;
    },

    checkConfigVirtualSdcard: state => {
        return 'virtual_sdcard' in state.printer.configfile.config;
    },

    checkConfigPauseResume: state => {
        return 'pause_resume' in state.printer.configfile.config;
    },

    checkConfigDisplayStatus: state => {
        return 'display_status' in state.printer.configfile.config;
    },

    checkConfigMacroPause: state => {
        return Object.keys(state.printer.configfile.config).findIndex(key => key.toLowerCase() === 'gcode_macro pause') !== -1;
    },

    checkConfigMacroResume: state => {
        return Object.keys(state.printer.configfile.config).findIndex(key => key.toLowerCase() === 'gcode_macro resume') !== -1;
    },

    checkConfigMacroCancel: state => {
        return Object.keys(state.printer.configfile.config).findIndex(key => key.toLowerCase() === 'gcode_macro cancel_print') !== -1;
    },
}
