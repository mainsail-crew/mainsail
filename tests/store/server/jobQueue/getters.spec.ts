import { describe, expect, it, vi } from 'vitest'
import { getters } from '@/store/server/jobQueue/getters'
import type { ServerJobQueueState, ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import type { FileStateGcodefile } from '@/store/files/types'
import type { RootState } from '@/store/types'
import type { QueuedJob } from '@/types/moonraker/JobQueueRPC'
import { queuedJob } from './fixtures'

const metadata = { filename: 'a.gcode' } as FileStateGcodefile

const getJobs = (
    queued_jobs: QueuedJob[],
    getGcodeFile = vi.fn((path: string) => (path === 'a.gcode' ? metadata : null))
) => {
    const state: ServerJobQueueState = { queued_jobs, queue_state: 'paused' }
    const rootGetters = { 'files/getGcodeFile': getGcodeFile }

    return getters.jobs(state, {}, {} as RootState, rootGetters) as ServerJobQueueStateJob[]
}

describe('server/jobQueue/getters', () => {
    it('combines consecutive jobs of the same file', () => {
        const jobs = getJobs([
            queuedJob('1', 'a.gcode'),
            queuedJob('2', 'a.gcode'),
            queuedJob('3', 'b.gcode'),
            queuedJob('4', 'a.gcode'),
        ])

        expect(jobs.map((job) => [job.job_id, job.combinedIds])).toEqual([
            ['1', ['2']],
            ['3', []],
            ['4', []],
        ])
    })

    it('adds the metadata of the file and null for unknown files', () => {
        const jobs = getJobs([queuedJob('1', 'a.gcode'), queuedJob('2', 'b.gcode')])

        expect(jobs[0].metadata).toBe(metadata)
        expect(jobs[1].metadata).toBeNull()
    })

    it('does not modify the queued jobs of the state', () => {
        const queued_jobs = [queuedJob('1', 'a.gcode'), queuedJob('2', 'a.gcode')]

        getJobs(queued_jobs)

        expect(queued_jobs).toEqual([queuedJob('1', 'a.gcode'), queuedJob('2', 'a.gcode')])
    })

    it('counts every queued job', () => {
        const state: ServerJobQueueState = {
            queued_jobs: [queuedJob('1', 'a.gcode'), queuedJob('2', 'a.gcode')],
            queue_state: 'paused',
        }

        expect(getters.jobsCount(state, {}, {} as RootState, {})).toBe(2)
    })
})
