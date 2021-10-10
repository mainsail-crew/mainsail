export interface SocketState {
    remoteMode: boolean
    hostname: string
    port: number
    protocol: string
    reconnectInterval: number
    isConnected: boolean,
    isConnecting: boolean,
    connectingFailed: boolean,
    loadings: string[]
}