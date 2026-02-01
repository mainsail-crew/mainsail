import { describe, expect, it } from 'vitest'
import { toggleArrayItem } from '@/plugins/helpers'

describe('helpers', () => {
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
