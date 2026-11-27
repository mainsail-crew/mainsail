import { describe, expect, it } from 'vitest'
import { isRecord, parseNumber, splitExtension, toggleArrayItem } from '@/plugins/helpers'

describe('helpers', () => {
    describe('splitExtension', () => {
        it('splits the extension including the dot', () => {
            expect(splitExtension('video.mp4')).toEqual({ name: 'video', extension: '.mp4' })
            expect(splitExtension('archive.tar.gz')).toEqual({ name: 'archive.tar', extension: '.gz' })
        })

        it('returns no extension for files without one and hidden files', () => {
            expect(splitExtension('README')).toEqual({ name: 'README', extension: '' })
            expect(splitExtension('.gitignore')).toEqual({ name: '.gitignore', extension: '' })
        })

        it('only uses the last segment of a path', () => {
            expect(splitExtension('.theme/sidebar-logo.png')).toEqual({
                name: '.theme/sidebar-logo',
                extension: '.png',
            })
            expect(splitExtension('.theme/navi')).toEqual({ name: '.theme/navi', extension: '' })
            expect(splitExtension('dir.v2/file')).toEqual({ name: 'dir.v2/file', extension: '' })
        })
    })

    describe('parseNumber', () => {
        it('returns number values unchanged', () => {
            expect(parseNumber(250, 0)).toBe(250)
        })

        it('parses numeric strings', () => {
            expect(parseNumber('250', 0)).toBe(250)
            expect(parseNumber('0.400', 0)).toBe(0.4)
        })

        it('returns fallback for undefined or invalid values', () => {
            expect(parseNumber(undefined, 170)).toBe(170)
            expect(parseNumber('abc', 170)).toBe(170)
            expect(parseNumber(Infinity, 170)).toBe(170)
        })
    })

    describe('isRecord', () => {
        it('returns true for plain objects', () => {
            expect(isRecord({ foo: 'bar' })).toBe(true)
        })

        it('returns false for null', () => {
            expect(isRecord(null)).toBe(false)
        })

        it('returns false for arrays', () => {
            expect(isRecord(['a', 'b'])).toBe(false)
        })

        it('returns false for primitives', () => {
            expect(isRecord('foo')).toBe(false)
            expect(isRecord(1)).toBe(false)
            expect(isRecord(true)).toBe(false)
        })
    })

    describe('toggleArrayItem', () => {
        it('adds item when not present', () => {
            const result = toggleArrayItem([1, 2, 3], 4)
            expect(result).toEqual([1, 2, 3, 4])
        })

        it('removes item when present', () => {
            const result = toggleArrayItem([1, 2, 3], 2)
            expect(result).toEqual([1, 3])
        })

        it('does not mutate the original array', () => {
            const original = [1, 2, 3]
            toggleArrayItem(original, 4)
            expect(original).toEqual([1, 2, 3])
        })

        it('works with strings', () => {
            expect(toggleArrayItem(['a', 'b'], 'c')).toEqual(['a', 'b', 'c'])
            expect(toggleArrayItem(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
        })

        it('works with empty array', () => {
            expect(toggleArrayItem([], 'item')).toEqual(['item'])
        })
    })
})
