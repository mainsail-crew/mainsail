/**
 * Moonraker JSON-RPC Interface
 *
 * This interface defines all available RPC methods for the Moonraker API.
 * Each method is strictly typed with its parameters and return type.
 *
 * To add a new method:
 * 1. Add the method signature to the MoonrakerRPCInterface
 * 2. Define the parameter type (use `void` for methods without parameters)
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
