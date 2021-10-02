<style scoped>
.login-error-message {
    color: #F56565;
}
</style>

<template>
    <v-card-text class="pt-5">
        <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            @submit.prevent="login"
        >
            <v-text-field
                v-model="username"
                :label="$t('LoginForm.Username')"
                required
            ></v-text-field>

            <v-text-field
                v-model="password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                name="input-10-1"
                :label="$t('LoginForm.Password')"
                @click:append="showPassword = !showPassword"
            ></v-text-field>
            <div class="login-error-message" v-if="showError">{{ $t("LoginForm.LoginFailed") }}</div>
            <v-checkbox
                v-model="rememberMe"
                :label="$t('LoginForm.RememberMe')"
                required
            ></v-checkbox>

            <v-btn
                type="submit"
                :disabled="!valid"
                color="success"
                class="mr-4"
            >
                {{ $t("LoginForm.LoginButton") }}
            </v-btn>

        </v-form>
    </v-card-text>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import {Emit, Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import {UserCredentials} from '@/store/auth/types'

@Component
export default class LoginForm extends Mixins(BaseMixin) {
    valid = true
    username = ''
    password = ''
    rememberMe = false
    showPassword = false

    @Prop({required: true, default: false})
    readonly showError!: boolean

    @Emit()
    login(): UserCredentials {
        return {
            username: this.username,
            password: this.password
        }
    }

}
</script>
