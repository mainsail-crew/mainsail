import axios from 'axios'
import type { Store } from 'vuex'
import { RootState } from '@/store/types'

export function initializeHttpAuth(store: Store<RootState>): void {
    const shouldAttachToken = (url: URL): boolean => {
        const apiUrl = store.getters['socket/getUrl'] as string
        if (!apiUrl || !store.state.auth?.accessToken) return false

        const apiRoot = new URL(apiUrl, window.location.href)
        return url.origin === apiRoot.origin && url.pathname.startsWith(apiRoot.pathname)
    }

    let refreshPromise: Promise<string | null> | null = null

    const handleTokenRefresh = async (): Promise<string | null> => {
        const apiUrl = store.getters['socket/getUrl'] as string
        const refreshToken = store.state.auth?.refreshToken

        if (!apiUrl || !refreshToken) {
            store.dispatch('auth/logout')
            return null
        }

        if (refreshPromise) return refreshPromise

        refreshPromise = (async () => {
            try {
                const apiRoot = new URL(apiUrl, window.location.href)
                const refreshUrl = new URL('/access/refresh_jwt', apiRoot)

                const response = await nativeFetch(refreshUrl.toString(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                })

                if (!response.ok) {
                    throw new Error('Refresh failed')
                }

                const resultData = await response.json()
                const accessToken = (resultData.result?.token ?? resultData.token ?? resultData.access_token) as string
                const newRefreshToken = (resultData.result?.refresh_token ??
                    resultData.refresh_token ??
                    resultData.refreshToken ??
                    refreshToken) as string | null

                if (!accessToken) throw new Error('No access token returned')

                store.commit('auth/setAuthToken', {
                    accessToken,
                    refreshToken: newRefreshToken,
                    username: resultData.result?.username ?? resultData.username ?? store.state.auth?.username,
                    hostname: store.state.socket?.hostname ?? '',
                    port: store.state.socket?.port ?? 80,
                })

                return accessToken
            } catch {
                store.dispatch('auth/logout')
                return null
            } finally {
                refreshPromise = null
            }
        })()

        return refreshPromise
    }

    const nativeFetch = window.fetch.bind(window)
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const request = new Request(input, init)
        const url = new URL(request.url, window.location.href)

        if (shouldAttachToken(url)) {
            const token = store.state.auth?.accessToken
            if (token) {
                request.headers.set('Authorization', `Bearer ${token}`)
            }
        }

        let response = await nativeFetch(request)

        if (response.status === 401 && shouldAttachToken(url) && !url.pathname.endsWith('/access/refresh_jwt')) {
            const newToken = await handleTokenRefresh()
            if (newToken) {
                const retryRequest = new Request(input, init)
                retryRequest.headers.set('Authorization', `Bearer ${newToken}`)
                response = await nativeFetch(retryRequest)
            }
        }

        return response
    }

    axios.interceptors.request.use((config) => {
        if (!config.url) return config

        let url: URL
        try {
            url = new URL(config.url, window.location.href)
        } catch {
            return config
        }

        if (shouldAttachToken(url)) {
            const token = store.state.auth?.accessToken
            if (token) {
                config.headers = config.headers ?? {}
                if (!('Authorization' in config.headers)) {
                    ;(config.headers as Record<string, unknown>).Authorization = `Bearer ${token}`
                }
            }
        }

        return config
    })

    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const config = error.config
            // We use config._isRetry to prevent infinite loops
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!config || error.response?.status !== 401 || (config as any)._isRetry) {
                return Promise.reject(error)
            }

            let url: URL
            try {
                url = new URL(config.url, window.location.href)
            } catch {
                return Promise.reject(error)
            }

            if (shouldAttachToken(url) && !url.pathname.endsWith('/access/refresh_jwt')) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(config as any)._isRetry = true
                const newToken = await handleTokenRefresh()
                if (newToken) {
                    config.headers = config.headers ?? {}
                    config.headers['Authorization'] = `Bearer ${newToken}`
                    return axios(config)
                }
            }

            return Promise.reject(error)
        }
    )
}
