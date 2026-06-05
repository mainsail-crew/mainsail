import { MutationTree } from 'vuex'
import { AuthState } from '@/store/auth/types'
import { getAuthStorageKey } from '@/store/auth/helpers'

const ACCESS_TOKEN_KEY = 'mainsail_moonraker_access_token'
const REFRESH_TOKEN_KEY = 'mainsail_moonraker_refresh_token'
const USERNAME_KEY = 'mainsail_moonraker_username'

export const mutations: MutationTree<AuthState> = {
    setAuthToken(
        state,
        payload: {
            accessToken: string | null
            refreshToken: string | null
            username: string | null
            hostname: string
            port: string | number
            rememberMe?: boolean
        }
    ) {
        state.accessToken = payload.accessToken
        state.refreshToken = payload.refreshToken
        state.username = payload.username
        state.loginError = null
        state.isLoggingIn = false

        const accessKey = getAuthStorageKey(ACCESS_TOKEN_KEY, payload.hostname, payload.port)
        const refreshKey = getAuthStorageKey(REFRESH_TOKEN_KEY, payload.hostname, payload.port)
        const userKey = getAuthStorageKey(USERNAME_KEY, payload.hostname, payload.port)

        let storage = payload.rememberMe ? localStorage : sessionStorage
        let clearStorage = payload.rememberMe ? sessionStorage : localStorage

        if (payload.rememberMe === undefined) {
            storage = localStorage.getItem(accessKey) !== null ? localStorage : sessionStorage
            clearStorage = storage === localStorage ? sessionStorage : localStorage
        }

        if (payload.accessToken != null) storage.setItem(accessKey, payload.accessToken)
        else storage.removeItem(accessKey)

        if (payload.refreshToken != null) storage.setItem(refreshKey, payload.refreshToken)
        else storage.removeItem(refreshKey)

        if (payload.username != null) storage.setItem(userKey, payload.username)
        else storage.removeItem(userKey)

        if (payload.rememberMe !== undefined) {
            clearStorage.removeItem(accessKey)
            clearStorage.removeItem(refreshKey)
            clearStorage.removeItem(userKey)
        }
    },

    setLoginError(state, payload) {
        state.loginError = payload
    },

    setLoggingIn(state, payload) {
        state.isLoggingIn = payload
    },

    loadToken(state, payload: { hostname: string; port: string | number }) {
        const accessKey = getAuthStorageKey(ACCESS_TOKEN_KEY, payload.hostname, payload.port)
        const refreshKey = getAuthStorageKey(REFRESH_TOKEN_KEY, payload.hostname, payload.port)
        const userKey = getAuthStorageKey(USERNAME_KEY, payload.hostname, payload.port)

        const getValidItem = (key: string) => {
            const local = localStorage.getItem(key)
            if (local === null || local === 'null' || local === 'undefined') {
                const session = sessionStorage.getItem(key)
                return session === 'null' || session === 'undefined' ? null : session
            }
            return local
        }

        state.accessToken = getValidItem(accessKey)
        state.refreshToken = getValidItem(refreshKey)
        state.username = getValidItem(userKey)
    },

    reset(state, payload?: { hostname: string; port: string | number }) {
        state.accessToken = null
        state.refreshToken = null
        state.username = null
        state.loginError = null
        state.isLoggingIn = false

        if (payload && payload.hostname && payload.port) {
            const accessKey = getAuthStorageKey(ACCESS_TOKEN_KEY, payload.hostname, payload.port)
            const refreshKey = getAuthStorageKey(REFRESH_TOKEN_KEY, payload.hostname, payload.port)
            const userKey = getAuthStorageKey(USERNAME_KEY, payload.hostname, payload.port)

            localStorage.removeItem(accessKey)
            localStorage.removeItem(refreshKey)
            localStorage.removeItem(userKey)

            sessionStorage.removeItem(accessKey)
            sessionStorage.removeItem(refreshKey)
            sessionStorage.removeItem(userKey)
        }
    },
}
