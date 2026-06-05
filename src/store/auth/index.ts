import { Module } from 'vuex'
import { AuthState } from '@/store/auth/types'
import { actions } from '@/store/auth/actions'
import { mutations } from '@/store/auth/mutations'
import { getters } from '@/store/auth/getters'
import { RootState } from '@/store/types'

export const getDefaultState = (): AuthState => {
    const rawAccess =
        localStorage.getItem('mainsail_moonraker_access_token') ||
        sessionStorage.getItem('mainsail_moonraker_access_token')
    const rawRefresh =
        localStorage.getItem('mainsail_moonraker_refresh_token') ||
        sessionStorage.getItem('mainsail_moonraker_refresh_token')
    const rawUser =
        localStorage.getItem('mainsail_moonraker_username') || sessionStorage.getItem('mainsail_moonraker_username')

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
