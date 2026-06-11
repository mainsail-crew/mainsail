import type { WebSocketClient } from '@/plugins/webSocketClient'
import { useToast } from 'vue-toast-notification'
import type { ToastPluginApi } from 'vue-toast-notification/types/toast'

let _socket: WebSocketClient | null = null
const _toast: ToastPluginApi = useToast()

export function getSocket(): WebSocketClient {
    if (!_socket) throw new Error('Socket not initialized')
    return _socket
}

export function setSocket(socket: WebSocketClient) {
    _socket = socket
}

export const $toast: ToastPluginApi = _toast
