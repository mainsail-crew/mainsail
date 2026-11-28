import { JsonRpcSocket, JsonRpcSocketHandlers } from '@/plugins/jsonRpcSocket'

const MAX_RECONNECTS = 2
const RECONNECT_INTERVAL = 1000
// Moonraker broadcasts notify_proc_stat_update every second, so 10s without a message means the connection is dead.
const HEARTBEAT_TIMEOUT = 10000

/**
 * One JsonRpcSocket per farm printer, keyed by the printer id (= module namespace).
 *
 * Kept outside of Vuex state: a WebSocket is not serializable and doesn't need reactivity.
 */
const clients = new Map<string, JsonRpcSocket>()

export const getFarmClient = (id: string): JsonRpcSocket | null => clients.get(id) ?? null

/** Creates a new client for the printer. An existing client with the same id is destroyed first. */
export const createFarmClient = (id: string, url: string, handlers: JsonRpcSocketHandlers): JsonRpcSocket => {
    destroyFarmClient(id)

    const client = new JsonRpcSocket(
        {
            url,
            maxReconnects: MAX_RECONNECTS,
            reconnectInterval: RECONNECT_INTERVAL,
            heartbeatTimeout: HEARTBEAT_TIMEOUT,
        },
        handlers
    )
    clients.set(id, client)

    return client
}

/** Closes the connection (incl. pending reconnect timers) and removes the client. */
export const destroyFarmClient = (id: string): void => {
    const client = clients.get(id)
    if (!client) return

    clients.delete(id)
    client.close()
}
