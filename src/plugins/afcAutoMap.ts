import { TinyColor } from '@ctrl/tinycolor'

export interface AutoMapTool {
    tool: number
    color?: string
    material?: string
    weight?: number
}

export interface AutoMapLane {
    lane: string
    color?: string
    material?: string
    weight?: number
    current: boolean[] // per tool index: is this tool already mapped to the lane
}

// Cost of a tool on a lane, compared in order:
// material mismatch, not enough filament, color distance (ΔE), not the current lane
type Cost = [number, number, number, number]

// Larger than any CIE Lab ΔE (max ≈ 375), used when a color is missing or invalid
const NO_COLOR_DISTANCE = 1000

// Leaving a tool unmapped is worse than any material mismatch
const SKIP_COST: Cost = [2, 0, 0, 0]

// Exact assignment is tools × 2^lanes; above this, fall back to the greedy pass
const MAX_EXACT_LANES = 12

// sRGB hex -> CIE Lab (D65); undefined for missing or invalid colors
export function hexToLab(hex?: string): [number, number, number] | undefined {
    if (!hex) return undefined

    const color = new TinyColor(hex)
    if (!color.isValid) return undefined

    const { r, g, b } = color.toRgb()
    const lin = (c: number) => ((c /= 255) > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92)
    const [lr, lg, lb] = [lin(r), lin(g), lin(b)]
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
    const x = f((lr * 0.4124 + lg * 0.3576 + lb * 0.1805) / 0.95047)
    const y = f(lr * 0.2126 + lg * 0.7152 + lb * 0.0722)
    const z = f((lr * 0.0193 + lg * 0.1192 + lb * 0.9505) / 1.08883)

    return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

// Same rule as the dialog's material warning (isFilamentTypeValid); an unknown type on either side is a mismatch
function isMaterialMismatch(file?: string, lane?: string) {
    const fileType = (file || '--').toLowerCase()
    const laneType = (lane || '--').toLowerCase()

    return fileType === '--' || laneType === '--' || fileType !== laneType
}

function laneCost(tool: AutoMapTool, lane: AutoMapLane): Cost {
    const lab1 = hexToLab(tool.color)
    const lab2 = hexToLab(lane.color)

    return [
        isMaterialMismatch(tool.material, lane.material) ? 1 : 0,
        // same rule as the dialog's weight warning (isFilamentWeightValid)
        Number(tool.weight ?? 0) < Number(lane.weight ?? 0) ? 0 : 1,
        lab1 && lab2 ? Math.hypot(lab1[0] - lab2[0], lab1[1] - lab2[1], lab1[2] - lab2[2]) : NO_COLOR_DISTANCE,
        lane.current[tool.tool] ? 0 : 1,
    ]
}

const add = (a: Cost, b: Cost): Cost => [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]]

const compare = (a: Cost, b: Cost) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3]

// Greedy fallback: cheapest (tool, lane) pairs first, each tool and lane used once
function greedy(tools: AutoMapTool[], lanes: AutoMapLane[], costs: Cost[][]) {
    const pairs = tools
        .flatMap((_, t) => lanes.map((_, l) => ({ t, l })))
        .sort((a, b) => compare(costs[a.t][a.l], costs[b.t][b.l]))
    const result = new Map<number, string>()
    const usedLanes = new Set<number>()

    for (const { t, l } of pairs) {
        if (result.has(tools[t].tool) || usedLanes.has(l)) continue

        result.set(tools[t].tool, lanes[l].lane)
        usedLanes.add(l)
    }

    return result
}

/**
 * Maps each tool to a lane so that the summed cost is minimal (each lane used at most once).
 * Returns tool -> lane; tools left without a lane (more tools than lanes) are not in the result.
 */
export function autoMap(tools: AutoMapTool[], lanes: AutoMapLane[]): Map<number, string> {
    if (!tools.length || !lanes.length) return new Map()

    const costs = tools.map((tool) => lanes.map((lane) => laneCost(tool, lane)))
    if (lanes.length > MAX_EXACT_LANES) return greedy(tools, lanes, costs)

    // best[t][mask]: minimal cost for tools t.. with the lanes in mask already taken
    const size = 1 << lanes.length
    const best: Cost[][] = Array.from({ length: tools.length + 1 }, () => new Array<Cost>(size))
    const choice: number[][] = Array.from({ length: tools.length }, () => new Array<number>(size))
    best[tools.length].fill([0, 0, 0, 0])

    for (let t = tools.length - 1; t >= 0; t--) {
        for (let mask = 0; mask < size; mask++) {
            let bestCost = add(SKIP_COST, best[t + 1][mask])
            let bestLane = -1

            for (let l = 0; l < lanes.length; l++) {
                if (mask & (1 << l)) continue

                const cost = add(costs[t][l], best[t + 1][mask | (1 << l)])
                if (compare(cost, bestCost) < 0) {
                    bestCost = cost
                    bestLane = l
                }
            }

            best[t][mask] = bestCost
            choice[t][mask] = bestLane
        }
    }

    const result = new Map<number, string>()
    let mask = 0
    for (let t = 0; t < tools.length; t++) {
        const l = choice[t][mask]
        if (l >= 0) {
            result.set(tools[t].tool, lanes[l].lane)
            mask |= 1 << l
        }
    }

    return result
}
