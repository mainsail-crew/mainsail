import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import type { FarmState } from '@/store/farm/types'
import type { RootState } from '@/store/types'

type Responder = (params: Record<string, unknown>) => unknown

class FakeWebSocket {
    static instances: FakeWebSocket[] = []
    static responders: Record<string, Responder> = {}

    readyState = 0
    sent: { id: number; method: string; params: Record<string, unknown> }[] = []
    onopen: (() => void) | null = null
    onclose: ((event: { wasClean: boolean }) => void) | null = null
    onmessage: ((event: { data: string }) => void) | null = null
    onerror: (() => void) | null = null

    constructor(public url: string) {
        FakeWebSocket.instances.push(this)
    }

    send(data: string) {
        const message = JSON.parse(data)
        this.sent.push(message)

        const responder = FakeWebSocket.responders[message.method]
        if (!responder) return

        let response: Record<string, unknown>
        try {
            response = { jsonrpc: '2.0', id: message.id, result: responder(message.params ?? {}) }
        } catch (error) {
            response = { jsonrpc: '2.0', id: message.id, error }
        }
        queueMicrotask(() => this.receive(response))
    }

    close() {
        this.readyState = 3
    }

    open() {
        this.readyState = 1
        this.onopen?.()
    }

    receive(data: unknown) {
        this.onmessage?.({ data: JSON.stringify(data) })
    }

    methods() {
        return this.sent.map((message) => message.method)
    }
}

const lastSocket = () => FakeWebSocket.instances[FakeWebSocket.instances.length - 1]
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const defaultResponders = (): Record<string, Responder> => ({
    'server.info': () => ({ klippy_connected: true, klippy_state: 'ready' }),
    'printer.objects.list': () => ({
        objects: ['webhooks', 'print_stats', 'extruder', 'extruder1', 'extruder_stepper e1', 'fan', 'heater_bed'],
    }),
    'printer.objects.subscribe': () => ({
        eventtime: 1,
        status: { print_stats: { state: 'standby', filename: '' }, heater_bed: { temperature: 20, target: 0 } },
    }),
    'server.files.list': () => [
        { path: 'printer.cfg', modified: 0, size: 0, permissions: 'rw' },
        { path: '.theme/sidebar-logo.png', modified: 0, size: 0, permissions: 'rw' },
    ],
    'server.database.get_item': () => ({
        namespace: 'mainsail',
        key: null,
        value: { general: { printername: 'Voron' }, uiSettings: { logo: '#123456' } },
    }),
    'server.webcams.list': () => ({ webcams: [{ name: 'cam', enabled: true }] }),
    'server.files.metadata': (params) => ({ filename: params.filename, modified: 0, size: 0, filament_total: 1000 }),
})

Vue.use(Vuex)

const stores: Store<RootState>[] = []

const printerState = (store: Store<RootState>, id = 'p1') => (store.state.farm as FarmState)[id]

const createStore = async () => {
    const { farm } = await import('@/store/farm')
    const updateSettings = vi.fn()

    const store = new Store<RootState>({
        modules: {
            farm,
            gui: { namespaced: true, modules: { remoteprinters: { namespaced: true, actions: { updateSettings } } } },
        },
    })
    stores.push(store)

    return { store, updateSettings }
}

const registerPrinter = async (store: Store<RootState>, id = 'p1') => {
    await store.dispatch('farm/registerPrinter', { id, hostname: 'printer.local', port: 7125, path: '' })
    lastSocket().open()
    await flush()
}

