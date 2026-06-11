import { WebSocketClient } from '@/plugins/webSocketClient'

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */

// Augment Vue 3 component instance for $socket access
declare module 'vue' {
    interface ComponentInternalInstance {
        $socket: WebSocketClient
    }
    interface ComponentCustomProperties {
        $socket: WebSocketClient
    }
}

export {}
