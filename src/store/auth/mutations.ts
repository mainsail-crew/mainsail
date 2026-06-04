import { MutationTree } from 'vuex'
import { AuthState } from '@/store/auth/types'

const ACCESS_TOKEN_KEY = 'mainsail_moonraker_access_token'
const REFRESH_TOKEN_KEY = 'mainsail_moonraker_refresh_token'
const USERNAME_KEY = 'mainsail_moonraker_username'

export const mutations: MutationTree<AuthState> = {
    setAuthToken(state, payload) {
        state.accessToken = payload.accessToken
        state.refreshToken = payload.refreshToken
        state.username = payload.username
        state.loginError = null
        state.isLoggingIn = false

        if (payload.accessToken != null) localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
        else localStorage.removeItem(ACCESS_TOKEN_KEY)

        if (payload.refreshToken != null) localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
        else localStorage.removeItem(REFRESH_TOKEN_KEY)

        if (payload.username != null) localStorage.setItem(USERNAME_KEY, payload.username)
        else localStorage.removeItem(USERNAME_KEY)
    },

    setLoginError(state, payload) {
        state.loginError = payload
    },

    setLoggingIn(state, payload) {
        state.isLoggingIn = payload
    },

    reset(state) {
        state.accessToken = null
        state.refreshToken = null
        state.username = null
        state.loginError = null
        state.isLoggingIn = false

        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        localStorage.removeItem(USERNAME_KEY)
    },
}
