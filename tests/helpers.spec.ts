import { describe, expect, it } from 'vitest'
import { isRecord, parseNumber, toggleArrayItem } from '@/plugins/helpers'

describe('helpers', () => {
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
