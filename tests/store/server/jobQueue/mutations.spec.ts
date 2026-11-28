import { describe, expect, it } from 'vitest'
import { mutations } from '@/store/server/jobQueue/mutations'
import { getDefaultState } from '@/store/server/jobQueue'
import { queuedJob } from './fixtures'

describe('server/jobQueue/mutations', () => {
    it('starts without jobs and an unknown queue state', () => {
        const state = getDefaultState()

        expect(state.queued_jobs).toEqual([])
        expect(state.queue_state).toBeNull()
    })

    it('sets the jobs and the queue state', () => {
        const state = getDefaultState()
        const queued_jobs = [queuedJob('1', 'a.gcode')]

        mutations.setStatus(state, { queued_jobs, queue_state: 'ready' })

        expect(state.queued_jobs).toBe(queued_jobs)
        expect(state.queue_state).toBe('ready')
    })

    it('sets only the queue state and keeps the jobs', () => {
        const state = getDefaultState()
        const queued_jobs = [queuedJob('1', 'a.gcode')]
        mutations.setStatus(state, { queued_jobs, queue_state: 'ready' })

        mutations.setQueueState(state, 'paused')

        expect(state.queued_jobs).toBe(queued_jobs)
        expect(state.queue_state).toBe('paused')
    })

    it('resets the state', () => {
        const state = getDefaultState()
        mutations.setStatus(state, { queued_jobs: [queuedJob('1', 'a.gcode')], queue_state: 'ready' })

        mutations.reset(state, undefined)

        expect(state).toEqual(getDefaultState())
    })
})
