import { beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import {
    addNotes,
    fetchJobPages,
    fetchNotes,
    getFileKey,
    parseNotes,
    pushToIndex,
} from '@/store/server/history/helpers'
import type { ServerHistoryStateJob } from '@/store/server/history/types'
import { rawJob } from './fixtures'

const emitAndWait = vi.fn()

describe('server/history/helpers', () => {
    beforeEach(() => {
        emitAndWait.mockReset()
        Vue.$socket = { emitAndWait } as unknown as typeof Vue.$socket
    })

    it('parses notes and skips invalid entries', () => {
        const value = { '000001': { text: 'note' }, '000002': null, '000003': { text: 5 }, '000004': 'text' }

        expect(parseNotes(value)).toEqual({ '000001': 'note' })
    })

    it('returns no notes for an invalid namespace value', () => {
        expect(parseNotes(null)).toEqual({})
        expect(parseNotes('notes')).toEqual({})
    })

    it('adds notes only to jobs with a note', () => {
        const jobs = addNotes([rawJob('1'), rawJob('2')], { '2': 'note' })

        expect('note' in jobs[0]).toBe(false)
        expect(jobs[1].note).toBe('note')
    })

    it('loads the notes from the database', async () => {
        emitAndWait.mockResolvedValue({ namespace: 'history_notes', key: null, value: { '1': { text: 'note' } } })

        await expect(fetchNotes()).resolves.toEqual({ '1': 'note' })
        expect(emitAndWait).toHaveBeenCalledWith('server.database.get_item', { namespace: 'history_notes' })
    })

    it('returns no notes when the namespace does not exist', async () => {
        emitAndWait.mockRejectedValue({ code: -32601, message: "Namespace 'history_notes' not found" })

        await expect(fetchNotes()).resolves.toEqual({})
    })

    it('propagates other errors while loading the notes', async () => {
        emitAndWait.mockRejectedValue({ code: 500, message: 'Internal error' })

        await expect(fetchNotes()).rejects.toMatchObject({ code: 500 })
    })

    it('stops loading pages at max', async () => {
        emitAndWait.mockImplementation(async (_method: string, params: { start: number; limit: number }) => ({
            count: params.limit,
            jobs: Array.from({ length: params.limit }, (_, index) => rawJob(String(params.start + index))),
        }))

        const result = await fetchJobPages(100)

        expect(result.jobs).toHaveLength(100)
        expect(result.allLoaded).toBe(false)
        expect(emitAndWait).toHaveBeenCalledTimes(2)
    })

    it('marks all jobs as loaded after a page that is not full', async () => {
        emitAndWait.mockResolvedValue({ count: 2, jobs: [rawJob('2'), rawJob('1')] })

        const result = await fetchJobPages(null)

        expect(result.jobs.map((job) => job.job_id)).toEqual(['2', '1'])
        expect(result.allLoaded).toBe(true)
    })

    it('groups jobs with the same key in the index', () => {
        const index = new Map<string, ServerHistoryStateJob[]>()
        const key = getFileKey(10, 1000)

        pushToIndex(index, key, rawJob('1'))
        pushToIndex(index, key, rawJob('2'))

        expect(key).toBe('10-1000')
        expect(index.get(key)?.map((job) => job.job_id)).toEqual(['1', '2'])
    })
})
