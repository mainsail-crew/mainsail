import Vue from 'vue'
import Vuex from 'vuex'
import VueToast from 'vue-toast-notification';
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

// load modules
import socket from './socket'
import server from './server'
import printer from './printer'
import files from './files'
import gui from './gui'
import farm from './farm'

Vue.use(Vuex);
Vue.use(VueToast);

export default new Vuex.Store({
    state: {
        packageVersion: process.env.PACKAGE_VERSION || '0.0.0',
		debugMode: process.env.VUE_APP_DEBUG_MODE || false,
    },
    modules: {
        socket,
        server,
        printer,
        files,
        gui,
        farm,
    },
    getters: getters,
    mutations: mutations,
    actions: actions
});
