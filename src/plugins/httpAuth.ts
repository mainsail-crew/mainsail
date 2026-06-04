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

        return nativeFetch(request)
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
}
