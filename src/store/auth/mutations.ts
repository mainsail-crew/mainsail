import { MutationTree } from 'vuex'
import { AuthState } from '@/store/auth/types'

const ACCESS_TOKEN_KEY = 'mainsail_moonraker_access_token'
const REFRESH_TOKEN_KEY = 'mainsail_moonraker_refresh_token'
const USERNAME_KEY = 'mainsail_moonraker_username'

export const mutations: MutationTree<AuthState> = {
    setAuthToken(state, payload: { accessToken: string | null; refreshToken: string | null; username: string | null; rememberMe?: boolean }) {
        state.accessToken = payload.accessToken
        state.refreshToken = payload.refreshToken
        state.username = payload.username
        state.loginError = null
        state.isLoggingIn = false

        const storage = payload.rememberMe ? localStorage : sessionStorage
        const clearStorage = payload.rememberMe ? sessionStorage : localStorage

        if (payload.accessToken != null) storage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
        else storage.removeItem(ACCESS_TOKEN_KEY)

        if (payload.refreshToken != null) storage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
        else storage.removeItem(REFRESH_TOKEN_KEY)

        if (payload.username != null) storage.setItem(USERNAME_KEY, payload.username)
        else storage.removeItem(USERNAME_KEY)

        // Clear the other storage just in case
        clearStorage.removeItem(ACCESS_TOKEN_KEY)
        clearStorage.removeItem(REFRESH_TOKEN_KEY)
        clearStorage.removeItem(USERNAME_KEY)
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

        sessionStorage.removeItem(ACCESS_TOKEN_KEY)
        sessionStorage.removeItem(REFRESH_TOKEN_KEY)
        sessionStorage.removeItem(USERNAME_KEY)
    },
}
