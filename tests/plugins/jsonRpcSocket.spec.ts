import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { JsonRpcSocket, WebSocketClosedError, WebSocketTimeoutError } from '@/plugins/jsonRpcSocket'

class FakeWebSocket {
    static instances: FakeWebSocket[] = []

    readyState = 0
    sent: { id?: number; method: string; params?: unknown }[] = []
    onopen: (() => void) | null = null
    onclose: ((event: { wasClean: boolean }) => void) | null = null
    onmessage: ((event: { data: string }) => void) | null = null
    onerror: (() => void) | null = null

    constructor(public url: string) {
        FakeWebSocket.instances.push(this)
    }

    send(data: string) {
        const parsed = JSON.parse(data)
        this.sent.push(...(Array.isArray(parsed) ? parsed : [parsed]))
    }

    close() {
        this.readyState = 3
    }

    // test helpers
    open() {
        this.readyState = 1
        this.onopen?.()
    }

    receive(data: unknown) {
        this.onmessage?.({ data: JSON.stringify(data) })
    }

    drop(wasClean = false) {
        this.readyState = 3
        this.onclose?.({ wasClean })
    }
}

const lastSocket = () => FakeWebSocket.instances[FakeWebSocket.instances.length - 1]

const createOpenSocket = (options = {}, handlers = {}) => {
    const client = new JsonRpcSocket({ url: 'ws://printer/websocket', ...options }, handlers)
    client.connect()
    lastSocket().open()
    return client
}

