import {Store} from 'vuex'
import _Vue from 'vue'
import {RootState} from '@/store/types'

export class WebSocketClient {
    url = ''
    instance: WebSocket | null = null
    maxReconnects  = 5
    reconnectInterval = 1000
    reconnects = 0
    keepAliveTimeout = 1000
    timerId: number | null = null
    store: Store<RootState> | null = null
    waits: Wait[] = []

    constructor (options: WebSocketPluginOptions) {
        this.url = options.url
        this.maxReconnects = options.maxReconnects || 5
        this.reconnectInterval = options.reconnectInterval || 1000
        this.store = options.store
    }

    setUrl(url: string): void {
        this.url = url
    }

    // eslint-disable-next-line
    passToStore (eventName: string, event: any): void {
        if (!eventName.startsWith('socket/')) { return }

        this.store?.dispatch(eventName, event)
    }

    async connect() {
        this.store?.dispatch('socket/setData', {
            isConnecting: true
        })

        if (this.instance) {
            this.instance.close()
        }
        this.instance = new WebSocket(this.url)

        this.instance.onopen = () => {
            this.reconnects = 0
            this.store?.dispatch('socket/onOpen', event)
        }

        this.instance.onclose = async (e) => {
            if (!e.wasClean && this.reconnects < this.maxReconnects) {
                this.reconnects++
                setTimeout(() => {
                    this.connect()
                }, this.reconnectInterval)
            } else await this.store?.dispatch('socket/onClose', e)
        }

        this.instance.onerror = () => {
            if (this.instance) this.instance.close()
        }

        this.instance.onmessage = (msg) => {
            const data = JSON.parse(msg.data)
            if (this.store) {
                const wait = this.getWaitById(data.id)
                if (wait && wait.action !== ''){
                    if (data.error?.message) {
                        if (data.error?.message !== 'Klippy Disconnected')
                            window.console.error('Response Error: '+wait.action+' > '+data.error.message)
                    } else if (wait.action) {
                        let result = data.result
                        if (result === 'ok') result = { result: result }
                        if (typeof(result) === 'string') result = { result: result }

                        const preload = {}
                        if (wait.actionPayload) Object.assign(preload, wait.actionPayload)
                        Object.assign(preload, { requestParams: wait.params })
                        Object.assign(preload, result)
                        this.store?.dispatch(wait.action, preload)
                    }
                } else this.store?.dispatch('socket/onMessage', data)

                if (wait) this.removeWaitById(wait.id)
            }
        }
    }

    async close() {
        if (this.instance) await this.instance.close()
    }

    getWaitById(id: number): Wait | null {
        return this.waits.find((wait: Wait) => wait.id === id) ?? null
    }

    removeWaitById(id: number): void {
        const index = this.waits.findIndex((wait: Wait) => wait.id === id)
        if (index) {
            const wait = this.waits[index]
            if (wait.loading && this.store) {
                this.store.dispatch('socket/removeLoading', { name: wait.loading })
            }
            this.waits.splice(index, 1)
        }
    }

    emit(method: string, params: Params, options: emitOptions = {}):void {
        if (this.instance?.readyState === WebSocket.OPEN) {
            const id = Math.floor(Math.random() * 10000) + 1
            this.waits.push({
                id: id,
                params: params,
                action: options.action ?? null,
                actionPayload: options.actionPayload ?? {},
                loading: options.loading ?? null,
            })

            if (options.loading && this.store) {
                this.store.dispatch('socket/addLoading', { name: options.loading })
            }

            const msg = JSON.stringify({
                jsonrpc: '2.0',
                method: method,
                params: params,
                id: id
            })

            this.instance.send(msg)
        }
    }
}

export function WebSocketPlugin(Vue: typeof _Vue, options: WebSocketPluginOptions): void {
    const socket = new WebSocketClient(options)
    Vue.prototype.$socket = socket
    Vue.$socket = socket
}

export interface WebSocketPluginOptions {
    url: string
    maxReconnects?: number
    reconnectInterval?: number
    store: Store<RootState>
}

export interface WebSocketClient {
    connect(): void
    close(): void
    emit(method: string, params: Params, emitOptions: emitOptions):void
}

export interface Wait {
    id: number
    params: any
    action?: string | null
    actionPayload?: any
    loading?: string | null
}

interface Params {
    data?: any
    [key: string]: any
}

interface emitOptions {
    action?: string | null
    actionPayload?: Params
    loading?: string | null
}
