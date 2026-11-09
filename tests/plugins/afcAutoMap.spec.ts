import { describe, expect, it } from 'vitest'
import { autoMap, hexToLab, AutoMapLane, AutoMapTool } from '@/plugins/afcAutoMap'

const lane = (
    name: string,
    color: string | undefined,
    material = 'PLA',
    current: number[] = [],
    weight = 1000
): AutoMapLane => ({
    lane: name,
    color,
    material,
    weight,
    current: current.reduce<boolean[]>((acc, t) => {
        acc[t] = true
        return acc
    }, []),
})

const tool = (
    t: number,
    color: string | undefined,
    material: string | undefined = 'PLA',
    weight = 10
): AutoMapTool => ({
    tool: t,
    color,
    material,
    weight,
})

const result = (map: Map<number, string>) => Object.fromEntries(map)

describe('hexToLab', () => {
    it.each(['#FF0000', 'FF0000', 'ff0000'])('accepts %s', (hex) => {
        expect(hexToLab(hex)).toBeDefined()
    })

    it.each([undefined, '', '#', '#red', 'FF000'])('rejects %s', (hex) => {
        expect(hexToLab(hex)).toBeUndefined()
    })
})

describe('autoMap', () => {
    it('finds the minimal total assignment, not the greedy one', () => {
        // greys: T0 is closest to A, but T1 needs A much more than T0 does
        // greedy: T0→A, T1→B; minimal total: T0→B, T1→A
        const tools = [tool(0, '#7F7F7F'), tool(1, '#707070')]
        const lanes = [lane('A', '#7C7C7C'), lane('B', '#959595')]

        expect(result(autoMap(tools, lanes))).toEqual({ 0: 'B', 1: 'A' })
    })

    it('prefers a material match over a closer color', () => {
        const map = autoMap([tool(0, '#FF0000', 'PETG')], [lane('A', '#FF0000', 'PLA'), lane('B', '#00FF00', 'PETG')])

        expect(result(map)).toEqual({ 0: 'B' })
    })

    it('treats unknown material as a mismatch, like the dialog warning', () => {
        // the PLA tool must keep the only PLA lane; the untyped tool takes the other one
        const map = autoMap(
            [tool(0, '#FF0000', 'PLA'), tool(1, '#FF0000', '')],
            [lane('A', '#FF0000', 'PLA'), lane('B', '#00FF00', 'PETG')]
        )

        expect(result(map)).toEqual({ 0: 'A', 1: 'B' })
    })

    it('prefers a lane with enough filament over a slightly closer color', () => {
        const map = autoMap(
            [tool(0, '#FF0000', 'PLA', 300)],
            [lane('A', '#FF0000', 'PLA', [], 100), lane('B', '#F00000', 'PLA', [], 1000)]
        )

        expect(result(map)).toEqual({ 0: 'B' })
    })

    it('keeps the current lane when color data is missing', () => {
        const map = autoMap([tool(0, undefined)], [lane('A', '#FF0000'), lane('B', '#00FF00', 'PLA', [0])])

        expect(result(map)).toEqual({ 0: 'B' })
    })

    it('treats invalid lane colors as missing', () => {
        const map = autoMap([tool(0, '#000000')], [lane('A', '#red'), lane('B', '#101010')])

        expect(result(map)).toEqual({ 0: 'B' })
    })

    it('leaves extra tools unmapped when there are more tools than lanes', () => {
        const map = autoMap([tool(0, '#FF0000'), tool(1, '#00FF00')], [lane('A', '#00FF00')])

        expect(result(map)).toEqual({ 1: 'A' })
    })

    it('returns nothing without tools or lanes', () => {
        expect(autoMap([], [lane('A', '#FF0000')]).size).toBe(0)
        expect(autoMap([tool(0, '#FF0000')], []).size).toBe(0)
    })
})
