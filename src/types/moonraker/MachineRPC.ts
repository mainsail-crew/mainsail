/**
 * Machine Administration RPC Interface
 *
 * These endpoints provide access to host machine and peripheral data.
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/machine/
 */

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

export interface MachineRPC {
    /**
     * Returns a list of all USB devices currently detected on the system.
     */
    'machine.peripherals.usb': () => Promise<{
        /** Array of detected USB devices. */
        usb_devices: UsbDevice[]
    }>

    /**
     * Returns a list of all serial devices detected on the system.
     * These may be USB CDC-ACM devices or hardware UARTs.
     */
    'machine.peripherals.serial': () => Promise<{
        /** Array of detected serial devices. */
        serial_devices: SerialDevice[]
    }>

    /**
     * Returns a list of all video capture devices detected on the system.
     * If libcamera is available, libcamera devices are included as well.
     */
    'machine.peripherals.video': () => Promise<{
        /** Array of detected V4L2 video capture devices. */
        v4l2_devices: V4l2Device[]
        /** Array of detected libcamera devices. */
        libcamera_devices: LibcameraDevice[]
    }>

    /**
     * Queries a CAN interface for unassigned Klipper or Katapult node UUIDs.
     */
    'machine.peripherals.canbus': (params: {
        /** CAN socket interface to query. Defaults to `can0`. */
        interface?: string
    }) => Promise<{
        /** Array of discovered CAN UUIDs. Empty when no unassigned nodes are found. */
        can_uuids: CanDevice[]
    }>
}
