export interface SocketState {
    hostname: string
    port: number
    path: string
    protocol: string
    reconnectInterval: number
    isConnected: boolean
    isConnecting: boolean
    connectingFailed: boolean
    connectionFailedMessage: string | null
    loadings: string[]
    initializationList: string[]
    initializationStep: string | null
    initializationProgress: number | null
    initializationError: string | null
    connection_id: number | null
}
