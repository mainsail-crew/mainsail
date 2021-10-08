
export interface AuthState {
    showLogin: boolean
    loginFailed: boolean
    servers: {
        [key: string]: ServerAuthState
    }
}

export interface SetLoginData {
    username: string
    token: string
    refreshToken: string
    baseUrl: string
}

export interface ServerAuthState {
    users: User[]
    username?: string
    token?: string
    refreshToken?: string
    loginFailed: boolean
}

export interface User {
    username: string
    created_on: number
}

export interface UserCredentials {
    username: string
    password: string
}

export interface ResetPasswordRequest {
    password: string
    new_password: string
}

export interface RefreshTokenRequest {
    refresh_token: string
}
