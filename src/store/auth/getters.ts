import { GetterTree } from 'vuex'
import { AuthState } from '@/store/auth/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<AuthState, RootState> = {
    isAuthenticated: (state) => !!state.accessToken,
    loginError: (state) => state.loginError,
    isLoggingIn: (state) => state.isLoggingIn,
}
