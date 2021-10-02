import store from '@/store'
import axios from 'axios'
import {AxiosRequestConfig} from 'axios'

const extractBaseUrlRegex = /(?<baseurl>\/\/[\w|.|:]+)\//

function getBaseUrl(config: AxiosRequestConfig) {
    const match = config.url?.match(extractBaseUrlRegex)
    const baseUrl = match?.groups?.baseurl
    return baseUrl
}

export function setupInterceptors() {

    axios.interceptors.request.use(function (config) {
        const baseUrl = getBaseUrl(config)
        if (!baseUrl) {
            console.error('BASEURL REGEX FAILED', config.url)
            return config
        }
        const token = store.state.auth?.servers?.[baseUrl]?.token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    }, function (err) {
        return Promise.reject(err)
    })

    axios.interceptors.response.use(function (response) {
        return response
    }, function (error) {
        if (error.response?.status === 401) {
            store.dispatch('auth/showLogin')
        }
        return Promise.reject(error)
    })
}

