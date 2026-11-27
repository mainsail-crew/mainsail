import { describe, expect, it } from 'vitest'
import { getters } from '@/store/server/history/getters'
import type { ServerHistoryState, ServerHistoryStateJob } from '@/store/server/history/types'
import type { RootState } from '@/store/types'

const job = (job_id: string, metadata: ServerHistoryStateJob['metadata']): ServerHistoryStateJob =>
    ({ job_id, metadata, status: 'completed', start_time: 0 }) as ServerHistoryStateJob

const getPrintJobsForGcodes = (jobs: ServerHistoryStateJob[]) => {
    const state = { jobs } as ServerHistoryState
    const moduleGetters = { getPrintJobIndex: getters.getPrintJobIndex(state, {}, {} as RootState, {}) }

    return getters.getPrintJobsForGcodes(state, moduleGetters, {} as RootState, {})
}

describe('server/history/getPrintJobsForGcodes', () => {
    const jobs = [
        job('1', { uuid: 'a', size: 10, modified: 1 }),
        job('2', { uuid: 'a', size: 10, modified: 1 }),
        job('3', { size: 20, modified: 2.5 }),
        job('4', { size: 30, modified: 3 }),
    ]

    it('finds jobs by the uuid of the file', () => {
        const result = getPrintJobsForGcodes(jobs)('a.gcode', 1000, 10, 'a', null)

        expect(result.map((entry: ServerHistoryStateJob) => entry.job_id)).toEqual(['1', '2'])
    })

    it('finds jobs by size and modified date', () => {
        const result = getPrintJobsForGcodes(jobs)('b.gcode', 2500, 20, null, null)

        expect(result.map((entry: ServerHistoryStateJob) => entry.job_id)).toEqual(['3'])
    })

    it('falls back to the last job id of the file', () => {
        const result = getPrintJobsForGcodes(jobs)('c.gcode', 9999, 30, null, '4')

        expect(result.map((entry: ServerHistoryStateJob) => entry.job_id)).toEqual(['4'])
    })

    it('returns an empty list without matching jobs', () => {
        expect(getPrintJobsForGcodes(jobs)('d.gcode', 0, 0, null, null)).toEqual([])
    })
})
