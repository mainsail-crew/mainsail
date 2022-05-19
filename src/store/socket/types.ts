export interface SocketState {
    hostname: string
    port: number
    protocol: string
    reconnectInterval: number
    isConnected: boolean
    isConnecting: boolean
    connectingFailed: boolean
    loadings: string[]
    connection_id: number | null
}
