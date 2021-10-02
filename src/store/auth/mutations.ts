import {getDefaultState} from './index'
import {MutationTree} from 'vuex'
import {AuthState, SetLoginData, User} from '@/store/auth/types'

export const mutations: MutationTree<AuthState> = {
    reset(state: AuthState) {
        Object.assign(state, getDefaultState())
    },

    setUsers(state: AuthState, payload: {baseUrl: string, users: User[]}) {
        state.servers = {
            ...state.servers,
            [payload.baseUrl]: {
                ...state.servers[payload.baseUrl],
                users: payload.users
            }
        }
    },

    setLoginData(state: AuthState, login: SetLoginData) {
        state.servers = {
            ...state.servers,
            [login.baseUrl]: {
                ...state.servers[login.baseUrl],
                token: login.token,
                refreshToken: login.refreshToken,
                username: login.username,
                users: [],
                loginFailed: false
            }
        }
        state.loginFailed = false
        state.showLogin = false
    },

    setLoginFailed(state: AuthState, hasFailed: boolean) {
        state.loginFailed = hasFailed
    },

    showLogin(state: AuthState, showLogin: boolean) {
        state.showLogin = showLogin
    }

}
