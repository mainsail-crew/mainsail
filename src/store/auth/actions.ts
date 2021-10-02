import {ActionTree} from 'vuex'
import {RootState} from '@/store/types'
import Vue from 'vue'
import i18n from '@/plugins/i18n'
import {AuthState, UserCredentials} from '@/store/auth/types'
import {MoonrakerApi} from '@/api/moonraker'
import {MoonrakerLoginResponse} from '@/api/moonraker.types'

export const actions: ActionTree<AuthState, RootState> = {
    reset({commit}) {
        commit('reset')
    },

    async getUsers({state, dispatch, commit, rootGetters}) {
        try {
            const baseUrl = rootGetters['socket/getUrl']
            const users = await MoonrakerApi.getUserlist(baseUrl)
            commit('setUsers', {users, baseUrl})
        } catch (error) {
            window.console.log(error.response?.data.error)
            Vue.$toast.error(i18n.t('Auth.GetUsersFailed').toString())
        }
    },

    async createUser({state, dispatch, commit, rootGetters}, payload: UserCredentials) {
        const baseUrl = rootGetters['socket/getUrl']
        try {
            await MoonrakerApi.createUser(baseUrl, payload.username, payload.password)
            dispatch('getUsers')
        } catch (error) {
            window.console.log(error.response?.data.error)
            Vue.$toast.error(i18n.t('Auth.FailedToCreateUser', { username: payload.username }).toString())
        }
    },

    async deleteUser({state, dispatch, commit, rootGetters}, payload) {
        const baseUrl = rootGetters['socket/getUrl']
        try {
            await MoonrakerApi.deleteUser(baseUrl, payload.username)
            dispatch('getUsers')
        } catch (error) {
            window.console.log(error.response?.data.error)
            Vue.$toast.error(i18n.t('Auth.FailedToDeleteUser', { username: payload.username }).toString())
        }
    },

    logout({state, dispatch, commit, rootGetters}, payload) {
        console.log('logout')
    },

    showLogin({state, dispatch, commit, rootGetters}) {
        commit('showLogin', true)
    },

    async login({state, dispatch, commit, rootGetters}, payload) {
        const baseUrl = rootGetters['socket/getUrl']
        try {
            const response: MoonrakerLoginResponse = await MoonrakerApi.login(baseUrl, payload.username, payload.password)
            commit('setLoginData', {
                username: response.username,
                token: response.token,
                refreshToken: response.refresh_token,
                baseUrl,
            })
            dispatch('socket/reconnect', null, { root: true })
            commit('showLogin', false)
        } catch (e) {
            commit('setLoginFailed', true)
        }
    },

    resetPassword({state, dispatch, commit, rootGetters}, payload) {
        console.log('resetPassword')
    },

    close({commit}) {
        commit('reset')
    },

}
