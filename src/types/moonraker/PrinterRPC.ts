/**
 * Printer Administration RPC Interface
 *
 * These endpoints provide access to printer state and printer control.
 * Klippy must be connected to Moonraker to receive a successful response.
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/printer/
 */
export interface PrinterRPC {
    /**
     * Returns information about the state of Klipper.
     */
    'printer.info': () => Promise<{
        /** Current Klipper state */
        state: 'ready' | 'startup' | 'shutdown' | 'error'
        /** A message providing more details about the current state */
        state_message: string
        /** The hostname of the machine running Klipper */
        hostname: string
        /** The path to the Klipper application */
        klipper_path: string
        /** The path to the Python executable used to launch Klipper */
        python_path: string
        /** The PID of the current Klippy process */
        process_id: number
        /** The UID of the user the Klippy process belongs to */
        user_id: number
        /** The GID of the group the Klippy process belongs to */
        group_id: number
        /** The path to Klipper's log file */
        log_file: string
        /** The path to Klipper's configuration file */
        config_file: string
        /** Version of the currently running instance of Klipper */
        software_version: string
        /** A brief description of the host machine's CPU */
        cpu_info: string
    }>

    /**
     * Immediately halts the printer and puts it in a "shutdown" state.
     * Should be used to implement an "emergency stop" button.
     */
    'printer.emergency_stop': () => Promise<'ok'>

    /**
     * Requests a Klipper "soft" restart.
     * This will reload the Klippy application and configuration.
     * Connected MCUs will not be reset.
     */
    'printer.restart': () => Promise<'ok'>

    /**
     * Requests a complete Klipper restart.
     * Both the Klippy Application and connected MCUs will be reset.
     */
    'printer.firmware_restart': () => Promise<'ok'>

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

    /**
     * Query the status of all registered endstops.
     */
    'printer.query_endstops.status': () => Promise<Record<string, 'open' | 'TRIGGERED'>>

    /**
     * Executes a GCode command.
     * Multiple commands may be executed by separating them with a newline.
     * The request returns when the command or series of commands have completed,
     * or when the command results in an error.
     */
    'printer.gcode.script': (params: {
        /** A GCode command to run. Multiple commands may be specified, separated by a newline. */
        script: string
    }) => Promise<'ok'>

    /**
     * Retrieves a list of registered GCode command descriptions.
     * Not all registered GCode commands have a description.
     */
    'printer.gcode.help': () => Promise<Record<string, string>>

    /**
     * Start a print job.
     */
    'printer.print.start': (params: {
        /** The name of the gcode file to print. May be a path relative to the gcode folder. */
        filename: string
    }) => Promise<'ok'>

    /**
     * Pause the current print job.
     */
    'printer.print.pause': () => Promise<'ok'>

    /**
     * Resume the current print job.
     */
    'printer.print.resume': () => Promise<'ok'>

    /**
     * Cancel the current print job.
     */
    'printer.print.cancel': () => Promise<'ok'>
}
