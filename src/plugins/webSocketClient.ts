import { Store } from 'vuex'
import _Vue from 'vue'
import { RootState } from '@/store/types'
import { initableServerComponents } from '@/store/variables'

export class WebSocketClient {
    url = ''
    instance: WebSocket | null = null
    maxReconnects = 5
    reconnectInterval = 1000
    reconnects = 0
    keepAliveTimeout = 1000
    messageId: number = 0
    timerId: number | null = null
    store: Store<RootState> | null = null
    waits: Wait[] = []
    heartbeatTimer: number | null = null

    constructor(options: WebSocketPluginOptions) {
        this.url = options.url
        this.maxReconnects = options.maxReconnects || 5
        this.reconnectInterval = options.reconnectInterval || 1000
        this.store = options.store
    }

    setUrl(url: string): void {
        this.url = url
    }

    handleMessage(data: any) {
        const wait = this.getWaitById(data.id)

        // reject promise if it exists
        if ('error' in data && wait?.reject) {
            wait.reject(data.error)
            this.removeWaitById(wait.id)
            return
        }

        // report error messages
        if (data.error?.message) {
            // only report errors, if not disconnected and no init component
            if (data.error?.message !== 'Klippy Disconnected') {
                window.console.error(`Response Error: ${data.error.message} (${wait?.action ?? 'no action'})`)
            }

            if (wait) {
                const modulename = wait.action?.split('/')[1] ?? null

                if (
                    modulename &&
                    wait.action?.startsWith('server/') &&
                    initableServerComponents.includes(modulename) &&
                    this.store?.state.socket?.initializationList.length
                ) {
                    const component = wait.action.replace('server/', '').split('/')[0]
                    window.console.error(`init server component ${component} failed`)
                    this.store?.dispatch('server/addFailedInitComponent', component)
                    this.store?.dispatch('socket/removeInitComponent', `server/${component}/`)
                }

                this.removeWaitById(wait.id)
            }

            return
        }

        // pass it to socket/onMessage, if no wait exists
        if (!wait) {
            this.store?.dispatch('socket/onMessage', data)
            return
        }

        // resolve promise if it exists
        if (wait?.resolve) wait.resolve(data.result ?? {})

        // pass result to action
        if (wait.action) {
            let result = data.result
            if (result === 'ok') result = { result: result }
            if (typeof result === 'string') result = { result: result }

            const preload = {}
            if (wait.actionPayload) Object.assign(preload, wait.actionPayload)
            Object.assign(preload, { requestParams: wait.params })
            Object.assign(preload, result)
            this.store?.dispatch(wait.action, preload)
        }

        this.removeWaitById(wait.id)
    }

    async connect() {
        this.store?.dispatch('socket/setData', {
            isConnecting: true,
        })

        this.instance?.close()
        this.instance = new WebSocket(this.url)

        this.instance.onopen = () => {
            this.reconnects = 0
            this.store?.dispatch('socket/onOpen', event)
        }

        this.instance.onclose = (e) => {
            if (e.wasClean || this.reconnects >= this.maxReconnects) {
                this.store?.dispatch('socket/onClose', e)
                return
            }

            this.reconnects++
            setTimeout(() => {
                this.connect()
            }, this.reconnectInterval)
        }

        this.instance.onerror = () => {
            this.instance?.close()
        }

        this.instance.onmessage = (msg) => {
            if (this.store === null) return

            // websocket is alive
            this.heartbeat()

            const data = JSON.parse(msg.data)
            if (Array.isArray(data)) {
                for (const message of data) {
                    this.handleMessage(message)
                }

                return
            }

            this.handleMessage(data)
        }
    }

    close(): void {
        this.instance?.close()
    }

    getWaitById(id: number): Wait | null {
        return this.waits.find((wait: Wait) => wait.id === id) ?? null
    }

    removeWaitById(id: number | null): void {
        const index = this.waits.findIndex((wait: Wait) => wait.id === id)
        if (index) {
            const wait = this.waits[index]
            if (wait.loading) this.store?.dispatch('socket/removeLoading', { name: wait.loading })
            this.waits.splice(index, 1)
        }
    }

    emit(method: string, params: Params, options: emitOptions = {}): void {
        if (this.instance?.readyState !== WebSocket.OPEN) return

        const id = this.messageId++
        this.waits.push({
            id: id,
            params: params,
            action: options.action ?? null,
            actionPayload: options.actionPayload ?? {},
            loading: options.loading ?? null,
        })

        if (options.loading) this.store?.dispatch('socket/addLoading', { name: options.loading })

        this.instance?.send(
            JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id,
            })
        )
    }

    async emitAndWait(method: string, params: Params | undefined = undefined, options: emitOptions = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.instance?.readyState !== WebSocket.OPEN) reject()

            const id = this.messageId++
            this.waits.push({
                id: id,
                params: params,
                action: options.action ?? null,
                actionPayload: options.actionPayload ?? {},
                loading: options.loading ?? null,
                resolve,
                reject,
            })

            if (options.loading) this.store?.dispatch('socket/addLoading', { name: options.loading })

            this.instance?.send(
                JSON.stringify({
                    jsonrpc: '2.0',
                    method,
                    params,
                    id,
                })
            )
        })
    }

    emitBatch(messages: BatchMessage[]): void {
        if (messages.length === 0) return
        if (this.instance?.readyState !== WebSocket.OPEN) return

        const body = []
        for (const { method, params, emitOptions = {} } of messages) {
            const id = this.messageId++
            this.waits.push({
                id: id,
                params: params,
                action: emitOptions.action ?? null,
                actionPayload: emitOptions.actionPayload ?? {},
                loading: emitOptions.loading ?? null,
            })

            if (emitOptions.loading) this.store?.dispatch('socket/addLoading', { name: emitOptions.loading })
            body.push({
                jsonrpc: '2.0',
                method,
                params,
                id,
            })
        }

        this.instance.send(JSON.stringify(body))
    }

    heartbeat(): void {
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)

        this.heartbeatTimer = window.setTimeout(() => {
            if (this.instance?.readyState !== WebSocket.OPEN || !this.store) return

            this.close()
            this.store?.dispatch('socket/onClose')
        }, 10000)
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
    emit(method: string, params: Params, emitOptions: emitOptions): void
    emitBatch(messages: BatchMessage[]): void
}

export interface BatchMessage {
    method: string
    params: Params
    emitOptions: emitOptions
}

export interface Wait {
    id: number
    params: any
    action?: string | null
    actionPayload?: any
    loading?: string | null
    resolve?: (value: any) => void
    reject?: (reason: any) => void
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
