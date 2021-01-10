import printer from './printer'

export default {
	namespaced: true,
	state: () => {

	},
	getters: {
		countPrinters: state => {
			return Object.keys(state).length
		},
		getPrinters: state => {
			return state
		},
		getPrinterName: (getters) => (namespace) => {
			return getters[namespace+"/getPrinterName"]
		}
	},
	actions: {
		readStoredPrinters({ rootState, commit }) {
			if (rootState.socket.remoteMode) {
				if (localStorage.getItem('printers')) {
					try {
						const printers = JSON.parse(localStorage.getItem('printers')) || []
						printers.forEach((printer) => {
							commit('addPrinter',{
								hostname: printer.hostname,
								port: printer.port,
								protocol: rootState.socket.protocol
							})
						})
					} catch(e) {
						localStorage.removeItem('printers')
					}
				}
			} else {
				rootState.gui.remotePrinters.forEach((printer) => {
					commit('addPrinter',{
						hostname: printer.hostname,
						port: printer.port,
						webPort: printer.webPort,
						protocol: rootState.socket.protocol
					})
				})
			}
		},
		savePrinters({ rootState, state, dispatch }) {
			const printers = []

			if (rootState.socket.remoteMode) {
				for (const key in state) {
					printers.push({
						hostname: state[key].socket.hostname,
						port: state[key].socket.port,
					})
				}

				localStorage.setItem('printers', JSON.stringify(printers))
			} else {
				for (const key in state) {
					printers.push({
						hostname: state[key].socket.hostname,
						port: state[key].socket.port,
						webPort: state[key].socket.webPort,
					})
				}

				dispatch("gui/setSettings", { remotePrinters: printers }, { root: true })
			}
		}
	},
	mutations: {
		addPrinter(state, payload) {
			if ('hostname' in payload && payload.hostname !== "") {
				const nextPrinterName = 'printer'+Object.entries(state).length
				if (!this.hasModule(['farm', nextPrinterName])) {
					this.registerModule(['farm', nextPrinterName], printer)
					this.commit('farm/'+nextPrinterName+'/setSocketData', {...payload, _namespace: nextPrinterName })
					this.dispatch('farm/'+nextPrinterName+'/connect', {}, { root: true })
				}
			}
		},
		removePrinter(state, payload) {
			if (payload.name in state) {
				if (state[payload.name].socket.instance) state[payload.name].socket.instance.close()
				this.unregisterModule(['farm', payload.name])
			}
		}
	}
}