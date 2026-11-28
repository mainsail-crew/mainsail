/**
 * Switches, Sensors, and Devices RPC Interface
 *
 * The endpoints are only available when the corresponding devices are configured in `moonraker.conf`.
 * Currently only the power endpoints are typed.
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/devices/
 */
export interface DevicesRPC {
    /**
     * Get device list.
     * Returns the status of all configured power devices.
     */
    'machine.device_power.devices': () => Promise<{
        /** An array of Power Device Status objects */
        devices: PowerDevice[]
    }>

    /**
     * Get device state.
     * Requests the device state for a single configured device. Returns an error if the device does not exist.
     */
    'machine.device_power.get_device': (params: {
        /** The name of the device (required) */
        device: string
    }) => Promise<PowerDeviceStates>

    /**
     * Set device state.
     * Toggle, turn on, or turn off a specified device. Returns an error if the device does not exist,
     * or if the device is `locked_while_printing` and Klipper is printing.
     */
    'machine.device_power.post_device': (params: {
        /** The name of the device to manage (required) */
        device: string
        /** The action to perform on the device (required) */
        action: PowerDeviceAction
    }) => Promise<PowerDeviceStates>

    /**
     * Get batch device status.
     * Get power status for the requested devices. At least one device must be specified.
     */
    'machine.device_power.status': (params: PowerDeviceBatchParams) => Promise<PowerDeviceBatchStates>

    /**
     * Batch power on devices.
     * Power on the requested devices. At least one device must be specified.
     */
    'machine.device_power.on': (params: PowerDeviceBatchParams) => Promise<PowerDeviceBatchStates>

    /**
     * Batch power off devices.
     * Power off the requested devices. At least one device must be specified.
     */
    'machine.device_power.off': (params: PowerDeviceBatchParams) => Promise<PowerDeviceBatchStates>
}

/**
 * Power Device State
 *
 * - `on`: The device is powered on
 * - `off`: The device is powered off
 * - `init`: The device is initializing
 * - `error`: The device encountered an error
 */
export type PowerDeviceState = 'on' | 'off' | 'init' | 'error'

/**
 * Power Device Action
 *
 * - `on`: Turns the device on
 * - `off`: Turns the device off
 * - `toggle`: Toggles the device state
 */
export type PowerDeviceAction = 'on' | 'off' | 'toggle'

/**
 * Power Device Type
 *
 * Note: Unofficial 3rd party extensions can register their own device types.
 */
export type PowerDeviceType =
    | 'gpio'
    | 'klipper_device'
    | 'tplink_smartplug'
    | 'tasmota'
    | 'shelly'
    | 'homeseer'
    | 'homeassistant'
    | 'loxonev1'
    | 'rf'
    | 'mqtt'
    | 'smartthings'
    | 'hue'
    | 'http'
    | 'uhubctl'
    | (string & {})

/**
 * Power Device Status
 */
export interface PowerDevice {
    /** The configured name of the device */
    device: string
    /** The current state of the device */
    status: PowerDeviceState
    /** When set to true the power device status may not be changed when Klipper is printing */
    locked_while_printing: boolean
    /** The device type of the device */
    type: PowerDeviceType
    /**
     * Whether Klipper is shut down.
     * Note: Not documented, Moonraker only adds this field for devices of type `klipper_device`.
     */
    is_shutdown?: boolean
}

/**
 * Batch request parameters.
 * The keys are the requested device names, the values should always be `null`.
 */
export type PowerDeviceBatchParams = Record<string, null>

/**
 * Device states keyed by the configured device name.
 */
export type PowerDeviceStates = Record<string, PowerDeviceState>

/**
 * Device states of a batch request keyed by the configured device name.
 * Note: Not documented, Moonraker returns `device_not_found` for unknown devices instead of an error.
 */
export type PowerDeviceBatchStates = Record<string, PowerDeviceState | 'device_not_found'>

/**
 * Payload of the notify_power_changed notification.
 * Emitted when the state of a power device changes.
 *
 * Note: Not documented on the notifications page (only in the API changelog). Moonraker sends the full
 * Power Device Status of the changed device.
 */
export type PowerChangedNotification = PowerDevice