describe('JsonRpcSocket', () => {
    beforeEach(() => {
        FakeWebSocket.instances = []
        vi.stubGlobal('WebSocket', FakeWebSocket)
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.unstubAllGlobals()
    })

    it('resolves a request with the matching result', async () => {
        const client = createOpenSocket()
        const promise = client.request('printer.objects.list')

        const { id, method } = lastSocket().sent[0]
        expect(method).toBe('printer.objects.list')
        lastSocket().receive({ jsonrpc: '2.0', id, result: { objects: ['toolhead'] } })

        await expect(promise).resolves.toEqual({ objects: ['toolhead'] })
    })

    it('matches responses that arrive out of order', async () => {
        const client = createOpenSocket()
        const first = client.call('a')
        const second = client.call('b')
        const [a, b] = lastSocket().sent

        lastSocket().receive({ jsonrpc: '2.0', id: b.id, result: 'B' })
        lastSocket().receive({ jsonrpc: '2.0', id: a.id, result: 'A' })

        await expect(first).resolves.toBe('A')
        await expect(second).resolves.toBe('B')
    })

    it('rejects with the JSON-RPC error object', async () => {
        const client = createOpenSocket()
        const promise = client.call('server.database.get_item', { namespace: 'x' })
        const error = { code: -32601, message: 'Namespace not found' }

        lastSocket().receive({ jsonrpc: '2.0', id: lastSocket().sent[0].id, error })

        await expect(promise).rejects.toEqual(error)
    })

    it('rejects immediately when not open', async () => {
        const client = new JsonRpcSocket({ url: 'ws://printer/websocket' })

        await expect(client.call('server.info')).rejects.toBeInstanceOf(WebSocketClosedError)
    })

    it('rejects with WebSocketTimeoutError after the timeout', async () => {
        const client = createOpenSocket()
        const promise = client.call('printer.info', undefined, { timeout: 2000 })

        vi.advanceTimersByTime(2000)

        await expect(promise).rejects.toBeInstanceOf(WebSocketTimeoutError)
        await expect(promise).rejects.toThrow('Timeout: printer.info')
    })

    it('forwards notifications', () => {
        const onNotification = vi.fn()
        createOpenSocket({}, { onNotification })
        const notification = { jsonrpc: '2.0', method: 'notify_klippy_ready' }

        lastSocket().receive(notification)

        expect(onNotification).toHaveBeenCalledWith(notification)
    })

    it('sends a batch in one frame and resolves each call', async () => {
        const client = createOpenSocket()
        const sendSpy = vi.spyOn(lastSocket(), 'send')
        const [first, second] = client.batch([{ method: 'a' }, { method: 'b', params: { x: 1 } }])

        expect(sendSpy).toHaveBeenCalledTimes(1)
        const [a, b] = lastSocket().sent
        lastSocket().receive([
            { jsonrpc: '2.0', id: a.id, result: 1 },
            { jsonrpc: '2.0', id: b.id, result: 2 },
        ])

        await expect(first).resolves.toBe(1)
        await expect(second).resolves.toBe(2)
    })

    it('close() rejects pending requests and calls onClose once', async () => {
        const onClose = vi.fn()
        const client = createOpenSocket({}, { onClose })
        const promise = client.call('server.info')

        client.close()

        await expect(promise).rejects.toBeInstanceOf(WebSocketClosedError)
        expect(onClose).toHaveBeenCalledTimes(1)
        expect(client.isOpen).toBe(false)
    })

    it('reconnects with exponential backoff until maxReconnects, then calls onClose', () => {
        const onClose = vi.fn()
        const onReconnecting = vi.fn()
        createOpenSocket({ maxReconnects: 2, reconnectInterval: 1000 }, { onClose, onReconnecting })

        lastSocket().drop()
        expect(onReconnecting).toHaveBeenLastCalledWith(1)
        vi.advanceTimersByTime(1000)
        expect(FakeWebSocket.instances).toHaveLength(2)

        lastSocket().drop()
        expect(onReconnecting).toHaveBeenLastCalledWith(2)
        vi.advanceTimersByTime(1999)
        expect(FakeWebSocket.instances).toHaveLength(2)
        vi.advanceTimersByTime(1)
        expect(FakeWebSocket.instances).toHaveLength(3)

        lastSocket().drop()
        vi.advanceTimersByTime(10000)
        expect(FakeWebSocket.instances).toHaveLength(3)
        expect(onReconnecting).toHaveBeenCalledTimes(2)
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('limits the reconnect delay to maxReconnectDelay', () => {
        createOpenSocket({ maxReconnects: 10, reconnectInterval: 1000, maxReconnectDelay: 3000 })

        lastSocket().drop()
        vi.advanceTimersByTime(1000)
        lastSocket().drop()
        vi.advanceTimersByTime(2000)
        lastSocket().drop()
        vi.advanceTimersByTime(3000)
        expect(FakeWebSocket.instances).toHaveLength(4)
    })

    it('resets the reconnect counter after a successful reconnect', () => {
        const onClose = vi.fn()
        createOpenSocket({ maxReconnects: 1 }, { onClose })

        lastSocket().drop()
        vi.advanceTimersByTime(1000)
        lastSocket().open()
        lastSocket().drop()
        vi.advanceTimersByTime(1000)

        expect(FakeWebSocket.instances).toHaveLength(3)
        expect(onClose).not.toHaveBeenCalled()
    })

    it('rejects pending requests on an unclean close', async () => {
        const client = createOpenSocket()
        const promise = client.call('server.info')

        lastSocket().drop()

        await expect(promise).rejects.toBeInstanceOf(WebSocketClosedError)
    })

    it('reconnects after a clean close by the server', () => {
        const onClose = vi.fn()
        createOpenSocket({}, { onClose })

        lastSocket().drop(true)
        vi.advanceTimersByTime(1000)

        expect(FakeWebSocket.instances).toHaveLength(2)
        expect(onClose).not.toHaveBeenCalled()
    })

    it('ignores late events of the previous socket after connect()', () => {
        const onClose = vi.fn()
        const client = createOpenSocket({}, { onClose })
        const oldSocket = lastSocket()

        client.connect()
        lastSocket().open()
        oldSocket.drop()
        vi.advanceTimersByTime(5000)

        expect(onClose).not.toHaveBeenCalled()
        expect(FakeWebSocket.instances).toHaveLength(2)
        expect(client.isOpen).toBe(true)
    })

    it('close() cancels a scheduled reconnect', () => {
        const onClose = vi.fn()
        const client = createOpenSocket({}, { onClose })

        lastSocket().drop()
        client.close()
        vi.advanceTimersByTime(5000)

        expect(FakeWebSocket.instances).toHaveLength(1)
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('reconnects when the heartbeat times out', async () => {
        const onClose = vi.fn()
        const client = createOpenSocket({ heartbeatTimeout: 10000, reconnectInterval: 1000 }, { onClose })
        const promise = client.call('server.info')

        vi.advanceTimersByTime(9000)
        lastSocket().receive({ jsonrpc: '2.0', method: 'notify_proc_stat_update' })
        vi.advanceTimersByTime(9000)
        expect(client.isOpen).toBe(true)

        vi.advanceTimersByTime(1000)
        expect(client.isOpen).toBe(false)
        await expect(promise).rejects.toBeInstanceOf(WebSocketClosedError)

        vi.advanceTimersByTime(1000)
        expect(FakeWebSocket.instances).toHaveLength(2)
        expect(onClose).not.toHaveBeenCalled()
    })

    it('reconnectIfDisconnected() connects again after all reconnects failed', () => {
        const onClose = vi.fn()
        const client = createOpenSocket({ maxReconnects: 0 }, { onClose })

        lastSocket().drop()
        expect(onClose).toHaveBeenCalledTimes(1)

        client.reconnectIfDisconnected()
        expect(FakeWebSocket.instances).toHaveLength(2)
    })

    it('reconnectIfDisconnected() does nothing while open or after close()', () => {
        const client = createOpenSocket()

        client.reconnectIfDisconnected()
        expect(FakeWebSocket.instances).toHaveLength(1)

        client.close()
        client.reconnectIfDisconnected()
        expect(FakeWebSocket.instances).toHaveLength(1)
    })
})
