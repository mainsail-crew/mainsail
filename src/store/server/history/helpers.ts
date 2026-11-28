import Vue from 'vue'
import { isJsonRpcError, NAMESPACE_NOT_FOUND } from '@/types/moonraker'
import type { ServerHistoryStateJob } from '@/store/server/history/types'
import type { HistoryJob } from '@/types/moonraker/HistoryRPC'

/*
 * Constants
 */

/** Number of jobs requested per server.history.list request */
export const PAGE_SIZE = 50

/** Number of jobs loaded on init, all other jobs are loaded on demand */
export const INIT_MAX_JOBS = 100

/** Database namespace of the job notes */
export const NOTES_NAMESPACE = 'history_notes'

/*
 * Logging
 */

const LOG_PREFIX = '[Server][History]'
export const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
export const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

/*
 * Jobs
 */

/** Loads jobs page by page, newest first. Without max all jobs are loaded. */
export const fetchJobPages = async (max: number | null): Promise<{ jobs: HistoryJob[]; allLoaded: boolean }> => {
    const jobs = new Map<string, HistoryJob>()

    while (max === null || jobs.size < max) {
        const start = jobs.size
        const response = await Vue.$socket.emitAndWait('server.history.list', { start, limit: PAGE_SIZE })

        // a job started during the requests shifts the offsets, so jobs can be returned twice
        response.jobs.forEach((job) => jobs.set(job.job_id, job))

        if (response.jobs.length < PAGE_SIZE) return { jobs: [...jobs.values()], allLoaded: true }
    }

    return { jobs: [...jobs.values()], allLoaded: false }
}

/** Adds the note of each job, jobs without a note get no note property */
export const addNotes = (jobs: HistoryJob[], notes: Record<string, string>): ServerHistoryStateJob[] =>
    jobs.map((job) => {
        const note = notes[job.job_id]
        return note === undefined ? job : { ...job, note }
    })

/*
 * Notes
 */

/** Converts the history_notes namespace (`{ [job_id]: { text } }`) into a map of job ids and notes */
export const parseNotes = (value: unknown): Record<string, string> => {
    if (typeof value !== 'object' || value === null) return {}

    const notes: Record<string, string> = {}
    Object.entries(value as Record<string, unknown>).forEach(([jobId, entry]) => {
        const text = (entry as { text?: unknown } | null)?.text
        if (typeof text === 'string') notes[jobId] = text
    })

    return notes
}

/** Loads the notes of all jobs as a map of job ids and notes */
export const fetchNotes = async (): Promise<Record<string, string>> => {
    try {
        const response = await Vue.$socket.emitAndWait('server.database.get_item', { namespace: NOTES_NAMESPACE })

        return parseNotes(response.value)
    } catch (error) {
        // the namespace is created with the first note
        if (isJsonRpcError(error) && error.code === NAMESPACE_NOT_FOUND) return {}

        throw error
    }
}

/*
 * Job index
 */

/** Key to find the jobs of a file without uuid. `modified` is in milliseconds. */
export const getFileKey = (size: number, modified: number): string => `${size}-${modified}`

export const pushToIndex = (
    index: Map<string, ServerHistoryStateJob[]>,
    key: string,
    job: ServerHistoryStateJob
): void => {
    const jobs = index.get(key)
    if (jobs) jobs.push(job)
    else index.set(key, [job])
}
