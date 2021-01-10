//import Vue from 'vue'
import router from "../plugins/router";


export default {

    switchToDashboard() {
        router.push("/");
    },

    changePrinter({ dispatch, getters }, payload) {
        dispatch('files/reset')
        dispatch('gui/reset')
        dispatch('printer/reset')
        dispatch('socket/reset')

        const printerSocket = getters["farm/"+payload.printer+"/getSocketData"]

        dispatch('socket/setSocket', {
            hostname: printerSocket.hostname,
            port: printerSocket.port
        })
    }
}
