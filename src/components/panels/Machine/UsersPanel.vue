<style scoped>
</style>

<template>
  <div>
    <v-card class="mb-6">
      <v-toolbar flat dense>
        <v-toolbar-title>
          <span class="subheading align-baseline"><v-icon
              left>mdi-account-multiple</v-icon>{{ $t('Machine.UsersPanel.Users') }}</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn small class="px-2 minwidth-0" color="primary" @click="openCreateUserDialog" v-bind="attrs" v-on="on">
              <v-icon small>mdi-account-plus</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Machine.UsersPanel.CreateUser') }}</span>
        </v-tooltip>
      </v-toolbar>

      <v-list>
        <v-list-item v-for="user in userlist" :key="user.username">
          <v-list-item-avatar>
            <v-icon dark>mdi-account</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-text="user.username"></v-list-item-title>
            <v-list-item-subtitle>{{
                $t("Machine.UsersPanel.CreatedAt", {'date': formatTimestamp(user.created_on)})
              }}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon>
              <v-icon small @click="deleteUser(user.username)">mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="showCreateUserDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">{{ $t('Machine.UsersPanel.CreateUser') }}</v-card-title>
        <v-card-text>
          <v-text-field :label="$t('Machine.UsersPanel.Username')" required v-model="createUserDialogModel.username"></v-text-field>
          <v-text-field :label="$t('Machine.UsersPanel.Password')" required v-model="createUserDialogModel.password"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="" text @click="showCreateUserDialog = false">{{ $t('Machine.UsersPanel.Cancel') }}</v-btn>
          <v-btn color="primary" text @click="createUser">{{ $t('Machine.UsersPanel.Create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {User} from '@/store/auth/types'


@Component
export default class UsersPanel extends Mixins(BaseMixin) {

    showCreateUserDialog = false
    createUserDialogModel = {
        username: '',
        password: ''
    }

    get userlist(): User[] {
        return this.$store.getters['auth/getUserlist'] || []
    }

    openCreateUserDialog(): void {
        this.showCreateUserDialog = true
    }

    createUser(): void {
        this.$store.dispatch('auth/createUser', {
            username: this.createUserDialogModel.username,
            password: this.createUserDialogModel.password
        })
        this.showCreateUserDialog = false
    }

    deleteUser(username: string): void {
        this.$store.dispatch('auth/deleteUser', {
            username: username
        })
    }

    formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp * 1000)
        return date.toLocaleDateString()
    }
}
</script>
