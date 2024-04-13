import { GetterTree } from 'vuex'
import { SocketState } from '@/store/socket/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<SocketState, RootState> = {
    getUrl: (state) => {
        const port = state.port !== 80 ? ':' + state.port : ''
        const path = '/' + state.path.replace(/^\/|\/$/g, '')

        return `//${state.hostname}${port}${path}`
    },

    getHostUrl: (state) => {
        const protocol = state.protocol === 'wss' ? 'https' : 'http'

        return `${protocol}://${state.hostname}/`
    },

    getWebsocketUrl: (state, getters) => {
        return state.protocol + ':' + getters['getUrl'] + '/websocket'
    },
}
