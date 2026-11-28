import { describe, expect, it } from 'vitest'
import { mutations } from '@/store/server/history/mutations'
import { getDefaultState } from '@/store/server/history'
import type { ServerHistoryState } from '@/store/server/history/types'
import { rawJob } from './fixtures'

const createState = (): ServerHistoryState => {
    const state = getDefaultState()
    mutations.setJobs(state, [{ ...rawJob('2'), note: 'note' }, rawJob('1')])

    return state
}

describe('server/history/mutations', () => {
    it('prepends a new job', () => {
        const state = createState()

        mutations.setJob(state, rawJob('3'))

        expect(state.jobs.map((job) => job.job_id)).toEqual(['3', '2', '1'])
    })

    it('replaces an existing job, keeps its note and does not mutate the old object', () => {
        const state = createState()
        const oldJob = state.jobs[0]

        mutations.setJob(state, rawJob('2', { status: 'cancelled' }))

        expect(state.jobs[0]).toMatchObject({ job_id: '2', status: 'cancelled', note: 'note' })
        expect(oldJob.status).toBe('completed')
    })

    it('removes jobs by their ids', () => {
        const state = createState()

        mutations.removeJobs(state, ['2', 'unknown'])

        expect(state.jobs.map((job) => job.job_id)).toEqual(['1'])
    })

    it('sets the note of a job without mutating the old object', () => {
        const state = createState()
        const oldJob = state.jobs[1]

        mutations.setJobNote(state, { job_id: '1', note: 'new' })

        expect(state.jobs[1].note).toBe('new')
        expect(oldJob.note).toBeUndefined()
    })

    it('ignores notes of unknown jobs', () => {
        const state = createState()

        mutations.setJobNote(state, { job_id: 'unknown', note: 'new' })

        expect(state.jobs.map((job) => job.note)).toEqual(['note', undefined])
    })

    it('sets the totals', () => {
        const state = createState()
        const job_totals = { ...state.job_totals, total_jobs: 5 }
        const auxiliary_totals = [{ provider: 'sensor', field: 'energy', maximum: 1, total: 2 }]

        mutations.setTotals(state, { job_totals, auxiliary_totals })

        expect(state.job_totals).toEqual(job_totals)
        expect(state.auxiliary_totals).toEqual(auxiliary_totals)
    })

    it('resets the state', () => {
        const state = createState()
        mutations.setAllLoaded(state, true)

        mutations.reset(state, undefined)

        expect(state).toEqual(getDefaultState())
    })
})
