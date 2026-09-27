import { describe, expect, it } from 'vitest'
import { actions } from '@/store/socket/actions'

type Handler = (context: unknown, payload?: unknown) => unknown

describe('onOpen', () => {
    it('resets agent state before initialising the server, so a reconnect starts from a blank module', () => {
        const commits: string[] = []
        const dispatches: string[] = []
        const context = {
            commit: (type: string) => commits.push(type),
            dispatch: (type: string) => dispatches.push(type),
            rootState: {},
        }

        ;(actions.onOpen as Handler)(context)

        const resetIndex = dispatches.indexOf('server/resetAgents')
        const initIndex = dispatches.indexOf('server/init')

        expect(resetIndex).toBeGreaterThanOrEqual(0)
        expect(initIndex).toBeGreaterThanOrEqual(0)
        expect(resetIndex).toBeLessThan(initIndex)
    })
})
