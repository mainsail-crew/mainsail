export default {
	reset({commit}) {
		commit('reset')
	},

	connect({ state, commit, dispatch, getters }) {
		commit("setSocketData", { isConnecting: true })
		const socket = new WebSocket(getters.getSocketUrl)

		socket.onopen = () => {
			commit("setSocketData", {
				instance: socket,
				reconnects: 0,
				isConnecting: false,
				isConnected: true
			})

			dispatch("initPrinter")
		}

		socket.onclose = (e) => {
			if (!e.wasClean && state.socket.reconnects < state.socket.maxReconnects) {
				commit("setSocketData", { reconnects: state.socket.reconnects + 1 })

				setTimeout(() => {
					dispatch("connect")
				}, state.socket.reconnectInterval)
			} else {
				commit("setSocketData", {
					isConnecting: false,
					isConnected: false,
					reconnects: 0
				})
			}
		}

		socket.onerror = () => {

		}

		socket.onmessage = (msg) => {
			let data = JSON.parse(msg.data)
			if (data && data.method) {
				switch (data.method) {
					case "notify_status_update":
						commit("setData", data.params[0])
						break

					case "notify_filelist_changed":
						commit("notifyFilelistChanged", data.params[0])
						break

					case "notify_klippy_disconnected":
						dispatch("disconnectKlippy")
						break

					case "notify_klippy_ready":
						dispatch("initPrinter")
						break
				}
			} else if ("result" in data) {
				if (
					state.socket.wsData.filter(item => item.id === data.id).length > 0 &&
					state.socket.wsData.filter(item => item.id === data.id)[0].action !== undefined &&
					state.socket.wsData.filter(item => item.id === data.id)[0].action !== ""
				) {
					let result = data.result
					if (result === "ok") result = { result: result }
					if (typeof(result) === "string") result = { result: result }

					let preload = {}
					let wsData = state.socket.wsData.filter(item => item.id === data.id)[0]
					if (wsData.actionPreload) Object.assign(preload, wsData.actionPreload)
					Object.assign(preload, { requestParams: wsData.params })
					Object.assign(preload, result)

					dispatch(wsData.action, preload)
				}
			}
		}
	},

	reconnect({ state, dispatch }) {
		if(state.socket.instance) state.socket.instance.close()
		dispatch("connect")
	},

	sendObj ({ state, commit }, payload) {
		if (state.socket.instance && state.socket.instance.readyState === WebSocket.OPEN) {
			const id = Math.floor(Math.random() * 10000) + 1

			commit("addWsData", {
				id: id,
				action: payload.action,
				params: payload.params || {},
				actionPreload: payload.actionPreload || null,
			})

			state.socket.instance.send(JSON.stringify({
				jsonrpc: '2.0',
				method: payload.method,
				params: payload.params || {},
				id: id
			}))
		}
	},

	disconnectKlippy({ commit }) {
		commit("setData", { print_stats: { state: "error" }})
	},

	initPrinter({ commit, dispatch }) {
		commit("resetData")

		dispatch("sendObj", {
			method: "printer.objects.list",
			action: "getObjectsList",
		})

		dispatch("sendObj", {
			method: "server.files.list",
			action: "getConfigDir",
			params: { root: "config"}
		})
	},

	getObjectsList({ dispatch }, payload) {
		const allowed = [
			'webhooks',
			'print_stats',
			'virtual_sdcard',
			'display_status',
			'heaters',
			'heater_bed',
			'heater_fan',
			'fan',
			'temperature_fan',
			'temperature_sensor',
			'idle_timeout',
			'toolhead'
		]

		let subscripts = {}
		payload.objects.forEach((object) => {
			const splits = object.split(" ")
			const objectName = splits[0]

			if (
				allowed.includes(objectName) ||
				objectName.startsWith("extruder")
			) {
				subscripts = {...subscripts, [object]: null }
			}
		})

		if (subscripts !== {})
			dispatch("sendObj", {
				method: 'printer.objects.subscribe',
				params: { objects: subscripts },
				action: "getData"
			});
	},

	getData({ commit }, payload) {
		commit("setData", payload)
	},

	getMetadataCurrentFile({ commit }, payload) {
		commit("setCurrentFile", payload)
	},

	getConfigDir({ commit }, payload) {
		commit("setConfigDir", payload)
	},
}