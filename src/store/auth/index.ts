import { Module } from 'vuex'
import { AuthState } from '@/store/auth/types'
import { actions } from '@/store/auth/actions'
import { mutations } from '@/store/auth/mutations'
import { getters } from '@/store/auth/getters'
import { RootState } from '@/store/types'
import { getAuthStorageKey } from '@/store/auth/helpers'

const ACCESS_TOKEN_KEY = 'mainsail_moonraker_access_token'
const REFRESH_TOKEN_KEY = 'mainsail_moonraker_refresh_token'
const USERNAME_KEY = 'mainsail_moonraker_username'

export const getDefaultState = (): AuthState => {
    const hostname = (import.meta.env.VUE_APP_HOSTNAME as string) || window.location.hostname
    const defaultPort = window.location.port || (window.location.protocol === 'https:' ? 443 : 80)
    const port = import.meta.env.VUE_APP_PORT ? Number(import.meta.env.VUE_APP_PORT) : Number(defaultPort)

    const accessKey = getAuthStorageKey(ACCESS_TOKEN_KEY, hostname, port)
    const refreshKey = getAuthStorageKey(REFRESH_TOKEN_KEY, hostname, port)
    const userKey = getAuthStorageKey(USERNAME_KEY, hostname, port)

    const rawAccess = localStorage.getItem(accessKey) || sessionStorage.getItem(accessKey)
    const rawRefresh = localStorage.getItem(refreshKey) || sessionStorage.getItem(refreshKey)
    const rawUser = localStorage.getItem(userKey) || sessionStorage.getItem(userKey)

    const accessToken = rawAccess && rawAccess !== 'null' && rawAccess !== 'undefined' ? rawAccess : null
    const refreshToken = rawRefresh && rawRefresh !== 'null' && rawRefresh !== 'undefined' ? rawRefresh : null
    const username = rawUser && rawUser !== 'null' && rawUser !== 'undefined' ? rawUser : null

    return {
        accessToken,
        refreshToken,
        username,
        loginError: null,
        isLoggingIn: false,
    }
}

const state = getDefaultState()

export const auth: Module<AuthState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
