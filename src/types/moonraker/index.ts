/**
 * Moonraker JSON-RPC Interface
 *
 * This interface defines all available RPC methods for the Moonraker API.
 * Each method is strictly typed with its parameters and return type.
 *
 * The structure mirrors the Moonraker documentation, where each documentation
 * page has its own corresponding TypeScript file:
 * - ServerRPC.ts      → https://moonraker.readthedocs.io/en/latest/external_api/server/
 * - PrinterRPC.ts     → https://moonraker.readthedocs.io/en/latest/external_api/printer/
 * - MachineRPC.ts     → https://moonraker.readthedocs.io/en/latest/external_api/machine/
 * - FileManagerRPC.ts → https://moonraker.readthedocs.io/en/latest/external_api/file_manager/
 * - etc.
 *
 * To add a new method:
 * 1. Find or create the appropriate RPC interface file matching the Moonraker docs section
 * 2. Add the method signature with JSDoc comments
 * 3. Define the parameter type (use empty parameter list `()` for methods without parameters)
 * 4. Define the return type wrapped in Promise<>
 * 5. Import and extend the interface in this file
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/
 *
 * @example
 * 'method.name': (params: { param1: string }) => Promise<{ result: boolean }>
 * 'method.without.params': () => Promise<{ data: string[] }>
 */

import type { DatabaseRPC } from './DatabaseRPC'
import type { MachineRPC } from './MachineRPC'
import type { PrinterRPC } from './PrinterRPC'
import type { ServerRPC } from './ServerRPC'

/**
 * Combined Moonraker RPC Interface containing all method categories.
 */
export interface MoonrakerRPCInterface extends DatabaseRPC, MachineRPC, PrinterRPC, ServerRPC {}

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
