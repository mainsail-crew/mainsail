import { Store } from 'vuex'
import _Vue from 'vue'
import { RootState } from '@/store/types'
import { initableServerComponents } from '@/store/variables'
import type { RPCMethods, RPCParams, RPCResult } from '@/types/moonraker'

const HEARTBEAT_TIMEOUT = 10_000
const MAX_RECONNECT_DELAY = 30_000

export class WebSocketClient {
    private url: string
    private instance: WebSocket | null = null
    private readonly maxReconnects: number
    private readonly reconnectInterval: number
    private reconnects = 0
    private reconnectTimer: number | null = null
    private messageId: number = 0
    private readonly store: Store<RootState>
    private waits: Wait[] = []
    private heartbeatTimer: number | null = null
    private autoReconnect: boolean = false

    constructor(options: WebSocketPluginOptions) {
        this.url = options.url
        this.maxReconnects = options.maxReconnects ?? 5
        this.reconnectInterval = options.reconnectInterval ?? 1_000
        this.store = options.store

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') this.reconnectIfDisconnected()
        })
        window.addEventListener('online', () => this.reconnectIfDisconnected())
    }

    setUrl(url: string): void {
        this.url = url
    }

    private handleMessage(data: SocketIncomingMessage): void {
        const wait = typeof data.id === 'number' ? this.getWaitById(data.id) : null

        // reject promise if it exists
        if (data.error && wait?.reject) {
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
                    this.store.state.socket?.initializationList.length
                ) {
                    const component = wait.action.replace('server/', '').split('/')[0]
                    window.console.error(`init server component ${component} failed`)
                    this.store.dispatch('server/addFailedInitComponent', component)
                    this.store.dispatch('socket/removeInitComponent', `server/${component}/`)
                }

                this.removeWaitById(wait.id)
            }

            return
        }

        // pass it to socket/onMessage if no wait exists
        if (!wait) {
            this.store.dispatch('socket/onMessage', data)
            return
        }

        // resolve promise if it exists
        if (wait.resolve) wait.resolve(data.result ?? {})

        // pass result to action
        if (wait.action) {
            let result = data.result
            if (result === 'ok') result = { result }
            if (typeof result === 'string') result = { result }

            const payload: Record<string, unknown> = {}
            if (wait.actionPayload) Object.assign(payload, wait.actionPayload)
            Object.assign(payload, { requestParams: wait.params })
            Object.assign(payload, result as Record<string, unknown>)
            this.store.dispatch(wait.action, payload)
        }

        this.removeWaitById(wait.id)
    }

    async connect() {
        this.store.dispatch('socket/setData', {
            isConnecting: true,
        })

        this.dropInstance()
        this.clearReconnectTimer()
        this.autoReconnect = true
        this.instance = new WebSocket(this.url)

        this.instance.onopen = () => {
            this.reconnects = 0
            this.heartbeat()
            this.store.dispatch('socket/onOpen')
        }

        this.instance.onclose = () => {
            this.clearHeartbeat()
            this.rejectPendingWaits()

            if (!this.autoReconnect) {
                this.store.dispatch('socket/onClose')
                return
            }

            this.scheduleReconnect()
        }

        this.instance.onerror = () => {
            this.instance?.close()
        }

        this.instance.onmessage = (msg) => {
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
        this.autoReconnect = false
        this.clearReconnectTimer()
        this.clearHeartbeat()
        this.instance?.close()
    }

    reconnect(): void {
        this.reconnects = 0
        this.store.dispatch('socket/setData', { connectingFailed: false })
        this.connect()
    }

    private reconnectIfDisconnected(): void {
        if (!this.autoReconnect) return

        const state = this.instance?.readyState
        if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return

        this.reconnect()
    }

    private getWaitById(id: number): Wait | null {
        return this.waits.find((wait: Wait) => wait.id === id) ?? null
    }

    private removeWaitById(id: number): void {
        const index = this.waits.findIndex((wait: Wait) => wait.id === id)
        if (index === -1) return

        const wait = this.waits[index]
        if (wait.loading) this.store.dispatch('socket/removeLoading', { name: wait.loading })
        this.waits.splice(index, 1)
    }

    emit(method: string, params: Params, options: EmitOptions = {}): void {
        if (this.instance?.readyState !== WebSocket.OPEN) return

        const id = this.messageId++
        this.waits.push({
            id: id,
            params: params,
            action: options.action ?? null,
            actionPayload: options.actionPayload ?? {},
            loading: options.loading ?? null,
        })

        if (options.loading) this.store.dispatch('socket/addLoading', { name: options.loading })

        this.instance.send(
            JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id,
            })
        )
    }

    emitAndWait<M extends RPCMethods>(
        method: M,
        params?: RPCParams<M>,
        options: EmitOptions = {}
    ): Promise<RPCResult<M>> {
        return new Promise<RPCResult<M>>((resolve, reject) => {
            if (this.instance?.readyState !== WebSocket.OPEN) {
                reject(new Error('WebSocket is not connected'))
                return
            }

            const id = this.messageId++
            this.waits.push({
                id: id,
                params: params,
                action: options.action ?? null,
                actionPayload: options.actionPayload ?? {},
                loading: options.loading ?? null,
                resolve: resolve as (value: unknown) => void,
                reject,
            })

            if (options.loading) this.store.dispatch('socket/addLoading', { name: options.loading })

            this.instance.send(
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

            if (emitOptions.loading) this.store.dispatch('socket/addLoading', { name: emitOptions.loading })
            body.push({
                jsonrpc: '2.0',
                method,
                params,
                id,
            })
        }

        this.instance.send(JSON.stringify(body))
    }

    private heartbeat(): void {
        this.clearHeartbeat()
        this.heartbeatTimer = window.setTimeout(() => {
            if (this.instance?.readyState !== WebSocket.OPEN) return

            this.dropInstance()
            this.scheduleReconnect()
        }, HEARTBEAT_TIMEOUT)
    }

    private clearHeartbeat(): void {
        if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer)

        this.heartbeatTimer = null
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) return
        if (this.reconnects >= this.maxReconnects) {
            this.store.dispatch('socket/onClose')
            return
        }

        const delay = Math.min(this.reconnectInterval * 2 ** this.reconnects, MAX_RECONNECT_DELAY)
        this.reconnects++
        this.store.dispatch('socket/setData', { isConnected: false, isConnecting: true, connectingFailed: false })
        this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = null
            this.connect()
        }, delay)
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer)

        this.reconnectTimer = null
    }

    private dropInstance(): void {
        if (!this.instance) return

        this.instance.onopen = this.instance.onclose = this.instance.onerror = this.instance.onmessage = null
        this.instance.close()
        this.instance = null
        this.clearHeartbeat()
        this.rejectPendingWaits()
    }

    private rejectPendingWaits(): void {
        this.waits.forEach((wait) => {
            if (wait.loading) this.store.dispatch('socket/removeLoading', { name: wait.loading })
            wait.reject?.(new Error('WebSocket connection lost'))
        })

        this.waits = []
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

export interface BatchMessage {
    method: string
    params: Params
    emitOptions: EmitOptions
}

interface SocketError {
    code?: number
    message?: string
    [key: string]: unknown
}

interface SocketIncomingMessage {
    id?: number
    result?: unknown
    error?: SocketError
    method?: string
    params?: unknown[]
    [key: string]: unknown
}

interface Wait {
    id: number
    params: unknown
    action?: string | null
    actionPayload?: Params
    loading?: string | null
    resolve?: (value: unknown) => void
    reject?: (reason?: unknown) => void
}

type Params = object

interface EmitOptions {
    action?: string | null
    actionPayload?: Params
    loading?: string | null
}
