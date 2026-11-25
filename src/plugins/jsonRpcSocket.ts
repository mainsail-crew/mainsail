import type { JsonRpcResponse, RPCMethods, RPCParams, RPCResult } from '@/types/moonraker'

/** WebSocket.OPEN. Inlined so this module has no runtime dependency on the global WebSocket object. */
const WS_OPEN = 1
/** WebSocket.CONNECTING. */
const WS_CONNECTING = 0

/**
 * JSON-RPC 2.0 notification (a message from the server without an id).
 * @see https://moonraker.readthedocs.io/en/latest/external_api/jsonrpc_notifications/
 */
export interface JsonRpcNotification {
    jsonrpc: '2.0'
    method: string
    params?: unknown[]
}

export interface JsonRpcSocketOptions {
    url: string
    /** Reconnect attempts after a connection loss. Default: 5 */
    maxReconnects?: number
    /** Delay before the first reconnect attempt in ms. It doubles with every attempt. Default: 1000 */
    reconnectInterval?: number
    /** Upper limit for the reconnect delay in ms. Default: 30000 */
    maxReconnectDelay?: number
    /** Reconnect if no message arrives for this many ms. `null` disables it. Default: null */
    heartbeatTimeout?: number | null
}

export interface JsonRpcSocketHandlers {
    /** The connection is open (also after a successful automatic reconnect). */
    onOpen?: () => void
    /** The connection was lost and a reconnect attempt is scheduled. */
    onReconnecting?: (attempt: number) => void
    /** The connection is closed and will not reconnect automatically. */
    onClose?: (event?: CloseEvent) => void
    /** The server sent a notification. */
    onNotification?: (notification: JsonRpcNotification) => void
}

export interface JsonRpcRequestOptions {
    /** Reject the request with a WebSocketTimeoutError after this many ms. */
    timeout?: number
}

export interface JsonRpcCall {
    method: string
    params?: unknown
}

interface PendingRequest {
    resolve: (result: unknown) => void
    reject: (reason: unknown) => void
    timer: ReturnType<typeof setTimeout> | null
}

export class WebSocketTimeoutError extends Error {
    constructor(method: string) {
        super(`Timeout: ${method}`)
        this.name = 'WebSocketTimeoutError'
    }
}

export class WebSocketClosedError extends Error {
    constructor(message = 'WebSocket closed') {
        super(message)
        this.name = 'WebSocketClosedError'
    }
}

/**
 * Generic JSON-RPC 2.0 client over a WebSocket.
 *
 * Handles the transport and the protocol only: connecting, reconnecting, heartbeat,
 * matching responses to requests and passing on notifications.
 *
 * Pending requests are always settled: they resolve, reject with the JSON-RPC error,
 * reject with a WebSocketTimeoutError, or reject with a WebSocketClosedError when the
 * connection closes.
 */
export class JsonRpcSocket {
    private url: string
    private readonly maxReconnects: number
    private readonly reconnectInterval: number
    private readonly maxReconnectDelay: number
    private readonly heartbeatTimeout: number | null
    private readonly handlers: JsonRpcSocketHandlers

    private instance: WebSocket | null = null
    /** true between connect() and close(): the connection should be kept alive. */
    private active = false
    private messageId = 0
    private reconnects = 0
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null
    private heartbeatTimer: ReturnType<typeof setTimeout> | null = null
    private readonly pending = new Map<number, PendingRequest>()

    constructor(options: JsonRpcSocketOptions, handlers: JsonRpcSocketHandlers = {}) {
        this.url = options.url
        this.maxReconnects = options.maxReconnects ?? 5
        this.reconnectInterval = options.reconnectInterval ?? 1000
        this.maxReconnectDelay = options.maxReconnectDelay ?? 30000
        this.heartbeatTimeout = options.heartbeatTimeout ?? null
        this.handlers = handlers
    }

    get isOpen(): boolean {
        return this.instance?.readyState === WS_OPEN
    }

    setUrl(url: string): void {
        this.url = url
    }

    /**
     * Opens a new connection. An existing connection is dropped silently (no onClose),
     * and its late events are ignored.
     */
    connect(): void {
        this.teardown()
        this.active = true
        this.reconnects = 0
        this.open()
    }

    /** Closes the connection on purpose. Pending requests are rejected, and onClose fires once. */
    close(): void {
        const wasActive = this.instance !== null || this.reconnectTimer !== null
        this.active = false
        this.teardown()
        if (wasActive) this.handlers.onClose?.()
    }

    /**
     * Connects again with a fresh reconnect counter, if the connection should be alive but isn't
     * (e.g. all reconnect attempts failed, or a reconnect is still waiting for its timer).
     * Does nothing after close(). Returns true if a new connection was started.
     */
    reconnectIfDisconnected(): boolean {
        if (!this.active) return false

        const state = this.instance?.readyState
        if (state === WS_OPEN || state === WS_CONNECTING) return false

        this.connect()
        return true
    }

