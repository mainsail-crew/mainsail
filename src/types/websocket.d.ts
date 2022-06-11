import { WebSocketClient } from '@/plugins/webSocketClient'

declare module 'vue/types/vue' {
    interface VueConstructor {
        $socket: WebSocketClient
    }

    interface Vue {
        $socket: WebSocketClient
    }
}
