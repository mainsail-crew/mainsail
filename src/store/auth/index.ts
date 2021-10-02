import {Module} from 'vuex'
import {actions} from '@/store/auth/actions'
import {mutations} from '@/store/auth/mutations'
import {getters} from '@/store/auth/getters'
import {AuthState} from '@/store/auth/types'

export const getDefaultState = (): AuthState => {
    return {
        showLogin: false,
        loginFailed: false,
        servers: {}
    }
}

// initial state
const state = getDefaultState()

export const auth: Module<AuthState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