    /** Typed request. The method, params and result types come from MoonrakerRPCInterface. */
    request<M extends RPCMethods>(
        method: M,
        params?: RPCParams<M>,
        options: JsonRpcRequestOptions = {}
    ): Promise<RPCResult<M>> {
        return this.call(method, params, options) as Promise<RPCResult<M>>
    }

    /** Untyped request for methods that are not in MoonrakerRPCInterface yet. Prefer `request`. */
    call(method: string, params?: unknown, options: JsonRpcRequestOptions = {}): Promise<unknown> {
        const socket = this.instance
        if (socket?.readyState !== WS_OPEN) return Promise.reject(new WebSocketClosedError('WebSocket not open'))

        const { promise, message } = this.prepare(method, params, options)
        socket.send(JSON.stringify(message))

        return promise
    }

    /** Sends several requests in one frame. Returns one promise per call, in the same order. */
    batch(calls: JsonRpcCall[]): Promise<unknown>[] {
        const socket = this.instance
        if (socket?.readyState !== WS_OPEN)
            return calls.map(() => Promise.reject(new WebSocketClosedError('WebSocket not open')))
        if (calls.length === 0) return []

        const prepared = calls.map(({ method, params }) => this.prepare(method, params, {}))
        socket.send(JSON.stringify(prepared.map(({ message }) => message)))

        return prepared.map(({ promise }) => promise)
    }

    private open(): void {
        const socket = new WebSocket(this.url)
        this.instance = socket

        socket.onopen = () => {
            this.reconnects = 0
            this.resetHeartbeat()
            this.handlers.onOpen?.()
        }
        socket.onmessage = (event: MessageEvent) => this.onMessage(event)
        socket.onclose = (event: CloseEvent) => this.onSocketClose(event)
    }

    private onSocketClose(event: CloseEvent): void {
        // close() detaches the handlers first, so every close event here is a connection loss
        this.instance = null
        this.stopHeartbeat()
        this.rejectAll(new WebSocketClosedError())
        this.scheduleReconnect(event)
    }

    /** Reconnects with exponential backoff, or gives up (onClose) after maxReconnects attempts. */
    private scheduleReconnect(event?: CloseEvent): void {
        if (this.reconnectTimer) return
        if (this.reconnects >= this.maxReconnects) {
            this.handlers.onClose?.(event)
            return
        }

        const delay = Math.min(this.reconnectInterval * 2 ** this.reconnects, this.maxReconnectDelay)
        this.reconnects++
        this.handlers.onReconnecting?.(this.reconnects)
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null
            this.open()
        }, delay)
    }

    private onMessage(event: MessageEvent): void {
        this.resetHeartbeat()

        const data = JSON.parse(event.data) as JsonRpcResponse | JsonRpcNotification | unknown[]
        const messages = Array.isArray(data) ? data : [data]

        for (const message of messages) {
            this.handleMessage(message as JsonRpcResponse | JsonRpcNotification)
        }
    }

    private handleMessage(message: JsonRpcResponse | JsonRpcNotification): void {
        if ('method' in message) {
            this.handlers.onNotification?.(message)
            return
        }

        if (message.id === undefined) return

        const request = this.pending.get(message.id)
        if (!request) return

        this.pending.delete(message.id)
        if (request.timer) clearTimeout(request.timer)

        if (message.error) request.reject(message.error)
        else request.resolve(message.result)
    }

    private prepare(method: string, params: unknown, options: JsonRpcRequestOptions) {
        const id = ++this.messageId

        const promise = new Promise<unknown>((resolve, reject) => {
            const timer = options.timeout
                ? setTimeout(() => {
                      this.pending.delete(id)
                      reject(new WebSocketTimeoutError(method))
                  }, options.timeout)
                : null

            this.pending.set(id, { resolve, reject, timer })
        })

        return { promise, message: { jsonrpc: '2.0', method, params, id } }
    }

    /** Drops the current connection and a scheduled reconnect without notifying. */
    private teardown(): void {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
        this.dropConnection()
    }

    /** Drops the current connection without notifying. */
    private dropConnection(): void {
        this.stopHeartbeat()

        const socket = this.instance
        this.instance = null
        if (socket) {
            // detach first, so late events of the old socket can't affect the new one
            socket.onopen = null
            socket.onmessage = null
            socket.onclose = null
            socket.onerror = null
            socket.close()
        }

        this.rejectAll(new WebSocketClosedError())
    }

    private rejectAll(reason: Error): void {
        this.pending.forEach((request) => {
            if (request.timer) clearTimeout(request.timer)
            request.reject(reason)
        })
        this.pending.clear()
    }

    private resetHeartbeat(): void {
        this.stopHeartbeat()
        if (this.heartbeatTimeout === null) return

        this.heartbeatTimer = setTimeout(() => {
            this.heartbeatTimer = null
            // a client-side close() would be clean and stop reconnecting, so drop and reconnect instead
            this.dropConnection()
            this.scheduleReconnect()
        }, this.heartbeatTimeout)
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer)
        this.heartbeatTimer = null
    }
}
