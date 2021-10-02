import {GetterTree} from 'vuex'
import {AuthState, User} from '@/store/auth/types'

export const getters: GetterTree<AuthState, any> = {
    getUserlist(state: AuthState, getters, rootState, rootGetters): User[] {
        const baseUrl = rootGetters['socket/getUrl']
        return state.servers[baseUrl]?.users || []
    }
}
