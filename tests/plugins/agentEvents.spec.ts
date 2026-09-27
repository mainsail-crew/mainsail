import { describe, expect, it } from 'vitest'
import { resolveAgentEvent, type AgentRegistration } from '@/plugins/agentEvents'

const agents: readonly AgentRegistration[] = [
    {
        name: 'aldis',
        dispatch: 'server/firmware/init',
        eventDispatch: 'server/firmware/onAgentEvent',
    },
]

describe('resolveAgentEvent', () => {
    it('routes connected to the server store with the agent name', () => {
        expect(resolveAgentEvent({ agent: 'aldis', event: 'connected', data: {} }, agents)).toEqual({
            action: 'server/onAgentConnected',
            payload: 'aldis',
        })
    })

    it('routes disconnected to the server store with the agent name', () => {
        expect(resolveAgentEvent({ agent: 'other', event: 'disconnected' }, agents)).toEqual({
            action: 'server/onAgentDisconnected',
            payload: 'other',
        })
    })

    it('routes a registered agent event to its handler with the whole envelope', () => {
        const envelope = { agent: 'aldis', event: 'update_response', data: { run_id: 'r1' } }

        expect(resolveAgentEvent(envelope, agents)).toEqual({
            action: 'server/firmware/onAgentEvent',
            payload: envelope,
        })
    })

    it('drops events from unknown agents', () => {
        expect(resolveAgentEvent({ agent: 'other', event: 'update_response', data: {} }, agents)).toBeNull()
    })
})