describe('farm store actions', () => {
    beforeEach(() => {
        FakeWebSocket.instances = []
        FakeWebSocket.responders = defaultResponders()
        vi.stubGlobal('WebSocket', FakeWebSocket)
        vi.stubGlobal('document', { location: { protocol: 'http:' } })
        vi.stubGlobal('window', { console: { error: vi.fn(), debug: vi.fn() }, location: { protocol: 'http:' } })
    })

    afterEach(async () => {
        // the client registry lives outside of the store, so remove the clients explicitly
        for (const store of stores.splice(0)) {
            for (const id of Object.keys(store.state.farm ?? {})) await store.dispatch('farm/unregisterPrinter', id)
        }
        vi.unstubAllGlobals()
    })

    it('connects and loads the printer data', async () => {
        const { store } = await createStore()
        await registerPrinter(store)

        const printer = printerState(store)
        expect(lastSocket().url).toBe('ws://printer.local:7125/websocket')
        expect(printer.socket.isConnected).toBe(true)
        expect(printer.klippyState).toBe('ready')
        expect(printer.themeFiles).toEqual(['.theme/sidebar-logo.png'])
        expect(printer.mainsail.printername).toBe('Voron')
        expect(printer.mainsail.logoColor).toBe('#123456')
        expect(printer.webcams).toHaveLength(1)
        expect(printer.data.heater_bed).toEqual({ temperature: 20, target: 0 })
    })

    it('subscribes only to the objects the farm needs', async () => {
        const { store } = await createStore()
        await registerPrinter(store)

        const subscribe = lastSocket().sent.find((message) => message.method === 'printer.objects.subscribe')
        expect(Object.keys(subscribe?.params.objects as object)).toEqual([
            'webhooks',
            'print_stats',
            'extruder',
            'extruder1',
            'heater_bed',
        ])
    })

    it('does not subscribe while Klipper is starting', async () => {
        FakeWebSocket.responders['server.info'] = () => ({ klippy_connected: true, klippy_state: 'startup' })
        const { store } = await createStore()
        await registerPrinter(store)

        expect(lastSocket().methods()).not.toContain('printer.objects.list')

        lastSocket().receive({ jsonrpc: '2.0', method: 'notify_klippy_ready' })
        await flush()

        expect(printerState(store).klippyState).toBe('ready')
        expect(lastSocket().methods()).toContain('printer.objects.subscribe')
    })

    it('uses the defaults without a mainsail namespace', async () => {
        FakeWebSocket.responders['server.database.get_item'] = () => {
            throw { code: -32601, message: 'Namespace not found' }
        }
        const { store } = await createStore()
        await registerPrinter(store)

        expect(printerState(store).mainsail.printername).toBe('')
        expect(printerState(store).themeFiles).toEqual(['.theme/sidebar-logo.png'])
    })

    it('does not duplicate theme files on Klipper reconnects', async () => {
        const { store } = await createStore()
        await registerPrinter(store)

        lastSocket().open()
        await flush()

        expect(printerState(store).themeFiles).toEqual(['.theme/sidebar-logo.png'])
    })

    it('handles Klipper notifications', async () => {
        const { store } = await createStore()
        await registerPrinter(store)

        lastSocket().receive({ jsonrpc: '2.0', method: 'notify_klippy_shutdown' })
        expect(printerState(store).klippyState).toBe('shutdown')

        lastSocket().receive({ jsonrpc: '2.0', method: 'notify_klippy_disconnected' })
        expect(printerState(store).klippyState).toBe('disconnected')
        expect(printerState(store).data).toEqual({})
    })

    it('loads the metadata only when the filename changes', async () => {
        const { store } = await createStore()
        await registerPrinter(store)

        const status = (params: object) => ({ jsonrpc: '2.0', method: 'notify_status_update', params: [params, 1] })
        lastSocket().receive(status({ print_stats: { filename: 'a.gcode', state: 'printing' } }))
        await flush()
        lastSocket().receive(status({ print_stats: { print_duration: 10 } }))
        await flush()

        const metadataRequests = lastSocket().sent.filter((message) => message.method === 'server.files.metadata')
        expect(metadataRequests.map((message) => message.params.filename)).toEqual(['a.gcode'])
        expect(printerState(store).currentFile?.filename).toBe('a.gcode')
        expect(printerState(store).currentFile?.filament_total).toBe(1000)

        lastSocket().receive(status({ print_stats: { filename: '' } }))
        await flush()
        expect(printerState(store).currentFile).toBeNull()
    })

    it('ignores metadata of a file that is no longer printed', async () => {
        const { store } = await createStore()
        await registerPrinter(store)

        const status = (params: object) => ({ jsonrpc: '2.0', method: 'notify_status_update', params: [params, 1] })
        lastSocket().receive(status({ print_stats: { filename: 'a.gcode' } }))
        lastSocket().receive(status({ print_stats: { filename: 'b.gcode' } }))
        await flush()

        expect(printerState(store).currentFile?.filename).toBe('b.gcode')
    })

    it('reconnects with the new address after an update', async () => {
        const { store } = await createStore()
        await registerPrinter(store)
        const oldSocket = lastSocket()

        await store.dispatch('farm/updatePrinter', { id: 'p1', hostname: 'other.local', port: 7130, path: '/x' })

        expect(lastSocket()).not.toBe(oldSocket)
        expect(lastSocket().url).toBe('ws://other.local:7130/x/websocket')
        expect(oldSocket.onclose).toBeNull()
        expect(printerState(store).socket.isConnecting).toBe(true)
    })

    it('closes the connection when the printer is unregistered', async () => {
        const { store } = await createStore()
        await registerPrinter(store)
        const socket = lastSocket()

        await store.dispatch('farm/unregisterPrinter', 'p1')

        expect(socket.readyState).toBe(3)
        expect(printerState(store)).toBeUndefined()
    })

    it('persists the settings', async () => {
        const { store, updateSettings } = await createStore()
        await registerPrinter(store)

        await store.dispatch('farm/p1/saveSettings', { currentCamName: 'cam' })

        expect(printerState(store).settings).toEqual({ currentCamName: 'cam' })
        expect(updateSettings).toHaveBeenCalledWith(expect.anything(), {
            id: 'p1',
            settings: { currentCamName: 'cam' },
        })
    })
})
