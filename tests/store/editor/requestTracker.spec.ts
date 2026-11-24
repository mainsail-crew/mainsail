import { describe, expect, it } from 'vitest'
import { RequestTracker } from '@/store/editor/requestTracker'

describe('RequestTracker', () => {
    it('starts a request and marks it as active/current', () => {
        const tracker = new RequestTracker()
        const controller = tracker.start('download')

        expect(tracker.isCurrent('download', controller)).toBe(true)
        expect(controller.signal.aborted).toBe(false)
    })

    it('aborts the previous request of the same type on start', () => {
        const tracker = new RequestTracker()
        const first = tracker.start('download')
        const second = tracker.start('download')

        expect(first.signal.aborted).toBe(true)
        expect(second.signal.aborted).toBe(false)
        expect(tracker.isCurrent('download', first)).toBe(false)
        expect(tracker.isCurrent('download', second)).toBe(true)
    })

    it('does not affect requests of other types on start', () => {
        const tracker = new RequestTracker()
        const upload = tracker.start('upload')
        tracker.start('download')

        expect(upload.signal.aborted).toBe(false)
    })

    it('finish() only removes the current request', () => {
        const tracker = new RequestTracker()
        const stale = tracker.start('download')
        const current = tracker.start('download')

        expect(tracker.finish('download', stale)).toBe(false)
        expect(tracker.finish('download', current)).toBe(true)
        expect(tracker.isCurrent('download', current)).toBe(false)
        expect(tracker.finish('download', current)).toBe(false)
        expect(current.signal.aborted).toBe(false)
    })

    it('abort() aborts and removes a single type', () => {
        const tracker = new RequestTracker()
        const download = tracker.start('download')
        const upload = tracker.start('upload')

        tracker.abort('download')

        expect(download.signal.aborted).toBe(true)
        expect(upload.signal.aborted).toBe(false)
        expect(tracker.isCurrent('download', download)).toBe(false)
        expect(tracker.isCurrent('upload', upload)).toBe(true)
    })

    it('abort() on an unknown type is a no-op', () => {
        const tracker = new RequestTracker()
        expect(() => tracker.abort('upload')).not.toThrow()
    })
})
