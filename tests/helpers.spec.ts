import { describe, expect, it } from 'vitest'
import { isRecord } from '@/plugins/helpers'

describe('helpers', () => {
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
