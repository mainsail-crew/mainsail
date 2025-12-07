/**
 * Moonraker JSON-RPC Interface
 *
 * This interface defines all available RPC methods for the Moonraker API.
 * Each method is strictly typed with its parameters and return type.
 *
 * To add a new method:
 * 1. Add the method signature to the MoonrakerRPCInterface
 * 2. Define the parameter type (use empty parameter list `()` for methods without parameters)
 * 3. Define the return type wrapped in Promise<>
 *
 * @example
 * 'method.name': (params: { param1: string }) => Promise<{ result: boolean }>
 * 'method.without.params': () => Promise<{ data: string[] }>
 */
export interface MoonrakerRPCInterface {
    /**
     * Identify the client connection to Moonraker.
     * This should be called immediately after the websocket connection is established.
     */
    'server.connection.identify': (params: {
        /** The name of your client (e.g., 'mainsail', 'fluidd') */
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
     * Lists all database namespaces and backup files.
     */
    'server.database.list': (params?: {
        /** The root namespace to list (optional) */
        root?: string
    }) => Promise<{
        /** An array of namespaces registered with the database */
        namespaces: string[]
        /** An array of database backup filenames */
        backups: string[]
    }>

    /**
     * Get system information about the host machine.
     */
    'machine.system_info': () => Promise<{
        /** System information object */
        system_info: {
            /** The configured system provider type */
            provider: string
            /** CPU information */
            cpu_info: {
                cpu_count: number | null
                bits: string
                processor: string
                cpu_desc: string
                serial_number: string
                hardware_desc: string
                model: string
                total_memory: number | null
                memory_units: string
            }
            /** SD Card information (empty object if not detected) */
            sd_info: Record<string, unknown>
            /** Linux distribution information */
            distribution: {
                name: string
                id: string
                version: string
                version_parts: {
                    major: string
                    minor: string
                    build_number: string
                }
                like: string
                codename: string
            }
            /** List of available services */
            available_services: string[]
            /** Instance IDs mapping */
            instance_ids: Record<string, string>
            /** Service state information */
            service_state: Record<
                string,
                {
                    active_state: string
                    sub_state: string
                }
            >
            /** Virtualization information */
            virtualization: {
                virt_type: string
                virt_identifier: string
            }
            /** Python interpreter information */
            python: {
                version: (number | string)[]
                version_string: string
            }
            /** Network interface information */
            network: Record<
                string,
                {
                    mac_address: string
                    ip_addresses: Array<{
                        family: 'ipv4' | 'ipv6'
                        address: string
                        is_link_local: boolean
                    }>
                }
            >
            /** CAN bus interface information */
            canbus: Record<
                string,
                {
                    tx_queue_len: number
                    bitrate: number
                    driver: string
                }
            >
        }
    }>

    /**
     * Get process statistics including CPU, memory, and network usage.
     */
    'machine.proc_stats': () => Promise<{
        /** Array of Moonraker process statistics samples */
        moonraker_stats: Array<{
            time: number
            cpu_usage: number
            memory: number | null
            mem_units: string | null
        }>
        /** CPU throttle state (Raspberry Pi only, null on other hardware) */
        throttled_state: {
            bits: number
            flags: string[]
        } | null
        /** Current CPU temperature (null if unavailable) */
        cpu_temp: number | null
        /** Network usage per interface */
        network: Record<
            string,
            {
                rx_bytes: number
                tx_bytes: number
                bandwidth: number
            }
        >
        /** CPU usage per core */
        system_cpu_usage: Record<string, number>
        /** System memory usage */
        system_memory?: {
            total: number
            available: number
            used: number
        }
        /** Time in seconds since system boot */
        system_uptime: number
        /** Number of active websocket connections */
        websocket_connections: number
    }>

    /**
     * Returns a list of all available printer objects.
     */
    'printer.objects.list': () => Promise<{
        /** Array of available printer object names */
        objects: string[]
    }>

    /**
     * Subscribe to printer object updates.
     * The objects parameter specifies which objects and attributes to subscribe to.
     * Use `null` to subscribe to all attributes of an object.
     */
    'printer.objects.subscribe': (params: {
        /** Object names mapped to arrays of attribute names (or null for all attributes) */
        objects: Record<string, string[] | null>
    }) => Promise<{
        /** The time at which the status was received, according Klipper's monotonic clock */
        eventtime: number
        /** Current status of all subscribed objects */
        status: Record<string, unknown>
    }>

    /**
     * Query printer object status.
     * Returns the current values of the specified objects and attributes.
     */
    'printer.objects.query': (params: {
        /** Object names mapped to arrays of attribute names (or null for all attributes) */
        objects: Record<string, string[] | null>
    }) => Promise<{
        /** The time at which the status was received, according Klipper's monotonic clock */
        eventtime: number
        /** Current status of all queried objects */
        status: Record<string, unknown>
    }>
}

/**
 * Union type of all available RPC method names.
 * This is used to strictly type the method parameter in emitAndWait.
 */
export type RPCMethods = keyof MoonrakerRPCInterface

/**
 * Helper type to extract parameters from an RPC method.
 * Returns `undefined` for methods without parameters.
 */
export type RPCParams<M extends RPCMethods> =
    Parameters<MoonrakerRPCInterface[M]> extends [] ? undefined : Parameters<MoonrakerRPCInterface[M]>[0]

/**
 * Helper type to extract the return type from an RPC method.
 */
export type RPCResult<M extends RPCMethods> = Awaited<ReturnType<MoonrakerRPCInterface[M]>>
