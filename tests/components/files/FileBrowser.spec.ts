// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import vuetify from '@/plugins/vuetify'
import i18n from '@/plugins/i18n'
import '@/directives/longpress'
import FileBrowser from '@/components/files/FileBrowser.vue'
import { files, getDefaultState } from '@/store/files'
import type { FileStateFile } from '@/store/files/types'

Vue.use(Vuex)

const tick = async () => {
    await Vue.nextTick()
    await Vue.nextTick()
}

describe('FileBrowser', () => {
    let store: Store<unknown>
    let vm: Vue
    let opened: string[]
    let moved: unknown[]
    let zipped: unknown[]
    let errors: unknown[]
    let events: { name: string; payload: unknown }[]
    let moveResult: boolean

    const createStore = (registeredDirectories: string[]) => {
        const store = new Store({
            modules: {
                files: {
                    ...files,
                    state: getDefaultState(),
                    actions: {
                        ...files.actions,
                        openDirectory: (_, path: string) => opened.push(path),
                        move: (_, payload: unknown) => {
                            moved.push(payload)
                            return moveResult
                        },
                        downloadZip: (_, payload: unknown) => zipped.push(payload),
                    },
                },
                server: { namespaced: true, state: { registered_directories: registeredDirectories } },
                socket: { namespaced: true, state: { loadings: [] }, getters: { getUrl: () => 'http://printer' } },
                gui: {
                    namespaced: true,
                    state: { uiSettings: {}, general: { dateFormat: null, timeFormat: null } },
                    getters: { getPanelExpand: () => () => true },
                },
                printer: { namespaced: true, state: {} },
            },
        })

        store.commit('files/setRootPermissions', { root: 'config', permissions: 'rw' })
        store.commit('files/setDirectory', {
            path: 'config/sub',
            directory: {
                dirs: { dir: { name: 'dir', modified: 1, size: 4096, permissions: 'rw' } },
                files: { 'printer.cfg': { name: 'printer.cfg', modified: 1, size: 10, permissions: 'rw' } },
                disk_usage: { total: 100, used: 40, free: 60 },
            },
        })

        return store
    }

    const mount = (registeredDirectories = ['config'], props: Record<string, unknown> = {}) => {
        store = createStore(registeredDirectories)
        const items: FileStateFile[] = store.getters['files/getDirectory']('config/sub')?.items ?? []
        const record = (name: string) => (payload: unknown) => events.push({ name, payload })

        vm = new Vue({
            store,
            vuetify,
            i18n,
            render: (h) =>
                h('v-app', [
                    h(
                        FileBrowser,
                        {
                            props: { root: 'config', path: '/sub', items, ...props },
                            on: {
                                'update:path': record('update:path'),
                                'update:selected': record('update:selected'),
                                'click:file': record('click:file'),
                            },
                        },
                        [h('div', { slot: 'root-missing', class: 'root-missing' }, 'missing')]
                    ),
                ]),
        }).$mount(document.body.appendChild(document.createElement('div')))
    }

    const rows = () => [...vm.$el.querySelectorAll('tbody tr')] as HTMLElement[]
    const rowByName = (name: string) => rows().find((row) => row.textContent?.includes(name)) as HTMLElement

    beforeEach(() => {
        opened = []
        moved = []
        zipped = []
        errors = []
        events = []
        moveResult = true
        Vue.config.errorHandler = (error) => errors.push(error)
    })

    afterEach(() => {
        vm.$destroy()
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })

    it('loads and shows the current directory', async () => {
        mount()
        await tick()

        expect(opened).toEqual(['config/sub'])
        expect(rows()).toHaveLength(3)
        expect(rows()[0].textContent).toContain('..')
        expect(rowByName('printer.cfg')).toBeDefined()
        expect(vm.$el.textContent).toContain('Files.FreeDisk')
        expect(errors).toEqual([])
    })

    it('navigates into directories and emits clicked files', async () => {
        mount()
        await tick()

        rowByName('dir').click()
        rowByName('printer.cfg').click()
        rows()[0].click()

        expect(events).toEqual([
            { name: 'update:selected', payload: [] },
            { name: 'update:path', payload: 'sub/dir' },
            { name: 'click:file', payload: expect.objectContaining({ filename: 'printer.cfg' }) },
            { name: 'update:selected', payload: [] },
            { name: 'update:path', payload: '' },
        ])
    })

    it('shows the file actions in the context menu', async () => {
        mount()
        await tick()

        rowByName('printer.cfg').dispatchEvent(new MouseEvent('contextmenu', { clientX: 10, clientY: 10 }))
        await tick()

        const menu = document.body.querySelector('.v-menu__content')?.textContent ?? ''
        expect(menu).toContain('Files.Download')
        expect(menu).toContain('Files.Rename')
        expect(menu).toContain('Files.Duplicate')
        expect(menu).toContain('Files.Delete')
        expect(errors).toEqual([])
    })

    it('moves a dropped file into a directory', async () => {
        mount()
        await tick()

        const dataTransfer = { getData: () => 'printer.cfg' }
        const drop = new Event('drop', { bubbles: true, cancelable: true })
        Object.defineProperty(drop, 'dataTransfer', { value: dataTransfer })
        rowByName('dir').dispatchEvent(drop)

        expect(moved).toEqual([{ source: 'config/sub/printer.cfg', dest: 'config/sub/dir/printer.cfg' }])
    })

    const dropOn = (row: HTMLElement, filename: string) => {
        const drop = new Event('drop', { bubbles: true, cancelable: true })
        Object.defineProperty(drop, 'dataTransfer', { value: { getData: () => filename } })
        row.dispatchEvent(drop)
    }

    it('moves the existing related files along with a dropped file', async () => {
        mount(['config'], { relatedFiles: () => ['printer.jpg', 'missing.jpg'] })
        store.commit('files/setDirectoryEntry', {
            path: 'config/sub/printer.jpg',
            type: 'files',
            item: { modified: 1, size: 5, permissions: 'rw' },
        })
        await tick()

        dropOn(rowByName('dir'), 'printer.cfg')
        await tick()

        expect(moved).toEqual([
            { source: 'config/sub/printer.cfg', dest: 'config/sub/dir/printer.cfg' },
            { source: 'config/sub/printer.jpg', dest: 'config/sub/dir/printer.jpg', silent: true },
        ])
    })

    it('does not move the related files if the dropped file cannot be moved', async () => {
        moveResult = false
        mount(['config'], { relatedFiles: () => ['printer.jpg'] })
        store.commit('files/setDirectoryEntry', {
            path: 'config/sub/printer.jpg',
            type: 'files',
            item: { modified: 1, size: 5, permissions: 'rw' },
        })
        await tick()

        dropOn(rows()[0], 'printer.cfg')
        await tick()

        expect(moved).toEqual([{ source: 'config/sub/printer.cfg', dest: 'config/printer.cfg' }])
    })

    it('downloads selected directories and files with their related files as a zip archive', async () => {
        const selectedItem = (filename: string, isDirectory: boolean): FileStateFile => ({
            isDirectory,
            filename,
            modified: new Date(1000),
            size: 10,
            permissions: 'rw',
        })
        const selected = [selectedItem('dir', true), selectedItem('printer.cfg', false)]
        mount(['config'], { relatedFiles: () => ['printer.jpg', 'missing.jpg'], selected })
        store.commit('files/setDirectoryEntry', {
            path: 'config/sub/printer.jpg',
            type: 'files',
            item: { modified: 1, size: 5, permissions: 'rw' },
        })
        await tick()

        const button = vm.$el.querySelector('button[title="Files.Download"]') as HTMLElement
        button.click()
        await tick()

        // directories are passed separately, so the store can add their subdirectories
        expect(zipped).toEqual([
            {
                files: ['config/sub/printer.cfg', 'config/sub/printer.jpg'],
                directories: ['config/sub/dir'],
                dest: expect.stringMatching(/^config\/config-.+\.zip$/),
            },
        ])
        expect(errors).toEqual([])
    })

    it('shows the root-missing slot instead of the table if the root is not registered', async () => {
        mount([])
        await tick()

        expect(opened).toEqual([])
        expect(vm.$el.querySelector('table')).toBeNull()
        expect(vm.$el.querySelector('.root-missing')).not.toBeNull()
    })
})
