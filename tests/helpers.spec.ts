import { describe, expect, it } from 'vitest'
import { isRecord, parseNumber } from '@/plugins/helpers'

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
})
