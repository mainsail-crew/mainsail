import { beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import { getDefaultState, history } from '@/store/server/history'
import type { ServerHistoryState } from '@/store/server/history/types'
import type { HistoryJob, HistoryJobTotals } from '@/types/moonraker/HistoryRPC'
import { WebSocketClosedError } from '@/plugins/jsonRpcSocket'
import { rawJob } from './fixtures'

Vue.use(Vuex)

type Responder = (params: Record<string, unknown>) => unknown

const totals = (total_jobs: number): HistoryJobTotals => ({
    total_jobs,
    total_time: 10,
    total_print_time: 9,
    total_filament_used: 8,
    longest_job: 7,
    longest_print: 6,
})

/** Creates `count` jobs, newest first, like Moonraker returns them */
const createJobs = (count: number): HistoryJob[] =>
    Array.from({ length: count }, (_, index) => rawJob((count - index).toString(16).toUpperCase().padStart(6, '0')))

/** Responds to server.history.list like Moonraker with `start` and `limit` */
const listResponder =
    (jobs: HistoryJob[]): Responder =>
    (params) => {
        const start = (params.start as number) ?? 0
        const page = jobs.slice(start, start + ((params.limit as number) ?? 50))

        return { count: page.length, jobs: page }
    }

let responders: Record<string, Responder>
const emitAndWait = vi.fn(async (method: string, params: Record<string, unknown> = {}) => {
    const responder = responders[method]
    if (!responder) throw { code: -32601, message: `Method not found: ${method}` }

    return responder(params)
})
const windowStub = { console: { error: vi.fn(), debug: vi.fn() } }
const addFailedInitComponent = vi.fn()

const createStore = () =>
    new Store({
        actions: {
            'server/addFailedInitComponent': (_, component: string) => addFailedInitComponent(component),
        },
        modules: {
            history: { ...history, state: getDefaultState() },
        },
    })

const historyState = (store: Store<unknown>) => (store.state as { history: ServerHistoryState }).history

describe('server/history/actions', () => {
    beforeEach(() => {
        emitAndWait.mockClear()
        addFailedInitComponent.mockClear()
        windowStub.console.error.mockClear()
        Vue.$socket = { emitAndWait } as unknown as typeof Vue.$socket
        vi.stubGlobal('window', windowStub)

        responders = {
            'server.history.list': listResponder(createJobs(3)),
            'server.history.totals': () => ({ job_totals: totals(3), auxiliary_totals: [] }),
            'server.history.delete_job': (params) => ({ deleted_jobs: [params.uid] }),
            'server.database.get_item': () => ({
                namespace: 'history_notes',
                key: null,
                value: { '000002': { text: 'note 2' }, invalid: null },
            }),
            'server.database.post_item': (params) => params,
        }
    })

    it('loads jobs, notes and totals on init', async () => {
        const store = createStore()

        await store.dispatch('history/init')

        const state = historyState(store)
        expect(state.jobs.map((job) => job.job_id)).toEqual(['000003', '000002', '000001'])
        expect(state.jobs[1].note).toBe('note 2')
        expect('note' in state.jobs[0]).toBe(false)
        expect(state.job_totals).toEqual(totals(3))
        expect(state.all_loaded).toBe(true)
    })

    it('loads only the newest 100 jobs on init', async () => {
        responders['server.history.list'] = listResponder(createJobs(120))
        const store = createStore()

        await store.dispatch('history/init')

        const state = historyState(store)
        expect(state.jobs).toHaveLength(100)
        expect(state.all_loaded).toBe(false)
        expect(emitAndWait).toHaveBeenCalledWith('server.history.list', { start: 0, limit: 50 })
        expect(emitAndWait).toHaveBeenCalledWith('server.history.list', { start: 50, limit: 50 })
        expect(emitAndWait).not.toHaveBeenCalledWith('server.history.list', { start: 100, limit: 50 })
    })

    it('loads jobs without notes when the notes namespace does not exist', async () => {
        delete responders['server.database.get_item']
        const store = createStore()

        await store.dispatch('history/init')

        expect(historyState(store).jobs).toHaveLength(3)
        expect(addFailedInitComponent).not.toHaveBeenCalled()
    })

    it('reports a failed init component when Moonraker answers init with an error', async () => {
        responders['server.history.totals'] = () => {
            throw { code: 500, message: 'Internal error' }
        }
        const store = createStore()

        await expect(store.dispatch('history/init')).resolves.toBeUndefined()
        expect(windowStub.console.error).toHaveBeenCalled()
        expect(addFailedInitComponent).toHaveBeenCalledWith('history')
    })

    it('propagates non RPC errors on init to the caller', async () => {
        responders['server.history.list'] = () => {
            throw new WebSocketClosedError()
        }
        const store = createStore()

        await expect(store.dispatch('history/init')).rejects.toBeInstanceOf(WebSocketClosedError)
        expect(addFailedInitComponent).not.toHaveBeenCalled()
    })

    it('loads all jobs', async () => {
        responders['server.history.list'] = listResponder(createJobs(120))
        const store = createStore()
        await store.dispatch('history/init')

        await store.dispatch('history/loadAllJobs')

        const state = historyState(store)
        expect(state.jobs).toHaveLength(120)
        expect(state.all_loaded).toBe(true)
    })

    it('propagates errors when loading all jobs to the caller', async () => {
        responders['server.history.list'] = () => {
            throw { code: 500, message: 'Internal error' }
        }
        const store = createStore()

        await expect(store.dispatch('history/loadAllJobs')).rejects.toMatchObject({ code: 500 })
    })

    it('ignores jobs that are returned twice while paging', async () => {
        const jobs = createJobs(60)
        responders['server.history.list'] = (params) => {
            // a new job shifts the offset of the second page by one
            const list = params.start === 0 ? jobs : [rawJob('00003D'), ...jobs]
            return listResponder(list)(params)
        }
        const store = createStore()

        await store.dispatch('history/loadAllJobs')

        const ids = historyState(store).jobs.map((job) => job.job_id)
        expect(ids).toHaveLength(60)
        expect(new Set(ids).size).toBe(60)
    })

    it('prepends a new job on notify_history_changed without reloading the totals', async () => {
        const store = createStore()
        await store.dispatch('history/init')
        emitAndWait.mockClear()

        await store.dispatch('history/notifyHistoryChanged', {
            action: 'added',
            job: rawJob('000004', { status: 'in_progress', end_time: null }),
        })

        expect(historyState(store).jobs.map((job) => job.job_id)).toEqual(['000004', '000003', '000002', '000001'])
        expect(emitAndWait).not.toHaveBeenCalled()
    })

    it('updates a finished job on notify_history_changed and reloads the totals', async () => {
        const store = createStore()
        await store.dispatch('history/init')
        responders['server.history.totals'] = () => ({ job_totals: totals(4), auxiliary_totals: [] })

        await store.dispatch('history/notifyHistoryChanged', {
            action: 'finished',
            job: rawJob('000002', { status: 'cancelled' }),
        })

        const state = historyState(store)
        expect(state.jobs).toHaveLength(3)
        expect(state.jobs[1].status).toBe('cancelled')
        expect(state.jobs[1].note).toBe('note 2')
        expect(state.job_totals).toEqual(totals(4))
    })

    it('logs errors when the totals cannot be reloaded after a finished job', async () => {
        const store = createStore()
        responders['server.history.totals'] = () => {
            throw { code: 500, message: 'Internal error' }
        }

        await store.dispatch('history/notifyHistoryChanged', { action: 'finished', job: rawJob('000001') })

        expect(historyState(store).jobs).toHaveLength(1)
        expect(windowStub.console.error).toHaveBeenCalled()
    })

    it('deletes a job and removes it from the state', async () => {
        const store = createStore()
        await store.dispatch('history/init')

        await store.dispatch('history/deleteJob', '000002')

        expect(emitAndWait).toHaveBeenCalledWith('server.history.delete_job', { uid: '000002' })
        expect(historyState(store).jobs.map((job) => job.job_id)).toEqual(['000003', '000001'])
    })

    it('propagates delete errors to the caller and keeps the job', async () => {
        const store = createStore()
        await store.dispatch('history/init')
        responders['server.history.delete_job'] = () => {
            throw { code: -32601, message: 'Invalid job uid: 000002' }
        }

        await expect(store.dispatch('history/deleteJob', '000002')).rejects.toMatchObject({ code: -32601 })
        expect(historyState(store).jobs).toHaveLength(3)
    })

    it('saves a note in the database and the state', async () => {
        const store = createStore()
        await store.dispatch('history/init')

        await store.dispatch('history/saveNote', { job_id: '000001', note: 'new note' })

        expect(emitAndWait).toHaveBeenCalledWith('server.database.post_item', {
            namespace: 'history_notes',
            key: '000001',
            value: { text: 'new note' },
        })
        expect(historyState(store).jobs[2].note).toBe('new note')
    })

    it('propagates note errors to the caller and keeps the state', async () => {
        const store = createStore()
        await store.dispatch('history/init')
        responders['server.database.post_item'] = () => {
            throw { code: 500, message: 'Internal error' }
        }

        await expect(store.dispatch('history/saveNote', { job_id: '000001', note: 'x' })).rejects.toMatchObject({
            code: 500,
        })
        expect(historyState(store).jobs[2].note).toBeUndefined()
    })
})
