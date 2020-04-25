let webSocketsService = {}

webSocketsService.install = function (Vue, options) {
    let ws = new WebSocket(options.url)
    let reconnectInterval = options.reconnectInterval || 1000
    let wsData = [];
    let timerId = 0;

    Vue.prototype.$webSocketsConnect = () => {
        window.console.log('webSocketConnect');
        ws = new WebSocket(options.url);

        ws.onopen = () => {
            window.console.log('onopen');
            // Restart reconnect interval
            reconnectInterval = options.reconnectInterval || 1000
            options.store.dispatch('socket_on_open');
            keepAlive();
        }

        ws.onmessage = (event) => {
            // New message from the backend - use JSON.parse(event.data)
            handleNotification(event)
        }

        ws.onclose = (event) => {
            cancelKeepAlive();

            if (event) {
                // Event.code 1000 is our normal close event
                if (event.code !== 1000) {
                    let maxReconnectInterval = options.maxReconnectInterval || 3000
                    setTimeout(() => {
                        if (reconnectInterval < maxReconnectInterval) {
                            // Reconnect interval can't be > x seconds
                            reconnectInterval += 1000
                        }
                        Vue.prototype.$webSocketsConnect()
                    }, reconnectInterval)
                }
            }
        }

        ws.onerror = (error) => {
            window.console.log(error);
            ws.close()
        }
    }

    Vue.prototype.$webSocketsDisconnect = () => {
        window.console.log('disconnect');
        // Our custom disconnect event
        ws.close()
    }

    Vue.prototype.$webSocketsSend = (data) => {
        ws.send(JSON.stringify(data))
    }

    Vue.prototype.$webSocketsSendObj = (method, params, action = '') => {
        let id = Math.floor(Math.random() * 10000) + 1
        wsData.push({
            id: id,
            action: action
        });
        ws.send(JSON.stringify({
            jsonrpc: '2.0', method: method, params: params, id: id
        }))
    }

    function keepAlive() {
        var timeout = 5000;
        if (ws.readyState === ws.OPEN) {
            Vue.prototype.$webSocketsSendObj('get_printer_info', {}, 'getKlipperInfo');
        }
        timerId = setTimeout(keepAlive, timeout);
    }

    function cancelKeepAlive() {
        if (timerId) {
            clearTimeout(timerId);
        }
    }

    function passToStore (eventName, event) {
        if (!eventName.startsWith('socket_')) { return }
        let target = eventName
        let msg = event
        if (event.data) {
            msg = JSON.parse(event.data)
        }
        options.store.dispatch(target, msg)
    }

    function handleNotification (params) {
        let data = JSON.parse(params.data);
        if (wsData.filter(item => item.id === data.id).length > 0 &&
            wsData.filter(item => item.id === data.id)[0].action !== "") {
            options.store.dispatch(
                wsData.filter(item => item.id === data.id)[0].action,
                data.result
            )
        } else passToStore('socket_on_message', data)
    }
}

export default webSocketsService