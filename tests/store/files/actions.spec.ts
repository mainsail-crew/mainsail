import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import axios from 'axios'
import { files, getDefaultState } from '@/store/files'
import { abortUploadQueue } from '@/store/files/helpers'
import type { FileState, FileUploadItem } from '@/store/files/types'
import type { FileDirectoryResponse, FileListChangedNotification } from '@/types/moonraker/FileManagerRPC'

vi.mock('@/plugins/i18n', () => ({
    default: { t: (key: string, values?: Record<string, unknown>) => `${key} ${JSON.stringify(values ?? {})}` },
}))

Vue.use(Vuex)

type Responder = (params: Record<string, unknown>) => unknown

const directoryResponse = (
    dirs: string[] = [],
    filesList: Record<string, unknown>[] = [],
    root = 'gcodes'
): FileDirectoryResponse =>
    ({
        dirs: dirs.map((dirname) => ({ dirname, modified: 1, size: 4096, permissions: 'rw' })),
        files: filesList.map((file) => ({ modified: 1, size: 10, permissions: 'rw', ...file })),
        disk_usage: { total: 100, used: 40, free: 60 },
        root_info: { name: root, permissions: 'rw' },
    }) as FileDirectoryResponse

let responders: Record<string, Responder>
const emitAndWait = vi.fn(async (method: string, params: Record<string, unknown> = {}) => {
    const responder = responders[method]
    if (!responder) throw { code: -32601, message: `Method not found: ${method}` }

    return responder(params)
})
const toast = { success: vi.fn(), error: vi.fn() }
const windowStub = { console: { error: vi.fn(), debug: vi.fn() }, open: vi.fn() }

const createStore = () =>
    new Store({
        modules: {
            files: { ...files, state: getDefaultState() },
            printer: {
                namespaced: true,
                state: { print_stats: { filename: '' }, current_file: {} },
                mutations: {
                    clearCurrentFile: (state) => (state.current_file = {}),
                    setData: (state, payload) => Object.assign(state, payload),
                },
            },
            server: {
                namespaced: true,
                actions: { addRootDirectory: vi.fn() },
            },
            socket: {
                namespaced: true,
                getters: { getUrl: () => 'http://printer' },
                actions: { addLoading: vi.fn(), removeLoading: vi.fn() },
            },
        },
    })

const filesState = (store: Store<unknown>) => (store.state as { files: FileState }).files

const notify = (store: Store<unknown>, payload: Partial<FileListChangedNotification>) =>
    store.dispatch('files/onFilelistChanged', payload)

const item = (root: string, path: string) => ({ root, path, modified: 5, size: 20, permissions: 'rw' as const })

