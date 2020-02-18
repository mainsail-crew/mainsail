import WebSocketClient from './wsClient'

export default {
    install (Vue, url, options) {
        const socketClient = new WebSocketClient(url, options)
        socketClient.connect()
        Vue.prototype.$socket = socketClient
    }
}
