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
                rx_packets: number
                tx_packets: number
                rx_errs: number
                tx_errs: number
                rx_drop: number
                tx_drop: number
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

    /**
     * Retrieves sudo information status.
     * Optionally checks if Moonraker has permission to run commands as root.
     */
    'machine.sudo.info': (params?: {
        /** When true, Moonraker will attempt to run a sudo command to check if sudo permission is available */
        check_access?: boolean
    }) => Promise<{
        /** The result of a requested sudo permission check. Null if check was not requested. */
        sudo_access: boolean | null
        /** The name of the linux user the Moonraker process belongs to */
        linux_user: string
        /** True if an internal Moonraker component has requested a sudo password */
        sudo_requested: boolean
        /** Descriptions of sudo access requests from internal components */
        request_messages: string[]
    }>

    /**
     * Sets the sudo password currently used by Moonraker.
     * The password is not persistent across Moonraker restarts.
     */
    'machine.sudo.password': (params: {
        /** The linux user password necessary to grant Moonraker sudo permission */
        password: string
    }) => Promise<{
        /** Responses from components that processed sudo requests */
        sudo_responses: string[]
        /** True if a processed sudo request intends to restart Moonraker */
        is_restarting: boolean
    }>

    /**
     * Returns a list of all USB devices currently detected on the system.
     */
    'machine.peripherals.usb': () => Promise<{
        /** Array of USB device objects */
        usb_devices: Array<UsbDevice>
    }>

    /**
     * Returns a list of all serial devices detected on the system.
     * These may be USB CDC-ACM devices or hardware UARTs.
     */
    'machine.peripherals.serial': () => Promise<{
        /** Array of serial device objects */
        serial_devices: SerialDevice[]
    }>

    /**
     * Retrieves a list of V4L2 video capture devices on the system.
     * Also returns libcamera devices if python3-libcamera is installed.
     */
    'machine.peripherals.video': () => Promise<{
        /** Array of V4L2 device objects */
        v4l2_devices: V4l2Device[]
        /** Array of libcamera device objects */
        libcamera_devices: LibcameraDevice[]
    }>

    /**
     * Queries the provided canbus interface for unassigned Klipper or Katapult node IDs.
     */
    'machine.peripherals.canbus': (params?: {
        /** The cansocket interface to query (default: 'can0') */
        interface?: string
    }) => Promise<{
        /** Array of discovered CAN UUID objects */
        can_uuids: CanDevice[]
    }>
}

/**
 * USB device reported by Moonraker.
 */
export interface UsbDevice {
    /** The USB bus number as reported by the host. */
    bus_num: number
    /** The USB device number as reported by the host. */
    device_num: number
    /** Unique location identifier derived from the USB bus and device number. */
    usb_location: string
    /** Vendor ID reported by the driver. */
    vendor_id: string
    /** Product ID reported by the driver. */
    product_id: string
    /** Manufacturer name reported by the driver, or `null` if unavailable. */
    manufacturer: string | null
    /** Product name reported by the driver, or `null` if unavailable. */
    product: string | null
    /** Serial reported by the driver, or `null` if unavailable. */
    serial: string | null
    /** Class description reported by the driver, or `null` if unavailable. */
    class: string | null
    /** Subclass description reported by the driver, or `null` if unavailable. */
    subclass: string | null
    /** Protocol description reported by the driver, or `null` if unavailable. */
    protocol: string | null
    /** Full device description from `usb.ids`, or `null` if unavailable. */
    description: string | null
}

/**
 * Serial device reported by Moonraker.
 */
export interface SerialDevice {
    /** Device type. Usually a USB serial adapter or a hardware UART. */
    device_type: 'hardware_uart' | 'usb'
    /** Absolute path to the device node. */
    device_path: string
    /** Device file name as reported by sysfs. */
    device_name: string
    /** Driver name bound to the device. */
    driver_name: string
    /** Stable path derived from the physical connection, or `null` if unavailable. */
    path_by_hardware: string | null
    /** Stable path derived from device identifiers, or `null` if unavailable. */
    path_by_id: string | null
    /** Matching USB location identifier, or `null` for non-USB devices. */
    usb_location: string | null
}

/**
 * V4L2 video mode reported by Moonraker.
 */
export interface V4l2Mode {
    /** Pixel format in V4L2 fourcc format. */
    format: string
    /** Driver-provided mode description. */
    description: string
    /** Additional mode flags such as `COMPRESSED` or `EMULATED`. */
    flags: string[]
    /** Discrete supported resolutions formatted as `<WIDTH>x<HEIGHT>`. */
    resolutions: string[]
}

/**
 * V4L2 video capture device reported by Moonraker.
 */
export interface V4l2Device {
    /** Device file name, usually similar to `video0`. */
    device_name: string
    /** Absolute path to the device node. */
    device_path: string
    /** Camera name reported by the driver. */
    camera_name: string
    /** Driver name bound to the device. */
    driver_name: string
    /** Alternative device name from sysfs, or `null` if unavailable. */
    alt_name: string | null
    /** Description of the hardware location of the device. */
    hardware_bus: string
    /** V4L2 capability flags reported by the device. */
    capabilities: string[]
    /** Device version reported by V4L2. */
    version: string
    /** Stable path derived from the physical connection, or `null` if unavailable. */
    path_by_hardware: string | null
    /** Stable path derived from the device identifier, or `null` if unavailable. */
    path_by_id: string | null
    /** Matching USB location identifier, or `null` for non-USB devices. */
    usb_location: string | null
    /** Supported V4L2 modes. May be empty when no discrete modes are reported. */
    modes: V4l2Mode[]
}

/**
 * Libcamera mode reported by Moonraker.
 */
export interface LibcameraMode {
    /** Pixel format of the mode. */
    format: string
    /** Supported resolutions formatted as `<WIDTH>x<HEIGHT>`. */
    resolutions: string[]
}

/**
 * Libcamera device reported by Moonraker.
 */
export interface LibcameraDevice {
    /** Device identifier reported by libcamera. */
    libcamera_id: string
    /** Model name of the device. */
    model: string
    /** Modes supported by the device. */
    modes: LibcameraMode[]
}

/**
 * Unassigned CAN UUID reported by Moonraker.
 */
export interface CanDevice {
    /** UUID of the unassigned CAN node. */
    uuid: string
    /** Application running on the node, usually `Klipper` or `Katapult`. */
    application: string
}