describe('files/actions', () => {
    beforeEach(() => {
        emitAndWait.mockClear()
        toast.success.mockClear()
        toast.error.mockClear()
        Vue.$socket = { emitAndWait } as unknown as typeof Vue.$socket
        Vue.$toast = toast as unknown as typeof Vue.$toast
        vi.stubGlobal('window', windowStub)

        responders = {
            'server.files.get_directory': (params) => {
                switch (params.path) {
                    case 'gcodes':
                        return directoryResponse(
                            ['sub', '.git'],
                            [{ filename: 'a.gcode', estimated_time: 100 }, { filename: 'b.gcode' }]
                        )
                    case 'gcodes/sub':
                        return directoryResponse([], [{ filename: 'c.gcode', estimated_time: 200 }])
                    case 'config':
                        return directoryResponse(['.theme'], [{ filename: 'printer.cfg' }], 'config')
                    case 'config/.theme':
                        return directoryResponse([], [{ filename: 'custom.css' }], 'config')
                    default:
                        throw { code: 400, message: 'Directory does not exist' }
                }
            },
            'server.files.metadata': (params) => ({ filename: params.filename, modified: 5, size: 20, uuid: 'x' }),
        }
    })

    it('loads the config root with the theme and the complete gcodes root on init', async () => {
        const store = createStore()

        await store.dispatch('files/init', ['gcodes', 'config', 'logs'])
        await vi.waitFor(() => expect(filesState(store).directories['gcodes/sub']).toBeDefined())

        const state = filesState(store)
        expect(Object.keys(state.directories).sort()).toEqual(['config', 'config/.theme', 'gcodes', 'gcodes/sub'])
        expect(Object.keys(state.directories.gcodes.dirs)).toEqual(['sub'])
        expect(Object.keys(state.metadata).sort()).toEqual(['a.gcode', 'sub/c.gcode'])
        expect(state.metadata['sub/c.gcode'].estimated_time).toBe(200)
        expect(state.roots).toEqual({ gcodes: 'rw', config: 'rw' })
        expect(emitAndWait).toHaveBeenCalledWith('server.files.get_directory', { path: 'gcodes', extended: true })
        expect(emitAndWait).toHaveBeenCalledWith('server.files.get_directory', { path: 'config', extended: false })
    })

    it('removes directories and metadata that do not exist anymore on reload', async () => {
        const store = createStore()
        await store.dispatch('files/loadDirectoryTree', 'gcodes')

        responders['server.files.get_directory'] = () => directoryResponse([], [{ filename: 'b.gcode' }])
        await store.dispatch('files/loadDirectory', 'gcodes')

        const state = filesState(store)
        expect(Object.keys(state.directories)).toEqual(['gcodes'])
        expect(state.metadata).toEqual({})
    })

    it('returns null and removes a directory that cannot be loaded', async () => {
        const store = createStore()
        responders['server.files.get_directory'] = () => directoryResponse()
        await store.dispatch('files/loadDirectory', 'missing')
        responders['server.files.get_directory'] = () => {
            throw { code: 400, message: 'Directory does not exist' }
        }

        await expect(store.dispatch('files/loadDirectory', 'missing')).resolves.toBeNull()
        expect(windowStub.console.error).toHaveBeenCalled()
        expect(filesState(store).directories).toEqual({})
    })

    it('does not handle errors while storing a loaded directory', async () => {
        const store = createStore()
        await store.dispatch('files/loadDirectory', 'gcodes')
        responders['server.files.get_directory'] = () => ({})

        await expect(store.dispatch('files/loadDirectory', 'gcodes')).rejects.toThrow(TypeError)
        expect(filesState(store).directories.gcodes).toBeDefined()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('onFilelistChanged', () => {
        it('adds a created gcode file and loads its metadata', async () => {
            const store = createStore()
            await store.dispatch('files/loadDirectoryTree', 'gcodes')

            await notify(store, { action: 'create_file', item: item('gcodes', 'sub/new.gcode') })

            const state = filesState(store)
            expect(state.directories['gcodes/sub'].files['new.gcode']).toEqual({
                name: 'new.gcode',
                modified: 5,
                size: 20,
                permissions: 'rw',
            })
            expect(state.metadata['sub/new.gcode'].uuid).toBe('x')
        })

        it('ignores files in directories that are not loaded', async () => {
            const store = createStore()

            await notify(store, { action: 'create_file', item: item('config', 'printer.cfg') })

            expect(filesState(store).directories).toEqual({})
            expect(emitAndWait).not.toHaveBeenCalled()
        })

        it('deletes a file with its metadata', async () => {
            const store = createStore()
            await store.dispatch('files/loadDirectoryTree', 'gcodes')

            await notify(store, { action: 'delete_file', item: item('gcodes', 'a.gcode') })

            const state = filesState(store)
            expect(state.directories.gcodes.files['a.gcode']).toBeUndefined()
            expect(state.metadata['a.gcode']).toBeUndefined()
        })

        it('moves a file and loads the metadata again', async () => {
            const store = createStore()
            await store.dispatch('files/loadDirectoryTree', 'gcodes')

            await notify(store, {
                action: 'move_file',
                item: item('gcodes', 'sub/a.gcode'),
                source_item: { root: 'gcodes', path: 'a.gcode' },
            })

            const state = filesState(store)
            expect(state.directories.gcodes.files['a.gcode']).toBeUndefined()
            expect(state.directories['gcodes/sub'].files['a.gcode']).toBeDefined()
            expect(state.metadata['a.gcode']).toBeUndefined()
            expect(state.metadata['sub/a.gcode']).toBeDefined()
        })

        it('deletes a directory with its subdirectories and metadata', async () => {
            const store = createStore()
            await store.dispatch('files/loadDirectoryTree', 'gcodes')

            await notify(store, { action: 'delete_dir', item: item('gcodes', 'sub') })

            const state = filesState(store)
            expect(Object.keys(state.directories)).toEqual(['gcodes'])
            expect(state.directories.gcodes.dirs).toEqual({})
            expect(Object.keys(state.metadata)).toEqual(['a.gcode'])
        })

        it('moves a directory with its subdirectories and metadata', async () => {
            const store = createStore()
            await store.dispatch('files/loadDirectoryTree', 'gcodes')
            emitAndWait.mockClear()

            await notify(store, {
                action: 'move_dir',
                item: item('gcodes', 'renamed'),
                source_item: { root: 'gcodes', path: 'sub' },
            })

            const state = filesState(store)
            expect(Object.keys(state.directories).sort()).toEqual(['gcodes', 'gcodes/renamed'])
            expect(Object.keys(state.directories.gcodes.dirs)).toEqual(['renamed'])
            expect(state.metadata['renamed/c.gcode'].filename).toBe('renamed/c.gcode')
            expect(emitAndWait).not.toHaveBeenCalled()
        })

        it('loads a created directory in the gcodes root', async () => {
            const store = createStore()
            await store.dispatch('files/loadDirectory', 'gcodes')

            await notify(store, { action: 'create_dir', item: item('gcodes', 'sub') })

            expect(filesState(store).directories['gcodes/sub']).toBeDefined()
        })

        it('loads the theme directory when it is created', async () => {
            const store = createStore()
            await store.dispatch('files/loadDirectory', 'config')

            await notify(store, { action: 'create_dir', item: item('config', '.theme') })

            expect(Object.keys(filesState(store).directories['config/.theme'].files)).toEqual(['custom.css'])
        })

        it('reloads a root after a root update', async () => {
            const store = createStore()
            await store.dispatch('files/loadDirectoryTree', 'gcodes')
            responders['server.files.get_directory'] = () => directoryResponse([], [])

            await notify(store, { action: 'root_update', item: item('gcodes', '') })

            const state = filesState(store)
            expect(Object.keys(state.directories)).toEqual(['gcodes'])
            expect(state.metadata).toEqual({})
        })
    })

    it('updates the current print file when its metadata is loaded', async () => {
        const store = createStore()
        ;(store.state as unknown as { printer: { print_stats: { filename: string } } }).printer.print_stats.filename =
            'a.gcode'

        await store.dispatch('files/fetchMetadata', 'a.gcode')

        expect((store.state as unknown as { printer: { current_file: unknown } }).printer.current_file).toEqual({
            filename: 'a.gcode',
            modified: 5,
            size: 20,
            uuid: 'x',
        })
    })

    it('shows a rename toast when moving inside the same directory', async () => {
        const store = createStore()
        responders['server.files.move'] = () => ({})

        await expect(store.dispatch('files/move', { source: '/gcodes/a.gcode', dest: 'gcodes/b.gcode' })).resolves.toBe(
            true
        )

        expect(emitAndWait).toHaveBeenCalledWith('server.files.move', {
            source: 'gcodes/a.gcode',
            dest: 'gcodes/b.gcode',
        })
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Files.SuccessfullyRenamed'))
    })

    it('shows the error message if a request fails', async () => {
        const store = createStore()

        await expect(store.dispatch('files/deleteFile', { path: 'gcodes/a.gcode' })).resolves.toBe(false)

        expect(toast.error).toHaveBeenCalledWith('Method not found: server.files.delete_file')
    })

    it('rolls over logs and shows the results', async () => {
        const store = createStore()
        responders['server.logs.rollover'] = (params) =>
            params.application === 'klipper'
                ? { rolled_over: ['klipper'], failed: {} }
                : { rolled_over: [], failed: { moonraker: 'error' } }

        await store.dispatch('files/rolloverLogs', ['klipper', 'moonraker'])

        expect(emitAndWait).toHaveBeenCalledWith('server.logs.rollover', { application: 'klipper' })
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('RolloverToastSuccessful'))
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('RolloverToastFailed'))
    })

    it('downloads a zip archive', async () => {
        const store = createStore()
        responders['server.files.zip'] = () => ({
            destination: { root: 'config', path: 'my files.zip', modified: 1, size: 1, permissions: 'rw' },
            action: 'zip_files',
        })

        await store.dispatch('files/downloadZip', { items: ['/gcodes/sub'], dest: 'config/my files.zip' })

        expect(emitAndWait).toHaveBeenCalledWith('server.files.zip', {
            items: ['gcodes/sub'],
            dest: 'config/my files.zip',
        })
        expect(windowStub.open).toHaveBeenCalledWith('http://printer/server/files/config/my%20files.zip')
    })

    describe('openDirectory and reloadDirectory', () => {
        it('loads a directory outside of the gcodes root every time it is opened', async () => {
            const store = createStore()

            await store.dispatch('files/openDirectory', '/config/')
            await store.dispatch('files/openDirectory', 'config')

            const requests = emitAndWait.mock.calls.filter(([method]) => method === 'server.files.get_directory')
            expect(requests).toHaveLength(2)
            expect(filesState(store).directories.config).toBeDefined()
        })

        it('only loads missing directories of the gcodes root, because it is kept up to date', async () => {
            const store = createStore()
            await store.dispatch('files/loadDirectoryTree', 'gcodes')
            emitAndWait.mockClear()

            await store.dispatch('files/openDirectory', 'gcodes/sub')

            expect(emitAndWait).not.toHaveBeenCalled()
        })

        it('reloads directories of the gcodes root with their subdirectories', async () => {
            const store = createStore()

            await store.dispatch('files/reloadDirectory', 'gcodes')

            expect(Object.keys(filesState(store).directories).sort()).toEqual(['gcodes', 'gcodes/sub'])
        })
    })

    describe('createFile', () => {
        afterEach(() => {
            vi.restoreAllMocks()
        })

        it('uploads an empty file into the directory', async () => {
            const store = createStore()
            const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} })

            await expect(store.dispatch('files/createFile', 'config/sub/new.cfg')).resolves.toBe(true)

            const [url, data] = post.mock.calls[0]
            const formData = data as FormData
            expect(url).toBe('http://printer/server/files/upload')
            expect((formData.get('file') as File).name).toBe('new.cfg')
            expect((formData.get('file') as File).size).toBe(0)
            expect(formData.get('root')).toBe('config')
            expect(formData.get('path')).toBe('sub')
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Files.SuccessfullyCreated'))
        })

        it('shows the error and returns false if the file cannot be created', async () => {
            const store = createStore()
            vi.spyOn(axios, 'post').mockRejectedValue(new Error('Request failed'))

            await expect(store.dispatch('files/createFile', 'config/new.cfg')).resolves.toBe(false)

            expect(toast.error).toHaveBeenCalledWith('Request failed')
        })
    })

    describe('uploadFiles', () => {
        type PendingUpload = { name: string; resolve: () => void; signal: AbortSignal }
        let pending: PendingUpload[]

        const upload = (name: string, root: FileUploadItem['root'] = 'gcodes'): FileUploadItem => ({
            file: new File(['x'], name),
            root,
            path: '',
        })

        // resolves the oldest pending upload and waits until the next one has started (if any)
        const finishNext = async () => {
            pending.shift()?.resolve()
            await new Promise((resolve) => setTimeout(resolve, 0))
        }

        const trackLoadings = (store: Store<unknown>) => {
            const loadings: string[] = []
            store.subscribeAction((action) => {
                if (action.type === 'socket/addLoading') loadings.push(`+${action.payload.name}`)
                if (action.type === 'socket/removeLoading') loadings.push(`-${action.payload.name}`)
            })

            return loadings
        }

        beforeEach(() => {
            pending = []
            vi.spyOn(axios, 'post').mockImplementation((_url, data, config) => {
                const name = ((data as FormData).get('file') as File).name
                const signal = config?.signal as AbortSignal

                return new Promise((resolve, reject) => {
                    signal.addEventListener('abort', () => reject(new axios.Cancel('aborted')))
                    pending.push({ name, signal, resolve: () => resolve({ data: { item: { path: name } } }) })
                })
            })
        })

        afterEach(() => {
            // a failed test must not leave a running upload behind for the next tests
            abortUploadQueue()
            vi.restoreAllMocks()
        })

        it('appends files to a running upload instead of cancelling it', async () => {
            const store = createStore()
            const loadings = trackLoadings(store)

            const first = store.dispatch('files/uploadFiles', {
                files: [upload('a.gcode'), upload('b.gcode')],
                loading: 'gcodeUpload',
            })
            await vi.waitFor(() => expect(pending.map((entry) => entry.name)).toEqual(['a.gcode']))

            const second = store.dispatch('files/uploadFiles', {
                files: [upload('printer.cfg', 'config')],
                loading: 'configFileUpload',
            })
            await vi.waitFor(() => expect(filesState(store).upload.maxNumber).toBe(3))
            expect(pending[0].signal.aborted).toBe(false)

            await finishNext()
            expect(filesState(store).upload).toMatchObject({ currentNumber: 2, filename: 'b.gcode' })
            await finishNext()
            expect(filesState(store).upload).toMatchObject({ currentNumber: 3, filename: 'printer.cfg' })
            await finishNext()
            await Promise.all([first, second])

            expect(toast.success).toHaveBeenCalledTimes(3)
            expect(filesState(store).upload).toEqual(getDefaultState().upload)
            expect(loadings.sort()).toEqual(['+configFileUpload', '+gcodeUpload', '-configFileUpload', '-gcodeUpload'])
        })

        it('cancels the running upload with all appended files', async () => {
            const store = createStore()
            const loadings = trackLoadings(store)

            const first = store.dispatch('files/uploadFiles', { files: [upload('a.gcode')], loading: 'gcodeUpload' })
            await vi.waitFor(() => expect(pending).toHaveLength(1))
            const second = store.dispatch('files/uploadFiles', { files: [upload('b.gcode')], loading: 'gcodeUpload' })
            await vi.waitFor(() => expect(filesState(store).upload.maxNumber).toBe(2))

            await store.dispatch('files/cancelUpload')
            await Promise.all([first, second])

            expect(axios.post).toHaveBeenCalledTimes(1)
            expect(toast.success).not.toHaveBeenCalled()
            expect(toast.error).not.toHaveBeenCalled()
            expect(filesState(store).upload).toEqual(getDefaultState().upload)
            expect(loadings).toEqual(['+gcodeUpload', '+gcodeUpload', '-gcodeUpload', '-gcodeUpload'])
        })

        it('starts a new upload after a cancel without being reset by the cancelled one', async () => {
            const store = createStore()

            const cancelled = store.dispatch('files/uploadFiles', { files: [upload('a.gcode')] })
            await vi.waitFor(() => expect(pending).toHaveLength(1))
            await store.dispatch('files/cancelUpload')

            const next = store.dispatch('files/uploadFiles', { files: [upload('b.gcode')] })
            await cancelled
            await vi.waitFor(() => expect(pending.map((entry) => entry.name)).toEqual(['a.gcode', 'b.gcode']))
            expect(filesState(store).upload).toMatchObject({ show: true, filename: 'b.gcode', maxNumber: 1 })

            pending.shift()
            await finishNext()
            await next

            expect(toast.success).toHaveBeenCalledTimes(1)
            expect(filesState(store).upload).toEqual(getDefaultState().upload)
        })
    })
})
