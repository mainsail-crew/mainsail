/**
 * System Administration RPC Interface
 *
 * These endpoints provide administrative functions for the host machine and operating system.
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/machine/
 */
export interface MachineRPC {
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
                release_info?: Record<string, string>
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
     * Commands the Operating System to shutdown.
     */
    'machine.shutdown': () => Promise<'ok'>

    /**
     * Commands the Operating System to reboot.
     */
    'machine.reboot': () => Promise<'ok'>

    /**
     * Restart a system service.
     */
    'machine.services.restart': (params: {
        /** The name of the service to restart */
        service: string
    }) => Promise<'ok'>

    /**
     * Stop a system service.
     */
    'machine.services.stop': (params: {
        /** The name of the service to stop */
        service: string
    }) => Promise<'ok'>

    /**
     * Start a system service.
     */
    'machine.services.start': (params: {
        /** The name of the service to start */
        service: string
    }) => Promise<'ok'>
}
