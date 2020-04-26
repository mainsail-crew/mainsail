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
    }

    createMessage (method, params, id) {
        let msg = {
            jsonrpc: '2.0', method: method, params: params, id: id
        };
        return JSON.stringify(msg)
    }

    passToStore (eventName, event) {
        if (!eventName.startsWith('socket_')) { return }
        let method = 'dispatch'
        let target = eventName
        let msg = event
        if (event && event.data) {
            msg = JSON.parse(event.data)
        }
        this.store[method](target, msg)
    }

    connect () {
        this.instance = new WebSocket(this.url);

        this.instance.onopen = () => {
            if (this.store) this.passToStore('socket_on_open', event);
        };

        this.instance.onclose = (e) => {
            window.console.log("Websocket Closed, reconnecting in "+this.reconnectInterval+"ms: ", e.reason);
            this.passToStore('socket_on_close', e);

            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        };

        this.instance.onerror = (err) => {
            console.log("Websocket Error: ", err);
            this.instance.close();
        };

        this.instance.onmessage = (msg) => {
            let data = JSON.parse(msg.data);
            if (this.store) {
                if (this.wsData.filter(item => item.id === data.id).length > 0 &&
                    this.wsData.filter(item => item.id === data.id)[0].action !== "") {
                    this.store.dispatch(
                        this.wsData.filter(item => item.id === data.id)[0].action,
                        data.result
                    )
                } else this.passToStore('socket_on_message', data)
            }
        };
    }

    sendObj (method, params, action = '') {
        let id = Math.floor(Math.random() * 10000) + 1
        this.wsData.push({
            id: id,
            action: action
        })
        this.instance.send(this.createMessage(method, params, id))
    }
}
