import { describe, expect, it } from 'vitest'
import {
    getExtension,
    getRoot,
    isInPath,
    joinPath,
    normalizePath,
    replacePathPrefix,
    splitPath,
    stripRoot,
} from '@/store/files/paths'

describe('files/paths', () => {
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
})
