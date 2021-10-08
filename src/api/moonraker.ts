import axios from 'axios'
import store from '@/store'

import {
    MoonrakerApiResponse, MoonrakerCreateUserResponse, MoonrakerDeleteUserResponse,
    MoonrakerLoginResponse,
    MoonrakerUser,
    MoonrakerUsersResponse
} from '@/api/moonraker.types'

async function login(baseUrl: string, username: string, password: string): Promise<MoonrakerLoginResponse> {
    const url = baseUrl + '/access/login'
    const response = await axios.post<MoonrakerApiResponse<MoonrakerLoginResponse>>(url, {
        username,
        password
    })
    return response.data.result
}

export async function getOneshotToken(baseUrl: string): Promise<string> {
    const url = `${baseUrl}/access/oneshot_token`
    const response = await axios.get<MoonrakerApiResponse<string>>(url, {})
    return response.data.result
}

async function getUserlist(baseUrl: string): Promise<MoonrakerUser[]> {
    const url = baseUrl + '/access/users/list'
    const result = await axios.get<MoonrakerApiResponse<MoonrakerUsersResponse>>(url, {})
    return result.data.result.users
}

async function deleteUser(baseUrl: string, username: string): Promise<MoonrakerDeleteUserResponse> {
    const url = store.getters['socket/getUrl'] + '/access/user'
    const response = await axios.delete<MoonrakerApiResponse<MoonrakerDeleteUserResponse>>(url, {
        data: {
            username
        }
    })
    return response.data.result
}

async function createUser(baseUrl: string, username: string, password: string): Promise<MoonrakerCreateUserResponse> {
    const url = baseUrl + '/access/user'
    const response = await axios.post<MoonrakerApiResponse<MoonrakerCreateUserResponse>>(url, {
        username: username,
        password: password
    }, {})
    return response.data.result
}

export const MoonrakerApi = {
    login,
    createUser,
    deleteUser,
    getOneshotToken,
    getUserlist
}
