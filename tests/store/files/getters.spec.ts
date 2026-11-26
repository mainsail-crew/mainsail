import { describe, expect, it, vi } from 'vitest'
import { getters } from '@/store/files/getters'
import { mutations } from '@/store/files/mutations'
import { getDefaultState } from '@/store/files'
import type { FileState, FileStateEntry } from '@/store/files/types'
import type { ServerHistoryStateJob } from '@/store/server/history/types'
import type { RootState } from '@/store/types'

const entry = (name: string, overrides: Partial<FileStateEntry> = {}): FileStateEntry => ({
    name,
    modified: 1000,
    size: 10,
    permissions: 'rw',
    ...overrides,
})

const createState = (): FileState => {
    const state = getDefaultState()
    state.roots = { gcodes: 'rw', config: 'rw' }

    mutations.setDirectory(state, {
        path: 'gcodes',
        directory: {
            dirs: { sub: entry('sub', { permissions: 'r' }) },
            files: { 'a.gcode': entry('a.gcode'), 'notes.txt': entry('notes.txt') },
            disk_usage: { total: 100, used: 40, free: 60 },
        },
    })
    mutations.setDirectory(state, {
        path: 'gcodes/sub',
        directory: { dirs: {}, files: { 'b.gcode': entry('b.gcode', { modified: 2000 }) }, disk_usage: null },
    })
    mutations.setDirectory(state, {
        path: 'config',
        directory: {
            dirs: { '.theme': entry('.theme') },
            files: { 'printer.cfg': entry('printer.cfg') },
            disk_usage: null,
        },
    })
    mutations.setDirectory(state, {
        path: 'config/.theme',
        directory: { dirs: {}, files: { 'sidebar-logo.png': entry('sidebar-logo.png') }, disk_usage: null },
    })
    mutations.setMetadata(state, [
        {
            filename: 'a.gcode',
            modified: 1000,
            size: 10,
            uuid: 'uuid-a',
            first_layer_extr_temp: 215,
            first_layer_bed_temp: 60,
            thumbnails: [],
        },
    ])

    return state
}

const createGetters = (state: FileState, jobs: ServerHistoryStateJob[] = []) => {
    const rootState = { printer: { gcode: { commands: { M104: {}, M140: {} } } } } as unknown as RootState
    const getPrintJobs = vi.fn((filename: string, modified: number, size: number, uuid: string | null) =>
        jobs.filter((job) => job.metadata.uuid === uuid)
    )
    const rootGetters = {
        'socket/getUrl': 'http://printer',
        'server/history/getPrintJobsForGcodes': getPrintJobs,
    }

    const resolved: Record<string, unknown> = {}
    Object.keys(getters).forEach((name) => {
        Object.defineProperty(resolved, name, {
            get: () => getters[name](state, resolved, rootState, rootGetters),
        })
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { getters: resolved as Record<string, any>, getPrintJobs }
}

const job = (overrides: Partial<ServerHistoryStateJob>): ServerHistoryStateJob =>
    ({
        job_id: '1',
        exists: true,
        end_time: 200,
        filament_used: 100,
        filename: 'a.gcode',
        metadata: { uuid: 'uuid-a' },
        print_duration: 50,
        status: 'completed',
        start_time: 100,
        total_duration: 60,
        ...overrides,
    }) as ServerHistoryStateJob

describe('files/getters', () => {
    it('returns a directory listing with permissions and disk usage', () => {
        const { getters } = createGetters(createState())

        const listing = getters.getDirectory('/gcodes/')
        expect(listing.path).toBe('gcodes')
        expect(listing.permissions).toBe('rw')
        expect(listing.disk_usage).toEqual({ total: 100, used: 40, free: 60 })
        expect(listing.items.map((item: { filename: string }) => item.filename)).toEqual([
            'sub',
            'a.gcode',
            'notes.txt',
        ])
        expect(listing.items[0].isDirectory).toBe(true)
        expect(listing.items[1].modified).toEqual(new Date(1000 * 1000))
    })

    it('uses the permissions of the parent entry for subdirectories', () => {
        const { getters } = createGetters(createState())

        expect(getters.getDirectory('gcodes/sub').permissions).toBe('r')
    })

    it('returns null for directories that are not loaded', () => {
        const { getters } = createGetters(createState())

        expect(getters.getDirectory('logs')).toBeNull()
        expect(getters.isDirectoryLoaded('logs')).toBe(false)
        expect(getters.isDirectoryLoaded('/gcodes/sub')).toBe(true)
    })

    it('returns a single file', () => {
        const { getters } = createGetters(createState())

        expect(getters.getFile('config/printer.cfg')?.filename).toBe('printer.cfg')
        expect(getters.getFile('config/missing.cfg')).toBeNull()
    })

    it('returns directories and gcode files of a gcodes directory', () => {
        const { getters } = createGetters(createState())

        const files = getters.getGcodeFiles('')
        expect(files.map((file: { filename: string }) => file.filename)).toEqual(['sub', 'a.gcode'])

        const subFiles = getters.getGcodeFiles('/sub')
        expect(subFiles[0].filename).toBe('b.gcode')
        expect(subFiles[0].full_filename).toBe('sub/b.gcode')
        expect(subFiles[0].hasMetadata).toBe(false)
    })

    it('merges metadata, preheat gcode and print history', () => {
        const jobs = [
            job({ job_id: '1', status: 'cancelled', start_time: 300 }),
            job({ job_id: '2', status: 'completed', start_time: 100, end_time: 200 }),
        ]
        const { getters } = createGetters(createState(), jobs)

        const file = getters.getGcodeFile('a.gcode')
        expect(file.hasMetadata).toBe(true)
        expect(file.uuid).toBe('uuid-a')
        expect(file.preheat_gcode).toBe('M104 S215\nM140 S60')
        expect(file.last_status).toBe('cancelled')
        expect(file.count_printed).toBe(1)
        expect(file.last_start_time).toEqual(new Date(100 * 1000))
        expect(file.last_end_time).toEqual(new Date(200 * 1000))
    })

    it('returns all gcode files with their path as filename', () => {
        const { getters } = createGetters(createState())

        const files = getters.getAllGcodes.map((file: { filename: string }) => file.filename)
        expect(files.sort()).toEqual(['a.gcode', 'sub/b.gcode'])
    })

    it('returns theme file urls', () => {
        const { getters } = createGetters(createState())

        expect(getters.getSidebarLogo).toBe(
            'http://printer/server/files/config/.theme/sidebar-logo.png?timestamp=1000000'
        )
        expect(getters.getCustomStylesheet).toBeNull()
    })

    it('checks if a file exists in the config root', () => {
        const { getters } = createGetters(createState())

        expect(getters.checkConfigFile('printer.cfg')).toBe(true)
        expect(getters.checkConfigFile('mainsail.cfg')).toBe(false)
    })
})
