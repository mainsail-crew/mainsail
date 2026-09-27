import Vue from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { agentActions } from '@/store/server/agentActions'
import { getters } from '@/store/server/getters'

type Handler = (context: unknown, payload?: unknown) => unknown

const makeContext = (agents: string[] = []) => {
    const state = { agents: [...agents], agentsLoaded: false }
    const commits: [string, unknown][] = []
    const dispatches: [string, unknown][] = []
    const context = {
        state,
        commit: (type: string, payload?: unknown) => {
            commits.push([type, payload])
            if (type === 'setAgents') state.agents = [...(payload as string[])]
            if (type === 'addAgent' && !state.agents.includes(payload as string)) state.agents.push(payload as string)
            if (type === 'removeAgent') state.agents = state.agents.filter((name) => name !== payload)
            if (type === 'setAgentsLoaded') state.agentsLoaded = payload as boolean
        },
        dispatch: (type: string, payload?: unknown) => {
            dispatches.push([type, payload])
            const local = agentActions[type.replace(/^server\//, '')] as Handler | undefined
            return local ? local(context, payload) : undefined
        },
    }

    return { state, context, commits, dispatches }
}

const run = (name: string, context: unknown, payload?: unknown) => (agentActions[name] as Handler)(context, payload)

describe('server agent layer', () => {
    const emit = vi.fn()

    beforeEach(() => {
        // Mainsail logs through window.console; Vitest runs in Node, which has no window.
        vi.stubGlobal('window', { console })
        emit.mockReset()
        Vue.$socket = { emit } as unknown as typeof Vue.$socket
    })

    it('stores the agent list and initialises connected registered agents', async () => {
        const { state, context, dispatches } = makeContext()

        await run('initExtensions', context, { agents: [{ name: 'aldis' }, { name: 'other' }] })

        expect(state.agents).toEqual(['aldis', 'other'])
        expect(state.agentsLoaded).toBe(true)
        expect(dispatches).toContainEqual(['server/firmware/init', null])
    })

    it('initialises nothing when the list is empty', async () => {
        const { context, dispatches } = makeContext()
        await run('initExtensions', context, {})
        expect(dispatches.map(([type]) => type)).not.toContain('server/firmware/init')
    })

    it('adds a connected agent and initialises it', async () => {
        const { state, context, dispatches } = makeContext()
        await run('onAgentConnected', context, 'aldis')
        expect(state.agents).toEqual(['aldis'])
        expect(dispatches).toContainEqual(['server/firmware/init', null])
    })

    it('removes a disconnected agent and notifies its module', async () => {
        const { state, context, dispatches } = makeContext(['aldis'])
        await run('onAgentDisconnected', context, 'aldis')
        expect(state.agents).toEqual([])
        expect(dispatches).toContainEqual(['server/firmware/onAgentDisconnected', null])
    })

    it('routes agent events through the resolver and drops unknown agents', async () => {
        const { context, dispatches } = makeContext(['aldis'])
        const envelope = { agent: 'aldis', event: 'update_response', data: {} }

        await run('onAgentEvent', context, envelope)
        await run('onAgentEvent', context, { agent: 'nobody', event: 'update_response' })

        expect(dispatches).toContainEqual(['server/firmware/onAgentEvent', envelope])
        expect(dispatches.filter(([type]) => type === 'server/firmware/onAgentEvent')).toHaveLength(1)
    })

    it('routes connected events to onAgentConnected', async () => {
        const { state, context } = makeContext()
        await run('onAgentEvent', context, { agent: 'aldis', event: 'connected', data: {} })
        expect(state.agents).toEqual(['aldis'])
    })

    it('tells connected agents about Klippy state changes', async () => {
        const connected = makeContext(['aldis'])
        await run('notifyAgentsKlippyState', connected.context)
        expect(connected.dispatches).toContainEqual(['server/firmware/onKlippyStateChanged', null])

        const absent = makeContext()
        await run('notifyAgentsKlippyState', absent.context)
        expect(absent.dispatches).toEqual([])
    })

    it('resets the agent list and every agent module', async () => {
        const { state, context, dispatches } = makeContext(['aldis'])
        await run('resetAgents', context)
        expect(state.agents).toEqual([])
        expect(state.agentsLoaded).toBe(false)
        expect(dispatches).toContainEqual(['server/firmware/reset', null])
    })

    it('re-requests the agent list on refresh', async () => {
        const { context } = makeContext()
        await run('refreshAgents', context)
        expect(emit).toHaveBeenCalledWith('server.extensions.list', {}, { action: 'server/initExtensions' })
    })

    it('answers agentSupport from the agent list', () => {
        const agentSupport = (getters.agentSupport as (state: unknown) => (name: string) => boolean)({
            agents: ['aldis'],
        })
        expect(agentSupport('aldis')).toBe(true)
        expect(agentSupport('other')).toBe(false)
    })
})
