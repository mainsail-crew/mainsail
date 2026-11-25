import { Store } from 'vuex'
import _Vue from 'vue'
import { RootState } from '@/store/types'
import { initableServerComponents } from '@/store/variables'
import { isJsonRpcError } from '@/types/moonraker'
import type { RPCMethods, RPCParams, RPCResult } from '@/types/moonraker'
import { JsonRpcSocket, WebSocketClosedError } from '@/plugins/jsonRpcSocket'

export class WebSocketClient {
    private readonly socket: JsonRpcSocket
    private readonly store: Store<RootState>

    constructor(options: WebSocketPluginOptions) {
        this.store = options.store
        this.socket = new JsonRpcSocket(
            {
                url: options.url,
                maxReconnects: options.maxReconnects ?? 5,
                reconnectInterval: options.reconnectInterval ?? 1000,
                heartbeatTimeout: 10000,
            },
            {
                onOpen: () => this.store.dispatch('socket/onOpen'),
                onReconnecting: () =>
                    this.store.dispatch('socket/setData', {
                        isConnected: false,
                        isConnecting: true,
                        connectingFailed: false,
                    }),
                onClose: (event) => this.store.dispatch('socket/onClose', event),
                onNotification: (notification) => this.store.dispatch('socket/onMessage', notification),
            }
        )

        // the browser may suspend or kill the connection in background tabs or on network changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') this.reconnectIfDisconnected()
        })
        window.addEventListener('online', () => this.reconnectIfDisconnected())
    }

    setUrl(url: string): void {
        this.socket.setUrl(url)
    }

    connect(): void {
        this.store.dispatch('socket/setData', { isConnecting: true, connectingFailed: false })
        this.socket.connect()
    }

    /** Connects again with the full number of reconnect attempts, e.g. after "try again" or a printer switch. */
    reconnect(): void {
        this.connect()
    }

    close(): void {
        this.socket.close()
    }

    private reconnectIfDisconnected(): void {
        if (!this.socket.reconnectIfDisconnected()) return

        this.store.dispatch('socket/setData', { isConnecting: true, connectingFailed: false })
    }

    emitAndWait<M extends RPCMethods>(
        method: M,
        params?: RPCParams<M>,
        options: EmitAndWaitOptions = {}
    ): Promise<RPCResult<M>> {
        const request = this.socket.request(method, params, { timeout: options.timeout })
        if (options.loading) this.trackLoading(request, options.loading)

        return request
    }

    emit(method: string, params: Params = {}, options: EmitOptions = {}): void {
        if (!this.socket.isOpen) return

        this.handleRequest(this.socket.call(method, params), params, options)
    }

    emitBatch(messages: BatchMessage[]): void {
        if (messages.length === 0 || !this.socket.isOpen) return

        const requests = this.socket.batch(messages.map(({ method, params }) => ({ method, params })))
        requests.forEach((request, index) => {
            const { params, emitOptions } = messages[index]
            this.handleRequest(request, params, emitOptions)
        })
    }

    private trackLoading(request: Promise<unknown>, name: string): void {
        this.store.dispatch('socket/addLoading', { name })

        const remove = () => this.store.dispatch('socket/removeLoading', { name })
        request.then(remove, remove)
    }

    private handleRequest(request: Promise<unknown>, params: Params, options: EmitOptions = {}): void {
        const { action = null, actionPayload = {}, loading = null } = options
        if (loading) this.trackLoading(request, loading)

        request.then(
            (result) => {
                if (action) this.store.dispatch(action, buildActionPayload(result, params, actionPayload))
            },
            (error) => this.handleError(error, action)
        )
    }

    private handleError(error: unknown, action: string | null): void {
        // connection loss is shown by the connecting dialog, no need to log every request
        if (error instanceof WebSocketClosedError) return

        if (!isJsonRpcError(error)) {
            window.console.error(error)
            return
        }

        if (error.message !== 'Klippy Disconnected') {
            window.console.error(`Response Error: ${error.message} (${action ?? 'no action'})`)
        }

        // TODO: remove after converting to async init server components
        const component = action?.startsWith('server/') ? action.split('/')[1] : null
        if (
            !component ||
            !initableServerComponents.includes(component) ||
            !this.store.state.socket?.initializationList.length
        )
            return

        window.console.error(`init server component ${component} failed`)
        this.store.dispatch('server/addFailedInitComponent', component)
        this.store.dispatch('socket/removeInitComponent', `server/${component}/`)
    }
}

/** Builds the payload for callback actions: actionPayload + requestParams + result. */
const buildActionPayload = (result: unknown, params: Params, actionPayload: Params): Record<string, unknown> => {
    // string results (e.g. 'ok') are wrapped, so actions can always read `payload.result`
    const normalized = typeof result === 'string' ? { result } : result

    return { ...actionPayload, requestParams: params, ...(normalized as Record<string, unknown>) }
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

type Params = object

interface EmitOptions {
    action?: string | null
    actionPayload?: Params
    loading?: string | null
}

interface EmitAndWaitOptions {
    loading?: string | null
    timeout?: number
}
