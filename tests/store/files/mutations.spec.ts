import { describe, expect, it } from 'vitest'
import { mutations } from '@/store/files/mutations'
import { getDefaultState } from '@/store/files'
import type { FileState, FileStateDirectory, FileStateEntry } from '@/store/files/types'
import type { GcodeMetadata } from '@/types/moonraker/FileManagerRPC'

const entry = (name: string, overrides: Partial<FileStateEntry> = {}): FileStateEntry => ({
    name,
    modified: 1000,
    size: 10,
    permissions: 'rw',
    ...overrides,
})

const directory = (dirs: string[] = [], files: string[] = []): FileStateDirectory => ({
    dirs: Object.fromEntries(dirs.map((name) => [name, entry(name)])),
    files: Object.fromEntries(files.map((name) => [name, entry(name)])),
    disk_usage: null,
})

const metadata = (filename: string): GcodeMetadata => ({ filename, modified: 1000, size: 10 })

const createState = (): FileState => {
    const state = getDefaultState()
    mutations.setDirectory(state, { path: 'gcodes', directory: directory(['sub'], ['a.gcode']) })
    mutations.setDirectory(state, { path: 'gcodes/sub', directory: directory(['deep'], ['b.gcode']) })
    mutations.setDirectory(state, { path: 'gcodes/sub/deep', directory: directory([], ['c.gcode']) })
    mutations.setDirectory(state, { path: 'gcodes/subdir', directory: directory() })
    mutations.setMetadata(state, [metadata('a.gcode'), metadata('sub/b.gcode'), metadata('sub/deep/c.gcode')])

    return state
}

describe('files/mutations', () => {
    it('stores directories frozen', () => {
        const state = createState()

        expect(Object.isFrozen(state.directories.gcodes)).toBe(true)
        expect(Object.isFrozen(state.directories.gcodes.files)).toBe(true)
    })

    it('adds and replaces entries of a loaded directory', () => {
        const state = createState()

        mutations.setDirectoryEntry(state, { path: 'gcodes', type: 'files', entry: entry('new.gcode') })
        mutations.setDirectoryEntry(state, { path: 'gcodes', type: 'files', entry: entry('a.gcode', { size: 99 }) })

        expect(Object.keys(state.directories.gcodes.files)).toEqual(['a.gcode', 'new.gcode'])
        expect(state.directories.gcodes.files['a.gcode'].size).toBe(99)
    })

    it('ignores entries of directories that are not loaded', () => {
        const state = createState()

        mutations.setDirectoryEntry(state, { path: 'config', type: 'files', entry: entry('printer.cfg') })

        expect(state.directories.config).toBeUndefined()
    })

    it('removes entries', () => {
        const state = createState()

        mutations.removeDirectoryEntry(state, { path: 'gcodes', type: 'dirs', name: 'sub' })

        expect(state.directories.gcodes.dirs).toEqual({})
        expect(state.directories.gcodes.files['a.gcode']).toBeDefined()
    })

    it('removes a directory tree without touching similar named directories', () => {
        const state = createState()

        mutations.removeDirectoryTree(state, 'gcodes/sub')

        expect(Object.keys(state.directories)).toEqual(['gcodes', 'gcodes/subdir'])
    })

    it('moves a directory tree', () => {
        const state = createState()

        mutations.moveDirectoryTree(state, { source: 'gcodes/sub', dest: 'gcodes/moved' })

        expect(Object.keys(state.directories).sort()).toEqual([
            'gcodes',
            'gcodes/moved',
            'gcodes/moved/deep',
            'gcodes/subdir',
        ])
    })

    it('removes metadata of files and directories', () => {
        const state = createState()

        mutations.removeMetadata(state, ['a.gcode', 'sub/deep'])

        expect(Object.keys(state.metadata)).toEqual(['sub/b.gcode'])
    })

    it('removes all metadata with an empty path', () => {
        const state = createState()

        mutations.removeMetadata(state, '')

        expect(state.metadata).toEqual({})
    })

    it('moves metadata and updates the filename', () => {
        const state = createState()

        mutations.moveMetadata(state, { source: 'sub', dest: 'moved' })

        expect(Object.keys(state.metadata).sort()).toEqual(['a.gcode', 'moved/b.gcode', 'moved/deep/c.gcode'])
        expect(state.metadata['moved/b.gcode'].filename).toBe('moved/b.gcode')
    })

    it('resets the upload state', () => {
        const state = createState()

        mutations.setUpload(state, { show: true, filename: 'a.gcode', percent: 50 })
        mutations.resetUpload(state)

        expect(state.upload).toEqual(getDefaultState().upload)
    })
})
