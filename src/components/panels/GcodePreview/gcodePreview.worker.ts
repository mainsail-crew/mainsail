/// <reference lib="webworker" />

// Parses G-code off the main thread - a multi-megabyte file would otherwise
// freeze the whole UI (every panel, not just this one) for the duration of the parse.

import { parseGcodeToolpath, GcodePreviewRun } from './parser'

const ctx_self = self as unknown as DedicatedWorkerGlobalScope

export type GcodePreviewWorkerInMessage = { type: 'parse'; text: string; bedSizeMm: number }
export type GcodePreviewWorkerOutMessage = { type: 'result'; runs: GcodePreviewRun[] } | { type: 'error'; message: string }

ctx_self.onmessage = (event: MessageEvent<GcodePreviewWorkerInMessage>) => {
    if (event.data.type !== 'parse') return

    try {
        const runs = parseGcodeToolpath(event.data.text, event.data.bedSizeMm)
        const message: GcodePreviewWorkerOutMessage = { type: 'result', runs }
        ctx_self.postMessage(message)
    } catch (error) {
        const message: GcodePreviewWorkerOutMessage = {
            type: 'error',
            message: error instanceof Error ? error.message : 'unknown parsing error',
        }
        ctx_self.postMessage(message)
    }
}
