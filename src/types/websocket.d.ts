import { WebSocketClient } from '@/plugins/webSocketClient'

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */

// Vue 3 augmentation for compatibility (used via @vue/compat)
declare module 'vue' {
    interface ComponentInternalInstance {
        $socket: WebSocketClient
    }
    interface ComponentCustomProperties {
        $socket: WebSocketClient
    }
}

export {}
