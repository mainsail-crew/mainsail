/**
 * Minimal top-down G-code parser for the live 2D preview.
 * Extracts only extruding X/Y moves as connected "runs", each point tagged with
 * its byte offset in the source file so the panel can split done/remaining
 * against Moonraker's virtual_sdcard.file_position.
 *
 * Arcs (G2/G3) are approximated by their endpoint - good enough for a small preview.
 */

export interface GcodePreviewPoint {
    x: number
    y: number
    offset: number
}

export type GcodePreviewRun = GcodePreviewPoint[]

const EXTRUSION_EPSILON = 1e-6

function stripComment(line: string): string {
    const semiIndex = line.indexOf(';')
    const withoutLineComment = semiIndex === -1 ? line : line.slice(0, semiIndex)

    return withoutLineComment.replace(/\([^)]*\)/g, '')
}

function parseParams(line: string): Record<string, number> {
    const params: Record<string, number> = {}
    const tokens = line.split(' ')

    for (let i = 1; i < tokens.length; i++) {
        const token = tokens[i]
        if (token.length < 2) continue

        const value = parseFloat(token.slice(1))
        if (!Number.isNaN(value)) params[token[0].toUpperCase()] = value
    }

    return params
}

function pushPointDecimated(run: GcodePreviewRun, point: GcodePreviewPoint, minDistanceSq: number): void {
    const last = run[run.length - 1]
    if (last) {
        const dx = point.x - last.x
        const dy = point.y - last.y
        if (dx * dx + dy * dy < minDistanceSq) return
    }

    run.push(point)
}

/**
 * @param bedSizeMm largest bed axis span, used to scale the decimation threshold
 */
export function parseGcodeToolpath(text: string, bedSizeMm: number): GcodePreviewRun[] {
    const minDistance = Math.max(bedSizeMm / 600, 0.05)
    const minDistanceSq = minDistance * minDistance

    const runs: GcodePreviewRun[] = []
    let currentRun: GcodePreviewRun = []

    let x = 0
    let y = 0
    let e = 0
    let relativeXY = false
    let relativeE = false
    let offset = 0

    const lines = text.split('\n')

    for (const rawLine of lines) {
        const startOffset = offset
        offset += rawLine.length + 1 // account for the split-away newline

        const line = stripComment(rawLine).trim()
        if (!line) continue

        const spaceIndex = line.indexOf(' ')
        const command = (spaceIndex === -1 ? line : line.slice(0, spaceIndex)).toUpperCase()

        if (command === 'G90') {
            relativeXY = false
            continue
        }
        if (command === 'G91') {
            relativeXY = true
            continue
        }
        if (command === 'M82') {
            relativeE = false
            continue
        }
        if (command === 'M83') {
            relativeE = true
            continue
        }

        if (command === 'G92') {
            const params = parseParams(line)
            if ('X' in params) x = params.X
            if ('Y' in params) y = params.Y
            if ('E' in params) e = params.E
            continue
        }

        if (command !== 'G0' && command !== 'G1' && command !== 'G2' && command !== 'G3') continue

        const params = parseParams(line)
        const prevX = x
        const prevY = y
        let hasXY = false

        if ('X' in params) {
            x = relativeXY ? x + params.X : params.X
            hasXY = true
        }
        if ('Y' in params) {
            y = relativeXY ? y + params.Y : params.Y
            hasXY = true
        }

        let extruding = false
        if ('E' in params) {
            const newE = relativeE ? e + params.E : params.E
            extruding = command === 'G1' && newE > e + EXTRUSION_EPSILON
            e = newE
        }

        if (!hasXY) continue

        if (extruding) {
            if (currentRun.length === 0) currentRun.push({ x: prevX, y: prevY, offset: startOffset })
            pushPointDecimated(currentRun, { x, y, offset: startOffset }, minDistanceSq)
        } else if (currentRun.length > 1) {
            runs.push(currentRun)
            currentRun = []
        } else {
            currentRun = []
        }
    }

    if (currentRun.length > 1) runs.push(currentRun)

    return runs
}
