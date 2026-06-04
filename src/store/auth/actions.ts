import Vue from 'vue'
import { ActionTree } from 'vuex'
import { AuthState } from '@/store/auth/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<AuthState, RootState> = {
    async login({ commit, dispatch }, payload: { username: string; password: string }) {
        commit('setLoggingIn', true)
        commit('setLoginError', null)

        try {
            if (!Vue.$socket.instance || Vue.$socket.instance.readyState !== WebSocket.OPEN) {
                Vue.$socket.connect()
                await new Promise<void>((resolve, reject) => {
                    let attempts = 0
                    const interval = setInterval(() => {
                        attempts++
                        if (Vue.$socket.instance?.readyState === 1 /* WebSocket.OPEN */) {
                            clearInterval(interval)
                            resolve()
                        } else if (attempts > 50) {
                            // 5 seconds
                            clearInterval(interval)
                            reject(new Error('WebSocket connection timeout'))
                        }
                    }, 100)
                })
            }

            const result = await Vue.$socket.emitAndWait<'access.login'>('access.login', {
                username: payload.username,
                password: payload.password,
                source: 'moonraker',
            })

            const resultData = result as Record<string, unknown>
            const accessToken = (resultData.token ?? resultData.access_token) as string
            const refreshToken = (resultData.refresh_token ?? resultData.refreshToken ?? null) as string | null

            if (!accessToken) {
                throw new Error('Missing authentication token from access.login response')
            }

            commit('setAuthToken', {
                accessToken,
                refreshToken,
                username: resultData.username,
            })

            await dispatch('server/init', null, { root: true })
        } catch (error: unknown) {
            let message: string
            if (!error) {
                message = 'WebSocket is not connected.'
            } else if (error instanceof Error) {
                message = error.message
            } else if (typeof error === 'object' && 'message' in error) {
                message = String((error as Record<string, unknown>).message)
            } else {
                message = String(error)
            }

            commit('setLoginError', message)
            throw error
        } finally {
            commit('setLoggingIn', false)
        }
    },

    logout({ commit }) {
        commit('reset')
    },
}
