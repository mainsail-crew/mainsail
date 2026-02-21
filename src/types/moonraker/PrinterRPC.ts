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
