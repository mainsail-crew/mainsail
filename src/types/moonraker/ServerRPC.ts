/**
 * Server Administration RPC Interface
 *
 * These endpoints provide access to server status, data tracking, and administrative requests.
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/server/
 */
export interface ServerRPC {
    /**
     * Identify the client connection to Moonraker.
     * This should be called immediately after the websocket connection is established.
     */
    'server.connection.identify': (params: {
        /** The name of your client (e.g., 'Mainsail', 'Fluidd', 'KlipperScreen') */
        client_name: string
        /** The current version of the connected client */
        version: string
        /** Application type */
        type: 'web' | 'mobile' | 'desktop' | 'display' | 'bot' | 'agent' | 'other'
        /** The URL for your client's homepage */
        url: string
        /** Optional JWT for user authentication */
        access_token?: string
        /** Optional system API key for clients without user authentication */
        api_key?: string
    }) => Promise<{
        /** The connection's unique identifier */
        connection_id: number
    }>
}
