/**
 * Server Administration RPC Interface
 *
 * These endpoints provide access to server status, data tracking, and administrative requests.
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/server/
 */
export interface ServerRPC {
    /**
     * Get the current Moonraker configuration.
     * Returns the full configuration including all components.
     */
    'server.config': () => Promise<{
        /** An object containing the full Moonraker configuration */
        config: Record<string, Record<string, unknown>>
        /** An object containing the original configuration as read from config files */
        orig: Record<string, Record<string, string>>
        /** An array of file objects describing the config files parsed */
        files: Array<{
            /** The name of the configuration file (relative path) */
            filename: string
            /** The config sections parsed from this file */
            sections: string[]
        }>
    }>

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

    /**
     * Query Moonraker server information.
     * Returns details about the server state, loaded components, and version info.
     */
    'server.info': () => Promise<{
        /** Reports if the Klippy unix domain socket is connected */
        klippy_connected: boolean
        /** Reports the current state of Klippy */
        klippy_state: 'ready' | 'startup' | 'shutdown' | 'error' | 'disconnected'
        /** A list of components that are currently loaded in Moonraker */
        components: string[]
        /** A list of components that failed to load in Moonraker */
        failed_components: string[]
        /** A list of directories that Moonraker has registered */
        registered_directories: string[]
        /** A list of warnings that Moonraker has generated */
        warnings: string[]
        /** The number of websocket connections that Moonraker is currently serving */
        websocket_count: number
        /** The full version of Moonraker that is currently running */
        moonraker_version: string
        /** The version of the Moonraker API in tuple format */
        api_version: [number, number, number]
        /** The version of the Moonraker API as string */
        api_version_string: string
    }>
}
