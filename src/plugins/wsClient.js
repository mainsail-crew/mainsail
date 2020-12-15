export default class WebSocketClient {

    constructor (url, options) {
        this.instance = null;
        this.url = url;
        this.reconnectInterval = options.reconnectInterval;
        this.store = options.store;
        this.wsData = [];
        this.timerId = 0;
        this.keepAliveTimeout = 1000;

        this.onOpen = null;
        this.onMessage = null;
        this.onClose = null;
        this.onError = null;
        this.blacklistMessages = [
            "Metadata not available for",
            "Klippy Request Timed Out",
            "Klippy Host not connected",
        ];
        this.blacklistFunctions = [
            "getPowerDevices",
        ];
    }

    createMessage (method, params, id) {
        let msg = {
            jsonrpc: '2.0', method: method, params: params, id: id
        };
        return JSON.stringify(msg)
    }

    passToStore (eventName, event) {
        if (!eventName.startsWith('socket/')) { return }
        let method = 'dispatch'
        let target = eventName
        let msg = event
        if (event && event.data) {
            msg = JSON.parse(event.data)
        }
        this.store[method](target, msg);
    }

    connect () {
        this.instance = new WebSocket(this.url);

        this.instance.onopen = () => {
            if (this.store) this.passToStore('socket/onOpen', event);
        };

        this.instance.onclose = (e) => {
            this.passToStore('socket/onClose', e);

            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        };

        this.instance.onerror = () => {
            this.instance.close();
        };

        this.instance.onmessage = (msg) => {
            let data = JSON.parse(msg.data);
            if (this.store) {
                if (this.wsData.filter(item => item.id === data.id).length > 0 &&
                    this.wsData.filter(item => item.id === data.id)[0].action !== "") {
                    let tmpWsData = this.wsData.filter(item => item.id === data.id)[0]

                    if (data.error && data.error.message) {
                        if (
                            !this.blacklistMessages.find(element => data.error.message.startsWith(element)) &&
                            !this.blacklistFunctions.find(element => tmpWsData.action.startsWith(element))
                        ) {
                            window.console.error("Response Error: "+tmpWsData.action+" > "+data.error.message);

                            this.store.dispatch(tmpWsData.action,
                                Object.assign(tmpWsData.actionPreload || {}, {
                                    error: data.error,
                                    requestParams: tmpWsData.params
                                })
                            );
                        }
                    } else {
                        let result = data.result
                        if (result === "ok") result = { result: result }

                        let preload = {}
                        let wsData = this.wsData.filter(item => item.id === data.id)[0]
                        if (wsData.actionPreload) Object.assign(preload, wsData.actionPreload)
                        Object.assign(preload, { requestParams: wsData.params })
                        Object.assign(preload, result)
                        this.store.dispatch(wsData.action, preload)
                    }
                } else this.passToStore('socket/onMessage', data)
            }
        };
    }

    sendObj (method, params, action = '', actionPreload = null) {
        if (this.instance.readyState === WebSocket.OPEN) {
            let id = Math.floor(Math.random() * 10000) + 1
            this.wsData.push({
                id: id,
                action: action,
                params: params,
                actionPreload: actionPreload,
            })
            this.instance.send(this.createMessage(method, params, id));
        }
    }
}
