export interface MoonrakerApiResponse<T> {
    result: T
}

export interface MoonrakerDeleteUserResponse {
    username: string
    action: 'user_deleted'
}

export interface MoonrakerCreateUserResponse {
    username: string
    password: string
}

export interface MoonrakerLoginResponse {
    username: string
    token: string
    refresh_token: string
    action: 'user_logged_in'
}

export interface MoonrakerLogoutResponse {
    username: string;
    action: 'user_logged_out'
}

export interface MoonrakerUsersResponse {
    users: MoonrakerUser[]
}

export interface MoonrakerUser {
    username: string
    created_on: number
}

export interface RefreshTokenResponse {
    username: string;
    token: string;
    action: 'user_jwt_refresh'
}
