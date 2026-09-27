import type { MoonrakerAgentEvent } from '@/store/server/types'

export interface AgentRegistration {
    name: string
    /** Action that initialises this agent's module. Must be idempotent: dispatched on every
     *  server.extensions.list response and every `connected` event for an already-initialised agent. */
    dispatch: string
    eventDispatch: string
    disconnectDispatch?: string
    klippyDispatch?: string
    resetDispatch?: string
}

export interface AgentEventTarget {
    action: string
    payload: unknown
}

export const resolveAgentEvent = (
    event: MoonrakerAgentEvent,
    agents: readonly AgentRegistration[]
): AgentEventTarget | null => {
    if (event.event === 'connected') return { action: 'server/onAgentConnected', payload: event.agent }
    if (event.event === 'disconnected') return { action: 'server/onAgentDisconnected', payload: event.agent }

    const agent = agents.find((registration) => registration.name === event.agent)

    return agent ? { action: agent.eventDispatch, payload: event } : null
}
