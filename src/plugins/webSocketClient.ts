import { Store } from 'vuex'
import _Vue from 'vue'
import { RootState } from '@/store/types'
import { initableServerComponents } from '@/store/variables'
import type { RPCMethods, RPCParams, RPCResult } from '@/types/moonraker'

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
    /** Pending reconnect timer handle; cleared on each fresh connect() call. */
    private reconnectTimer: number | null = null
    /**
     * AbortController for the in-flight probe fetch; also doubles as the
     * "probe already launched" flag (null = not yet probed this sequence).
     * Aborted and nulled on fresh connect(); nulled on successful open.
     */
    private probeController: AbortController | null = null

    constructor(options: WebSocketPluginOptions) {
        this.url = options.url
        this.maxReconnects = options.maxReconnects || 5
        this.reconnectInterval = options.reconnectInterval || 1000
        this.store = options.store
    }

    setUrl(url: string): void {
        this.url = url
    }

    handleMessage(data: SocketIncomingMessage): void {
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
        if (wait.resolve) wait.resolve(data.result ?? {})

        // pass result to action
        if (wait.action) {
            let result = data.result
            if (result === 'ok') result = { result }
            if (typeof result === 'string') result = { result }

            const preload: Record<string, unknown> = {}
            if (wait.actionPayload) Object.assign(preload, wait.actionPayload)
            Object.assign(preload, { requestParams: wait.params })
            Object.assign(preload, result as Record<string, unknown>)
            this.store?.dispatch(wait.action, preload)
        }

        this.removeWaitById(wait.id)
    }

    /**
     * Open (or re-open) the WebSocket connection.
     *
     * @param reconnecting - Pass `true` only when called from the internal
     *   reconnect timer. When `false` (the default), counters are reset so
     *   that manual "Try Again" attempts start a fresh sequence.
     */
    async connect(reconnecting = false) {
        if (!reconnecting) {
            // Fresh connection attempt: cancel any in-flight probe and
            // pending reconnect timer from the previous sequence.
            this.probeController?.abort()
            this.probeController = null
            this.reconnects = 0
            if (this.reconnectTimer !== null) {
                clearTimeout(this.reconnectTimer)
                this.reconnectTimer = null
            }
        }

        this.store?.dispatch('socket/setData', {
            isConnecting: true,
        })

        this.instance?.close()
        this.instance = new WebSocket(this.url)

        this.instance.onopen = () => {
            this.reconnects = 0
            this.probeController?.abort()
            this.probeController = null
            this.store?.dispatch('socket/onOpen', event)
        }

        this.instance.onclose = (e) => {
            // Clean close (intentional disconnect) — no probing needed.
            if (e.wasClean) {
                this.store?.dispatch('socket/onClose', e)
                return
            }

            // On the first unclean failure, fire the HTTP probe in parallel
            // with the reconnect loop. This lets us distinguish:
            //   • Permanent failure (auth proxy redirect) → navigate immediately.
            //   • Temporary failure (server down/starting) → probe throws or
            //     returns non-redirected; reconnect loop continues normally.
            if (this.probeController === null) {
                this.probeAndRedirect()
            }

            if (this.reconnects >= this.maxReconnects) {
                this.store?.dispatch('socket/onClose', e)
                return
            }

            this.reconnects++
            this.reconnectTimer = window.setTimeout(() => {
                this.reconnectTimer = null
                this.connect(true)
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

    /**
     * Converts the WebSocket URL to its HTTP(S) equivalent and fetches
     * /server/info. If the response was redirected (e.g. by an auth proxy),
     * the whole page is navigated to the redirect target so the user can
     * authenticate and return to Mainsail.
     *
     * Stores an AbortController so a subsequent fresh connect() can cancel
     * the fetch before it resolves.
     */
    private async probeAndRedirect(): Promise<void> {
        this.probeController = new AbortController()
        const probeUrl = this.url
            .replace(/^wss:/, 'https:')
            .replace(/^ws:/, 'http:')
            .replace(/\/websocket$/, '/server/info')

        try {
            const response = await fetch(probeUrl, { method: 'GET', redirect: 'follow', signal: this.probeController.signal })
            if (response.redirected) {
                // Auth proxies embed the original URL somewhere in their
                // redirect URL (e.g. ?rd=, ?return=, ?next=). To handle this
                // generically, we iterate through the query parameters and
                // replace the one matching the probe URL (or its path) with
                // the current page.
                const authUrl = new URL(response.url)
                const probeUrlObj = new URL(probeUrl)
                for (const [key, value] of authUrl.searchParams.entries()) {
                    if (value === probeUrl) {
                        authUrl.searchParams.set(key, window.location.href)
                        break
                    } else if (value === probeUrlObj.pathname) {
                        // If the proxy used a relative path, give it a relative
                        // path back to avoid triggering open-redirect protections.
                        authUrl.searchParams.set(key, window.location.pathname + window.location.search + window.location.hash)
                        break
                    }
                }
                window.location.href = authUrl.toString()
            }
        } catch {
            // Network unreachable or aborted — no redirect to follow.
        }
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

    emitAndWait<M extends RPCMethods>(
        method: M,
        params?: RPCParams<M>,
        options: emitOptions = {}
    ): Promise<RPCResult<M>> {
        return new Promise<RPCResult<M>>((resolve, reject) => {
            if (this.instance?.readyState !== WebSocket.OPEN) reject()

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

export interface BatchMessage {
    method: string
    params: Params
    emitOptions: emitOptions
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

export interface Wait {
    id: number
    params: unknown
    action?: string | null
    actionPayload?: Params
    loading?: string | null
    resolve?: (value: unknown) => void
    reject?: (reason?: unknown) => void
}

type Params = object

interface emitOptions {
    action?: string | null
    actionPayload?: Params
    loading?: string | null
}
