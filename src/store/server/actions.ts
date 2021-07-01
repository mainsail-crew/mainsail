import Vue from 'vue'
import {ActionTree} from "vuex"
import {ServerState} from "@/store/server/types"
import {camelize} from "@/plugins/helpers";
import {RootState} from "@/store/types";
import {initableServerComponents} from "@/store/variables";

export const actions: ActionTree<ServerState, RootState> = {
	reset({ commit, dispatch }) {
		commit('reset')
		dispatch('power/reset')
		dispatch('updateManager/reset')
	},

	init() {
		window.console.debug("init Server")

		Vue.$socket.emit('server.info', {}, { action: 'server/initServerInfo'})
		Vue.$socket.emit('server.config', {}, { action: 'server/initServerConfig'})
		Vue.$socket.emit('machine.system_info', {}, { action: 'server/initSystemInfo'})
		Vue.$socket.emit('server.database.list', { root: 'config' }, { action: 'server/checkDatabases'})
	},

	checkDatabases({ dispatch }, payload) {
		if (payload.namespaces?.includes('mainsail'))
			Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail' }, { action: 'gui/init'})
		else {
			Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail', key: 'init', value: true })
			dispatch('printer/init', null, { root: true })
		}
	},

	initServerInfo: function ({ dispatch, commit }, payload) {
		window.console.debug("init ServerInfo")
		// delete old plugin entries
		if ('plugins' in payload) delete payload.plugins
		if ('failed_plugins' in payload) delete payload.failed_plugins

		if (payload.components?.length) {
			payload.components.forEach((component: string) => {
				component = camelize(component)
				if (initableServerComponents.includes(component)) {
					window.console.debug("init server component: "+component)
					dispatch("server/" + component + "/init", {}, {root: true})
				}
			})
		}

		if (payload.registered_directories?.length) {
			dispatch("files/initRootDirs", payload.registered_directories, {root: true})
		}

		commit('setData', payload)
	},

	initServerConfig({ commit }, payload) {
		window.console.debug("init ServerConfig")
		commit('setConfig', payload)

		Vue.$socket.emit('server.gcode_store', {}, { action: 'server/getGcodeStore' })
	},

	initSystemInfo({ commit }, payload) {
		window.console.debug("init SystemInfo")

		commit('setSystemInfo', payload.system_info)
	},

	setKlippyReady({ dispatch }) {
		dispatch('printer/reset', null, { root: true })
		dispatch('printer/init', null, { root: true })
	},

	getData({ commit }, payload){
		commit('setData', payload)
	},

	getGcodeStore({ commit }, payload) {
		commit('clearGcodeStore')
		commit('setGcodeStore', payload)
	},

	getGcodeRespond({commit}, data) {
		commit('addEvent', data);
	},

	addRootDirectory({ commit, state }, data) {
		if (!state.registered_directories.includes(data.item.root)) {
			commit('addRootDirectory', { name: data.item.root })
		}
	}
}