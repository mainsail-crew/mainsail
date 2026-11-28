import { beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import { getDefaultState, jobQueue } from '@/store/server/jobQueue'
import type { ServerJobQueueState } from '@/store/server/jobQueue/types'
import type { QueuedJob, QueueState } from '@/types/moonraker/JobQueueRPC'
import { WebSocketClosedError } from '@/plugins/jsonRpcSocket'
import { queuedJob } from './fixtures'

Vue.use(Vuex)

type Responder = (params: Record<string, unknown>) => unknown

/** Minimal fake of Moonraker's job queue */
let queue: QueuedJob[]
let queueState: QueueState
let nextId: number

const status = () => ({ queued_jobs: [...queue], queue_state: queueState })
const enqueue = (filenames: string[]) =>
    filenames.forEach((filename) => queue.push(queuedJob(String(nextId++), filename)))

let responders: Record<string, Responder>
const emitAndWait = vi.fn<(method: string, params?: Record<string, unknown>, options?: unknown) => Promise<unknown>>(
    async (method, params = {}) => {
        const responder = responders[method]
        if (!responder) throw { code: -32601, message: `Method not found: ${method}` }

        return responder(params)
    }
)
const windowStub = { console: { error: vi.fn(), debug: vi.fn() } }
const addFailedInitComponent = vi.fn()

const createStore = () =>
    new Store({
        actions: {
            'server/addFailedInitComponent': (_, component: string) => addFailedInitComponent(component),
        },
        modules: {
            files: { namespaced: true, getters: { getGcodeFile: () => () => null } },
            jobQueue: { ...jobQueue, state: getDefaultState() },
        },
    })

const jobQueueState = (store: Store<unknown>) => (store.state as { jobQueue: ServerJobQueueState }).jobQueue

const filenames = (store: Store<unknown>) => jobQueueState(store).queued_jobs.map((job) => job.filename)

/** Calls of a method, excluding the init request */
const callsOf = (method: string) => emitAndWait.mock.calls.filter((call) => call[0] === method)

describe('server/jobQueue/actions', () => {
    beforeEach(() => {
        emitAndWait.mockClear()
        addFailedInitComponent.mockClear()
        windowStub.console.error.mockClear()
        Vue.$socket = { emitAndWait } as unknown as typeof Vue.$socket
        vi.stubGlobal('window', windowStub)

        queue = []
        queueState = 'paused'
        nextId = 1
        enqueue(['a.gcode', 'a.gcode', 'b.gcode', 'c.gcode'])

        responders = {
            'server.job_queue.status': () => status(),
            'server.job_queue.post_job': (params) => {
                if (params.reset) queue = []
                enqueue(params.filenames as string[])
                return status()
            },
            'server.job_queue.delete_job': (params) => {
                const jobIds = params.job_ids as string[]
                queue = queue.filter((job) => !jobIds.includes(job.job_id))
                return status()
            },
            'server.job_queue.start': () => {
                queueState = 'loading'
                return status()
            },
            'server.job_queue.pause': () => {
                queueState = 'paused'
                return status()
            },
        }
    })

    describe('init', () => {
        it('loads the queue status', async () => {
            const store = createStore()

            await store.dispatch('jobQueue/init')

            expect(filenames(store)).toEqual(['a.gcode', 'a.gcode', 'b.gcode', 'c.gcode'])
            expect(jobQueueState(store).queue_state).toBe('paused')
        })

        it('reports a failed init component when Moonraker answers with an error', async () => {
            responders = {}
            const store = createStore()

            await expect(store.dispatch('jobQueue/init')).resolves.toBeUndefined()
            expect(jobQueueState(store).queue_state).toBeNull()
            expect(windowStub.console.error).toHaveBeenCalled()
            expect(addFailedInitComponent).toHaveBeenCalledWith('job_queue')
        })

        it('propagates non RPC errors to the caller', async () => {
            responders['server.job_queue.status'] = () => {
                throw new WebSocketClosedError()
            }
            const store = createStore()

            await expect(store.dispatch('jobQueue/init')).rejects.toBeInstanceOf(WebSocketClosedError)
            expect(addFailedInitComponent).not.toHaveBeenCalled()
        })
    })

    describe('notifyJobQueueChanged', () => {
        it('updates only the queue state without an updated queue', async () => {
            const store = createStore()
            await store.dispatch('jobQueue/init')

            await store.dispatch('jobQueue/notifyJobQueueChanged', {
                action: 'state_changed',
                updated_queue: null,
                queue_state: 'ready',
            })

            expect(filenames(store)).toEqual(['a.gcode', 'a.gcode', 'b.gcode', 'c.gcode'])
            expect(jobQueueState(store).queue_state).toBe('ready')
        })

        it('replaces the queue with the updated queue', async () => {
            const store = createStore()
            await store.dispatch('jobQueue/init')

            await store.dispatch('jobQueue/notifyJobQueueChanged', {
                action: 'job_loaded',
                updated_queue: [queuedJob('9', 'd.gcode')],
                queue_state: 'paused',
            })

            expect(filenames(store)).toEqual(['d.gcode'])
        })
    })

    describe('user actions', () => {
        it('adds jobs and applies the response', async () => {
            const store = createStore()
            await store.dispatch('jobQueue/init')

            await store.dispatch('jobQueue/addJobs', ['d.gcode', 'd.gcode'])

            expect(callsOf('server.job_queue.post_job')[0][1]).toEqual({ filenames: ['d.gcode', 'd.gcode'] })
            expect(filenames(store)).toEqual(['a.gcode', 'a.gcode', 'b.gcode', 'c.gcode', 'd.gcode', 'd.gcode'])
        })

        it('deletes jobs', async () => {
            const store = createStore()
            await store.dispatch('jobQueue/init')

            await store.dispatch('jobQueue/deleteJobs', ['1', '2'])

            expect(callsOf('server.job_queue.delete_job')[0][1]).toEqual({ job_ids: ['1', '2'] })
            expect(filenames(store)).toEqual(['b.gcode', 'c.gcode'])
        })

        it('changes the count of a combined job', async () => {
            const store = createStore()
            await store.dispatch('jobQueue/init')

            await store.dispatch('jobQueue/setJobCount', { job_id: '3', count: 3 })

            expect(callsOf('server.job_queue.post_job')[0][1]).toEqual({
                filenames: ['a.gcode', 'a.gcode', 'b.gcode', 'b.gcode', 'b.gcode', 'c.gcode'],
                reset: true,
            })
            expect(filenames(store)).toEqual(['a.gcode', 'a.gcode', 'b.gcode', 'b.gcode', 'b.gcode', 'c.gcode'])
        })

        it('rejects an invalid count', async () => {
            const store = createStore()
            await store.dispatch('jobQueue/init')

            await expect(store.dispatch('jobQueue/setJobCount', { job_id: '1', count: 0 })).rejects.toBeInstanceOf(
                RangeError
            )
            expect(callsOf('server.job_queue.post_job')).toHaveLength(0)
        })

        it('ignores unknown job ids', async () => {
            const store = createStore()
            await store.dispatch('jobQueue/init')

            await store.dispatch('jobQueue/setJobCount', { job_id: 'unknown', count: 2 })
            await store.dispatch('jobQueue/startJob', 'unknown')

            expect(emitAndWait).toHaveBeenCalledTimes(1)
        })

        it('moves a combined job', async () => {
            const store = createStore()
            await store.dispatch('jobQueue/init')
            const jobsBefore = store.getters['jobQueue/jobs']

            await store.dispatch('jobQueue/moveJob', { oldIndex: 0, newIndex: 2 })

            expect(filenames(store)).toEqual(['b.gcode', 'c.gcode', 'a.gcode', 'a.gcode'])
            // the previous getter result must not be modified
            expect(jobsBefore.map((job: { filename: string }) => job.filename)).toEqual([
                'a.gcode',
                'b.gcode',
                'c.gcode',
            ])
        })

        it('moves a combined job to the front and starts the queue', async () => {
            const store = createStore()
            await store.dispatch('jobQueue/init')

            await store.dispatch('jobQueue/startJob', '4')

            expect(filenames(store)).toEqual(['c.gcode', 'a.gcode', 'a.gcode', 'b.gcode'])
            expect(emitAndWait.mock.calls.map((call) => call[0])).toEqual([
                'server.job_queue.status',
                'server.job_queue.post_job',
                'server.job_queue.start',
            ])
            expect(jobQueueState(store).queue_state).toBe('loading')
        })

        it('starts and pauses the queue with a loading indicator', async () => {
            const store = createStore()
            await store.dispatch('jobQueue/init')

            await store.dispatch('jobQueue/start')
            expect(jobQueueState(store).queue_state).toBe('loading')
            expect(callsOf('server.job_queue.start')[0][2]).toEqual({ loading: 'startJobqueue' })

            await store.dispatch('jobQueue/pause')
            expect(jobQueueState(store).queue_state).toBe('paused')
            expect(callsOf('server.job_queue.pause')[0][2]).toEqual({ loading: 'pauseJobqueue' })
        })

        it('propagates errors to the caller and keeps the state', async () => {
            const store = createStore()
            await store.dispatch('jobQueue/init')
            responders['server.job_queue.post_job'] = () => {
                throw { code: 400, message: 'G-Code File d.gcode does not exist' }
            }

            await expect(store.dispatch('jobQueue/addJobs', ['d.gcode'])).rejects.toMatchObject({ code: 400 })
            expect(filenames(store)).toEqual(['a.gcode', 'a.gcode', 'b.gcode', 'c.gcode'])
        })
    })
})
