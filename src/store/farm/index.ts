import { printer } from '@/store/farm/printer'
import { Module } from "vuex"
import { FarmState } from "@/store/farm/types"
import {RootState} from "@/store/types";

export const getDefaultState = (): FarmState => {
	return {

	}
}

// initial state
const state = () => {
	return getDefaultState()
}

export const farm: Module<FarmState, RootState> = {
	namespaced: true,
	state: state,
	getters: {
		countPrinters: state => {
			return Object.keys(state).length
		},
		getPrinters: state => {
			return state
		},
		getPrinterName: (state, getters) => (namespace: string) => {
			return getters[namespace+"/getPrinterName"]
		}
	},
	actions: {
		readStoredPrinters({ rootState, dispatch }) {
			if (rootState.socket?.remoteMode) {
				if (localStorage.getItem('printers')) {
					try {
						const json = localStorage.getItem('printers') ?? ""
						const printers = JSON.parse(json) || []
						printers.forEach((printer: any) => {
							dispatch('registerPrinter',{
								hostname: printer.hostname,
								port: printer.port,
								protocol: rootState.socket?.protocol,
								settings: printer.settings ?? {}
							})
						})
					} catch(e) {
						localStorage.removeItem('printers')
					}
				}
			} else {
				rootState.gui?.remote_printers?.forEach((printer: any) => {
					dispatch('registerPrinter',{
						hostname: printer.hostname,
						port: printer.port,
						webPort: printer.webPort,
						protocol: rootState.socket?.protocol,
						settings: printer.settings ?? {}
					})
				})
			}
		},
		savePrinters({ rootState, state, dispatch }) {
			const printers: any = []

			if (rootState.socket?.remoteMode) {
				Object.keys(state).forEach((key: string) => {
					printers.push({
						hostname: state[key].socket.hostname,
						port: state[key].socket.port,
						settings: state[key].settings,
					})
				})

				localStorage.setItem('printers', JSON.stringify(printers))
			} else {
				Object.keys(state).forEach((key: string) => {
					printers.push({
						hostname: state[key].socket.hostname,
						port: state[key].socket.port,
						webPort: state[key].socket.webPort,
						settings: state[key].settings,
					})
				})

				dispatch("gui/saveSetting", { name: 'remote_printers', value: printers }, { root: true })
			}
		},
		addPrinter({ dispatch }, payload) {
			dispatch('registerPrinter', payload)
			dispatch('savePrinters', payload)
		},
		registerPrinter({ state, commit, dispatch }, payload) {
			if ('hostname' in payload && payload.hostname !== "") {
				const printerExist = Object.entries(state).findIndex((printer) =>
					printer.length > 0 &&
					'socket' in printer[1] &&
					'hostname' in printer[1].socket && printer[1].socket.hostname === payload.hostname &&
					'port' in printer[1].socket && printer[1].socket.port === payload.port
				)

				const nextPrinterName = 'printer'+Object.entries(state).length
				if (printerExist === -1 && !this.hasModule(['farm', nextPrinterName])) {
					this.registerModule(['farm', nextPrinterName], printer)
					commit('farm/'+nextPrinterName+'/setSocketData', {...payload, _namespace: nextPrinterName }, { root: true })

					if ('settings' in payload) commit('farm/'+nextPrinterName+'/setSettings', payload.settings, { root: true })
					dispatch('farm/'+nextPrinterName+'/connect', {}, { root: true })
				}
			}
		},
		updatePrinter({ dispatch, commit }, payload) {
			commit(payload.namespace+"/setSocketData", {
				hostname: payload.hostname,
				port: payload.port,
				isConnecting: true,
			})
			dispatch(payload.namespace+"/reconnect")
			dispatch("savePrinters")
		},
		removePrinter({ dispatch }, payload) {
			dispatch('unregisterPrinter', payload)
			dispatch('savePrinters', payload)
		},
		unregisterPrinter({ state }, payload) {
			if (payload.name in state) {
				state[payload.name].socket.instance?.close()
				this.unregisterModule(['farm', payload.name])
			}
		}
	},
	mutations: {

	}
}