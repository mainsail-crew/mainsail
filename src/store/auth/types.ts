export interface AuthState {
    accessToken: string | null
    refreshToken: string | null
    username: string | null
    loginError: string | null
    isLoggingIn: boolean
}
