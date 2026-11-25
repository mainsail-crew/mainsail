import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getters } from '@/store/farm/printer/getters'
import type { FarmPrinterState } from '@/store/farm/printer/types'
import type { RootState } from '@/store/types'

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }

const createState = (overrides: DeepPartial<FarmPrinterState> = {}): FarmPrinterState => {
    const state: FarmPrinterState = {
        id: 'printer-1',
        socket: {
            hostname: 'printer.local',
            port: 7125,
            path: '',
            protocol: 'ws',
            isConnected: true,
            isConnecting: false,
        },
        klippyState: 'ready',
        data: {},
        currentFile: null,
        themeFiles: [],
        mainsail: {
            printername: '',
            logoColor: '#D51F26',
            calcPrintProgress: 'file-relative',
            calcEtaTime: ['file', 'filament', 'slicer'],
        },
        webcams: [],
        settings: {},
    }

    return {
        ...state,
        ...overrides,
        socket: { ...state.socket, ...overrides.socket },
        mainsail: { ...state.mainsail, ...overrides.mainsail },
    } as FarmPrinterState
}

/** Resolves getters lazily, like Vuex does, so getters can depend on each other. */
const createGetters = (state: FarmPrinterState, rootState = {} as RootState) => {
    const resolved: Record<string, unknown> = {}
    Object.keys(getters).forEach((name) => {
        Object.defineProperty(resolved, name, {
            get: () => getters[name](state, resolved, rootState, {}),
        })
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return resolved as Record<string, any>
}

const printingFile = (overrides: Partial<NonNullable<FarmPrinterState['currentFile']>> = {}) => ({
    filename: 'dir/benchy.gcode',
    thumbnails: [],
    gcode_start_byte: 100,
    gcode_end_byte: 1100,
    filament_total: 1000,
    estimated_time: 3600,
    ...overrides,
})

describe('farm/printer getters: urls', () => {
    it('builds the base url and normalizes the path', () => {
        expect(createGetters(createState()).baseUrl).toBe('//printer.local:7125')
        expect(createGetters(createState({ socket: { path: '/sub/path/' } })).baseUrl).toBe(
            '//printer.local:7125/sub/path'
        )
        expect(createGetters(createState({ socket: { path: '///' } })).baseUrl).toBe('//printer.local:7125')
    })

    it('builds the socket url with the protocol', () => {
        const state = createState({ socket: { protocol: 'wss', path: 'moonraker' } })
        expect(createGetters(state).socketUrl).toBe('wss://printer.local:7125/moonraker/websocket')
    })

    it('builds the thumbnail url relative to the gcode directory', () => {
        const state = createState({
            currentFile: printingFile({
                thumbnails: [
                    { width: 32, height: 32, size: 1, relative_path: '.thumbs/small.png' },
                    { width: 300, height: 300, size: 1, relative_path: '.thumbs/big.png' },
                ],
            }),
        })

        expect(createGetters(state).thumbnailUrl).toBe('//printer.local:7125/server/files/gcodes/dir/.thumbs/big.png')
    })

    it('returns no thumbnail url without a big thumbnail', () => {
        const state = createState({
            currentFile: printingFile({ thumbnails: [{ width: 32, height: 32, size: 1, relative_path: 'a.png' }] }),
        })

        expect(createGetters(state).thumbnailUrl).toBeNull()
        expect(createGetters(createState()).thumbnailUrl).toBeNull()
    })

    it('finds the logo in the theme files', () => {
        const state = createState({ themeFiles: ['.theme/sidebar-logo.svg.bak', '.theme/sidebar-logo.svg'] })
        expect(createGetters(state).logoUrl).toBe('//printer.local:7125/server/files/config/.theme/sidebar-logo.svg')
        expect(createGetters(createState({ themeFiles: ['.theme/other.png'] })).logoUrl).toBeNull()
    })
})

describe('farm/printer getters: printerName', () => {
    it('prefers the printer name from the Mainsail settings', () => {
        expect(createGetters(createState({ mainsail: { printername: 'Voron' } })).printerName).toBe('Voron')
    })

    it('falls back to the address and hides port 80', () => {
        expect(createGetters(createState({ socket: { path: '/x' } })).printerName).toBe('printer.local:7125/x')
        expect(createGetters(createState({ socket: { port: 80 } })).printerName).toBe('printer.local')
    })
})

describe('farm/printer getters: statusText', () => {
    it('shows the connection state', () => {
        const connecting = createState({ socket: { isConnected: false, isConnecting: true } })
        const disconnected = createState({ socket: { isConnected: false, isConnecting: false } })

        expect(createGetters(connecting).statusText).toBe('Connecting...')
        expect(createGetters(disconnected).statusText).toBe('Disconnected')
    })

    it('shows the Klipper state', () => {
        expect(createGetters(createState({ klippyState: 'disconnected' })).statusText).toBe('ERROR')
        expect(createGetters(createState({ klippyState: 'error' })).statusText).toBe('ERROR')
        expect(createGetters(createState({ klippyState: 'shutdown' })).statusText).toBe('Shutdown')
        expect(createGetters(createState()).statusText).toBe('Unknown')
    })

    it('shows the print state', () => {
        expect(createGetters(createState({ data: { print_stats: { state: 'standby' } } })).statusText).toBe('Standby')

        const printing = createState({
            data: { print_stats: { state: 'printing' }, virtual_sdcard: { progress: 0.427 } },
        })
        expect(createGetters(printing).statusText).toBe('42% Printing')
    })
})

describe('farm/printer getters: progress', () => {
    const createPrintingState = (calcPrintProgress: FarmPrinterState['mainsail']['calcPrintProgress']) =>
        createState({
            mainsail: { calcPrintProgress },
            currentFile: printingFile(),
            data: {
                print_stats: { state: 'printing', filename: 'dir/benchy.gcode', filament_used: 250 },
                virtual_sdcard: { progress: 0.5, file_position: 600 },
                display_status: { progress: 0.3 },
            },
        })

    it('calculates the progress between the first and last gcode byte', () => {
        expect(createGetters(createPrintingState('file-relative')).progress).toBe(0.5)

        const atStart = createPrintingState('file-relative')
        atStart.data.virtual_sdcard = { progress: 0.1, file_position: 50 }
        expect(createGetters(atStart).progress).toBe(0)

        const atEnd = createPrintingState('file-relative')
        atEnd.data.virtual_sdcard = { progress: 0.99, file_position: 1200 }
        expect(createGetters(atEnd).progress).toBe(1)
    })

    it('falls back to the absolute progress for another file', () => {
        const state = createPrintingState('file-relative')
        state.currentFile = printingFile({ filename: 'other.gcode' })
        state.data.virtual_sdcard = { progress: 0.42, file_position: 600 }

        expect(createGetters(state).progress).toBe(0.42)
    })

    it('uses the absolute, slicer or filament progress', () => {
        expect(createGetters(createPrintingState('file-absolute')).progress).toBe(0.5)
        expect(createGetters(createPrintingState('slicer')).progress).toBe(0.3)
        expect(createGetters(createPrintingState('filament')).progress).toBe(0.25)
    })

    it('returns 0 without data', () => {
        expect(createGetters(createState()).progress).toBe(0)
        expect(createGetters(createState({ mainsail: { calcPrintProgress: 'filament' } })).progress).toBe(0)
    })
})

describe('farm/printer getters: eta', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    const createPrintingState = (calcEtaTime: string[] = ['file', 'filament', 'slicer']) =>
        createState({
            mainsail: { calcEtaTime, calcPrintProgress: 'file-absolute' },
            currentFile: printingFile({ filament_total: 1000, estimated_time: 4000 }),
            data: {
                print_stats: {
                    state: 'printing',
                    filename: 'dir/benchy.gcode',
                    print_duration: 1000,
                    filament_used: 200,
                },
                virtual_sdcard: { progress: 0.5 },
            },
        })

    it('calculates the remaining time per estimation', () => {
        const result = createGetters(createPrintingState())

        expect(result.estimatedTimeFile).toBe(1000)
        expect(result.estimatedTimeFilament).toBe(4000)
        expect(result.estimatedTimeSlicer).toBe(3000)
    })

    it('averages the enabled estimations', () => {
        expect(createGetters(createPrintingState()).eta).toBe(Date.now() + 8_000_000 / 3)
        expect(createGetters(createPrintingState(['slicer'])).eta).toBe(Date.now() + 3_000_000)
        expect(createGetters(createPrintingState([])).eta).toBe(0)
    })

    it('returns 0 without a print duration', () => {
        expect(createGetters(createState()).eta).toBe(0)
    })
})

describe('farm/printer getters: temperatures', () => {
    it('lists extruders, bed and chamber', () => {
        const state = createState({
            data: {
                extruder1: { temperature: 200.4, target: 210 },
                extruder: { temperature: 180, target: 0 },
                extruder_stepper: { temperature: 1, target: 1 },
                heater_bed: { temperature: 60, target: 60 },
                'temperature_sensor chamber': { temperature: 35 },
            },
        })

        expect(createGetters(state).temperatures).toEqual([
            { name: 'Extruder', temperature: 180, target: 0 },
            { name: 'Extruder1', temperature: 200.4, target: 210 },
            { name: 'Heater Bed', temperature: 60, target: 60 },
            { name: 'Chamber', temperature: 35, target: null },
        ])
    })

    it('is empty while Klipper is disconnected', () => {
        const state = createState({ klippyState: 'disconnected', data: { heater_bed: { temperature: 1, target: 1 } } })
        expect(createGetters(state).temperatures).toEqual([])
    })
})

describe('farm/printer getters: webcams', () => {
    it('returns only enabled webcams', () => {
        const state = createState()
        state.webcams = [
            { name: 'a', enabled: true },
            { name: 'b', enabled: false },
        ] as FarmPrinterState['webcams']

        expect(createGetters(state).webcams.map((webcam: { name: string }) => webcam.name)).toEqual(['a'])
    })
})
