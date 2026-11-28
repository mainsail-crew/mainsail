// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import vuetify from '@/plugins/vuetify'
import i18n from '@/plugins/i18n'
import FilesNameDialog from '@/components/dialogs/files/FilesNameDialog.vue'
import { files, getDefaultState } from '@/store/files'
import type { FileStateFile } from '@/store/files/types'

Vue.use(Vuex)

const tick = async () => {
    for (let i = 0; i < 3; i++) await Vue.nextTick()
}

const file = (filename: string): FileStateFile => ({
    isDirectory: false,
    filename,
    modified: new Date(0),
    size: 0,
    permissions: 'rw',
})

describe('FilesNameDialog (mounted)', () => {
    let vm: Vue & { show: boolean; item: FileStateFile }

    const mount = () => {
        const store = new Store({
            modules: {
                files: { ...files, state: getDefaultState() },
                gui: { namespaced: true, state: {}, getters: { getPanelExpand: () => () => true } },
            },
        })
        store.commit('files/setDirectory', {
            path: 'gcodes',
            directory: {
                dirs: {},
                files: { 'a.gcode': { name: 'a.gcode', modified: 1, size: 0, permissions: 'rw' } },
                disk_usage: null,
            },
        })

        vm = new Vue({
            store,
            vuetify,
            i18n,
            data: { show: false, item: file('a.gcode') },
            render(h) {
                return h('v-app', [
                    h(FilesNameDialog, {
                        props: { value: this.show, mode: 'duplicate', directory: 'gcodes', item: this.item },
                        on: { input: (value: boolean) => (this.show = value) },
                    }),
                ])
            },
        }).$mount(document.body.appendChild(document.createElement('div'))) as typeof vm

        return store
    }

    const input = () => document.body.querySelector('.files-name-dialog input') as HTMLInputElement
    const submitButton = () =>
        [...document.body.querySelectorAll('.files-name-dialog button')].find((button) =>
            button.textContent?.includes('Files.Duplicate')
        ) as HTMLButtonElement

    const open = async (item: FileStateFile) => {
        vm.item = item
        vm.show = true
        await tick()
    }

    const type = async (value: string) => {
        input().value = value
        input().dispatchEvent(new Event('input'))
        await tick()
    }

    afterEach(() => {
        vm.$destroy()
        document.body.innerHTML = ''
    })

    it('disables the button for an existing name and enables it for a new one', async () => {
        mount()

        await open(file('a.gcode'))
        expect(input().value).toBe('a.gcode')
        expect(submitButton().disabled).toBe(true)

        await type('b.gcode')
        expect(submitButton().disabled).toBe(false)
    })

    it('can be used again when it is opened with the name of the last input', async () => {
        const store = mount()
        await open(file('a.gcode'))
        await type('b.gcode')
        vm.show = false
        await tick()

        // the duplicated file was created and is duplicated again
        store.commit('files/setDirectoryEntry', {
            path: 'gcodes/b.gcode',
            type: 'files',
            item: { modified: 1, size: 0, permissions: 'rw' },
        })
        await open(file('b.gcode'))
        expect(submitButton().disabled).toBe(true)

        await type('c.gcode')
        expect(submitButton().disabled).toBe(false)
    })
})
