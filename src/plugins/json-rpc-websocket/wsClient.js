export default class WebSocketClient {
    constructor (url, options) {
        this.instance = null
        this.url = url
        this.options = options || this.defaultOptions()
        if (this.options) {
            if (options.reconnectEnabled) {
                this.reconnectEnabled = options.reconnectEnabled
                if (this.reconnectEnabled) {
                    this.reconnectInterval = options.reconnectInterval
                    this.reconnectAttempts = options.recconectAttempts
                    this.reconnectCount = 1
                }
            }
            if (options.store) {
                this.store = options.store
            }
        }

        this.wsData = []

        this.onOpen = null
        this.onMessage = null
        this.onClose = null
        this.onError = null
    }

    createMessage (method, params, id) {
        let msg = {
            jsonrpc: '2.0', method: method, params: params, id: id
        };
        return JSON.stringify(msg)
    }

    defaultOptions () {
        return {
            reconnectEnabled: false,
            reconnectInterval: 0,
            recconectAttempts: 0,
            store: undefined
        }
    }

    passToStore (eventName, event) {
        if (!eventName.startsWith('socket_')) { return }
        let method = 'dispatch'
        let target = eventName
        let msg = event
        if (event.data) {
            msg = JSON.parse(event.data)
        }
        this.store[method](target, msg)
    }

    connect () {
        this.instance = new WebSocket(this.url);

        this.instance.onopen = () => {
            if (this.reconnectEnabled) this.reconnectCount = 1;
            if (typeof this.onOpen === 'function') this.onOpen();
            if (this.store) this.passToStore('socket_on_open', event);
        };

        this.instance.onmessage = (msg) => {
            if (msg.data instanceof Blob) {
                let reader = new FileReader();
                reader.onload = () => {
                    let data = JSON.parse(reader.result);
                    if (typeof this.onMessage === 'function') {
                        this.onMessage(data)
                    } else if (this.store) {
                        if ('error' in data) {
                            this.passToStore('socket_on_error', data.error)
                        } else if (this.wsData.filter(item => item.id === data.id).length > 0 &&
                            this.wsData.filter(item => item.id === data.id)[0].action !== "") {
                            this.store.dispatch(
                                this.wsData.filter(item => item.id === data.id)[0].action,
                                data.result
                            )
                        } else this.passToStore('socket_on_message', data)
                    }
                };

                reader.readAsText(msg.data);
            }
        }

        this.instance.onclose = (e) => {
            if (typeof this.onClose === 'function') {
                this.onClose(e)
            } else if (this.store) {
                this.passToStore('socket_on_close', e)
            }
            if (!e.wasClean && this.reconnectEnabled) {
                this.reconnect()
            }
        }

        this.instance.onerror = (e) => {
            if (typeof this.onError === 'function') {
                this.onError(e)
            } else if (this.store) {
                this.passToStore('socket_on_error', e)
            }
        }
    }

    reconnect () {
        if (this.reconnectCount <= this.reconnectAttempts) {
            this.reconnectCount++
            delete this.instance
            setTimeout(() => {
                this.connect()
                if (this.store) { this.passToStore('socket_reconnect', this.reconnectCount) }
            }, this.reconnectInterval)
        } else {
            if (this.store) { this.passToStore('socket_reconnect_error', true) }
        }
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
