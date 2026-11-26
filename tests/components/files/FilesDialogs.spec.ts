// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import i18n from '@/plugins/i18n'
import FilesNameDialog from '@/components/dialogs/files/FilesNameDialog.vue'
import FilesDeleteDialog from '@/components/dialogs/files/FilesDeleteDialog.vue'
import type { FileStateFile } from '@/store/files/types'
import type { FileRelatedFilesGetter, FilesNameDialogMode } from '@/components/files/types'

const file = (filename: string, isDirectory = false): FileStateFile => ({
    isDirectory,
    filename,
    modified: new Date(0),
    size: 0,
    permissions: 'rw',
})

const relatedFiles: FileRelatedFilesGetter = (filename) =>
    filename.endsWith('.mp4') ? [filename.replace('.mp4', '.jpg')] : []

Vue.use(Vuex)

let existingPaths: string[]
let dispatchResults: Record<string, boolean>
const dispatch = vi.fn()

/** Files store with mocked actions, which records the dispatched actions with their payload */
const createStore = () => {
    const action = (name: string) => (_: unknown, payload: unknown) => {
        dispatch(`files/${name}`, payload)
        return dispatchResults[`files/${name}`] ?? true
    }

    return new Store({
        modules: {
            files: {
                namespaced: true,
                getters: { existsPath: () => (path: string) => existingPaths.includes(path) },
                actions: Object.fromEntries(
                    ['move', 'copy', 'createDirectory', 'createFile', 'deleteFile', 'deleteDirectory'].map((name) => [
                        name,
                        action(name),
                    ])
                ),
            },
        },
    })
}

// the build type check resolves .vue files with a generic shim, so the used members are typed here
interface NameDialogInstance {
    name: string
    isInvalidName: boolean
    isLoading: boolean
    readonly extension: string
    readonly isValid: boolean
    onShowDialogChanged(newVal: boolean): void
    existsName(name: string): boolean
    submit(): Promise<void>
}

interface DeleteDialogInstance {
    readonly targets: FileStateFile[]
    readonly text: string
    onShowDialogChanged(newVal: boolean): void
    submit(): Promise<void>
    $on(event: string, callback: (...args: unknown[]) => void): void
}

const createNameDialog = (props: {
    mode: FilesNameDialogMode
    item?: FileStateFile | null
    keepExtension?: boolean
    relatedFiles?: FileRelatedFilesGetter | null
}) =>
    new FilesNameDialog({
        propsData: { value: false, directory: 'timelapse', ...props },
        store: createStore(),
        i18n,
    }) as unknown as NameDialogInstance

const createDeleteDialog = (items: FileStateFile[]) =>
    new FilesDeleteDialog({
        propsData: { value: false, directory: 'timelapse', items, relatedFiles },
        store: createStore(),
        i18n,
    }) as unknown as DeleteDialogInstance

describe('FilesNameDialog', () => {
    beforeEach(() => {
        existingPaths = ['timelapse/video.mp4', 'timelapse/video.jpg', 'timelapse/other.mp4']
        dispatchResults = {}
        dispatch.mockClear()
    })

    it('keeps the extension when renaming a file', async () => {
        const dialog = createNameDialog({ mode: 'rename', item: file('video.mp4'), keepExtension: true, relatedFiles })
        dialog.onShowDialogChanged(true)

        expect(dialog.name).toBe('video')
        expect(dialog.extension).toBe('.mp4')
        expect(dialog.existsName('other')).toBe(true)
        expect(dialog.existsName('renamed')).toBe(false)

        dialog.name = 'renamed'
        dialog.isInvalidName = false
        await dialog.submit()

        expect(dispatch).toHaveBeenCalledWith('files/move', {
            source: 'timelapse/video.mp4',
            dest: 'timelapse/renamed.mp4',
        })
        expect(dispatch).toHaveBeenCalledWith('files/move', {
            source: 'timelapse/video.jpg',
            dest: 'timelapse/renamed.jpg',
            silent: true,
        })
    })

    it('does not rename related files if the rename failed', async () => {
        dispatchResults['files/move'] = false
        const dialog = createNameDialog({ mode: 'rename', item: file('video.mp4'), keepExtension: true, relatedFiles })
        dialog.onShowDialogChanged(true)
        dialog.name = 'renamed'
        dialog.isInvalidName = false

        await dialog.submit()

        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dialog.isLoading).toBe(false)
    })

    it('creates a directory and does not submit an invalid name', async () => {
        const dialog = createNameDialog({ mode: 'createDirectory' })
        dialog.onShowDialogChanged(true)

        await dialog.submit()
        expect(dispatch).not.toHaveBeenCalled()

        dialog.name = 'new'
        await dialog.submit()
        expect(dispatch).toHaveBeenCalledWith('files/createDirectory', 'timelapse/new')
    })

    it('starts with an invalid name when renaming or duplicating', () => {
        const dialog = createNameDialog({ mode: 'duplicate', item: file('video.mp4') })
        dialog.onShowDialogChanged(true)

        expect(dialog.name).toBe('video.mp4')
        expect(dialog.isValid).toBe(false)
    })
})

describe('FilesDeleteDialog', () => {
    beforeEach(() => {
        existingPaths = ['timelapse/video.mp4', 'timelapse/video.jpg', 'timelapse/dir']
        dispatchResults = {}
        dispatch.mockClear()
    })

    it('deletes files with their related files and directories', async () => {
        const dialog = createDeleteDialog([file('video.mp4'), file('dir', true)])
        dialog.onShowDialogChanged(true)
        const deleted = vi.fn()
        dialog.$on('deleted', deleted)

        await dialog.submit()

        expect(dispatch).toHaveBeenCalledWith('files/deleteFile', { path: 'timelapse/video.mp4' })
        expect(dispatch).toHaveBeenCalledWith('files/deleteFile', { path: 'timelapse/video.jpg', silent: true })
        expect(dispatch).toHaveBeenCalledWith('files/deleteDirectory', 'timelapse/dir')
        expect(deleted).toHaveBeenCalledWith([file('video.mp4'), file('dir', true)])
        expect(dialog.targets).toEqual([])
    })

    it('keeps failed items in the dialog', async () => {
        dispatchResults['files/deleteDirectory'] = false
        const dialog = createDeleteDialog([file('video.mp4'), file('dir', true)])
        dialog.onShowDialogChanged(true)
        const deleted = vi.fn()
        dialog.$on('deleted', deleted)

        await dialog.submit()

        expect(deleted).toHaveBeenCalledWith([file('video.mp4')])
        expect(dialog.targets).toEqual([file('dir', true)])
        expect(dialog.text).toBe('Files.DeleteDirectoryQuestion')
    })
})
