import { describe, expect, it } from 'vitest'
import {
    getExtension,
    getRoot,
    isGcodeFile,
    isInPath,
    joinPath,
    moveKeys,
    normalizePath,
    parseDirectoryResponse,
    removeKeys,
    replacePathPrefix,
    splitPath,
    stripRoot,
} from '@/store/files/helpers'
import type { FileDirectoryResponse } from '@/types/moonraker/FileManagerRPC'

describe('files/helpers', () => {
    it('normalizes leading, trailing and double slashes', () => {
        expect(normalizePath('/gcodes//sub/')).toBe('gcodes/sub')
        expect(normalizePath('')).toBe('')
        expect(normalizePath('/')).toBe('')
    })

    it('joins paths', () => {
        expect(joinPath('gcodes', '/sub', 'file.gcode')).toBe('gcodes/sub/file.gcode')
        expect(joinPath('gcodes', '', 'file.gcode')).toBe('gcodes/file.gcode')
    })

    it('splits a path into directory and name', () => {
        expect(splitPath('gcodes/sub/file.gcode')).toEqual({ dir: 'gcodes/sub', name: 'file.gcode' })
        expect(splitPath('/gcodes/')).toEqual({ dir: '', name: 'gcodes' })
        expect(splitPath('file.gcode')).toEqual({ dir: '', name: 'file.gcode' })
    })

    it('returns and strips the root', () => {
        expect(getRoot('/gcodes/sub/file.gcode')).toBe('gcodes')
        expect(stripRoot('/gcodes/sub/file.gcode')).toBe('sub/file.gcode')
        expect(stripRoot('gcodes')).toBe('')
    })

    it('checks if a path is inside a directory', () => {
        expect(isInPath('gcodes/sub', 'gcodes/sub')).toBe(true)
        expect(isInPath('gcodes/sub/deep', 'gcodes/sub')).toBe(true)
        expect(isInPath('gcodes/subdir', 'gcodes/sub')).toBe(false)
    })

    it('replaces the prefix of a path', () => {
        expect(replacePathPrefix('gcodes/a/b', 'gcodes/a', 'gcodes/c')).toBe('gcodes/c/b')
    })

    it('returns the lowercase extension', () => {
        expect(getExtension('Benchy.GCODE')).toBe('.gcode')
        expect(getExtension('README')).toBe('')
    })

    it('detects gcode files by their extension', () => {
        expect(isGcodeFile('Benchy.GCODE')).toBe(true)
        expect(isGcodeFile('notes.txt')).toBe(false)
    })

    it('moves keys inside a path and drops existing keys at the destination', () => {
        const record = { a: 1, 'a/b': 2, ab: 3, c: 4, 'c/old': 5 }

        expect(moveKeys(record, 'a', 'c')).toEqual({ c: 1, 'c/b': 2, ab: 3 })
    })

    it('removes keys inside a path', () => {
        expect(removeKeys({ a: 1, 'a/b': 2, ab: 3 }, 'a')).toEqual({ ab: 3 })
        expect(removeKeys({ a: 1 }, '')).toEqual({})
    })

    it('parses a directory response with metadata of scanned gcode files', () => {
        const response = {
            dirs: [
                { dirname: 'sub', modified: 1, size: 4096, permissions: 'rw' },
                { dirname: '.git', modified: 1, size: 4096, permissions: 'rw' },
            ],
            files: [
                { filename: 'a.gcode', modified: 2, size: 10, permissions: 'rw', estimated_time: 100 },
                { filename: 'b.gcode', modified: 3, size: 20, permissions: 'rw' },
                { filename: 'notes.txt', modified: 4, size: 30, permissions: 'r' },
            ],
            disk_usage: { total: 100, used: 40, free: 60 },
            root_info: { name: 'gcodes', permissions: 'rw' },
        } as FileDirectoryResponse

        const { directory, metadata } = parseDirectoryResponse('gcodes/dir', response)

        expect(Object.keys(directory.dirs)).toEqual(['sub'])
        expect(Object.keys(directory.files)).toEqual(['a.gcode', 'b.gcode', 'notes.txt'])
        expect(directory.files['notes.txt']).toEqual({ name: 'notes.txt', modified: 4, size: 30, permissions: 'r' })
        expect(directory.disk_usage).toEqual({ total: 100, used: 40, free: 60 })
        expect(metadata).toEqual([{ filename: 'dir/a.gcode', modified: 2, size: 10, estimated_time: 100 }])
    })
})
