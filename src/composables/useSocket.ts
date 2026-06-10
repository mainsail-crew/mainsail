import { inject, type InjectionKey } from 'vue'
import type { WebSocketClient } from '@/plugins/webSocketClient'

export const SOCKET_KEY: InjectionKey<WebSocketClient> = Symbol('socket')

export function useSocket(): WebSocketClient {
    const socket = inject(SOCKET_KEY)
    if (!socket) throw new Error('useSocket() called without providing socket')
    return socket
}
