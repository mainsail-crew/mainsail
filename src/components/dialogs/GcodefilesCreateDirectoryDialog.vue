<template>
    <v-dialog v-model="showDialog" width="400">
        <panel :title="$t('Files.NewDirectory')" card-class="gcodefiles-new-directory-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-text-field
                    ref="inputField"
                    v-model="name"
                    :label="$t('Files.Name')"
                    required
                    :rules="nameInputRules"
                    @update:error="updateIsInvalidName"
                    @keydown.enter="createDirectory" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn :disabled="!isValid" :loading="isLoading" color="primary" text @click="createDirectory">
                    {{ $t('Files.Create') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Ref, VModel, Watch } from 'vue-property-decorator'
import type { FocusableRef } from '@/types/vuetify'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'

@Component({
    components: { Panel },
})
export default class GcodefilesCreateDirectoryDialog extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiCloseThick = mdiCloseThick

    @VModel({ type: Boolean }) showDialog!: boolean
    @Ref() readonly inputField!: FocusableRef

    name = ''
    isInvalidName = false
    isLoading = false

    nameInputRules = [
        (value: string) => !!value || this.$t('Files.InvalidNameEmpty'),
        (value: string) => !this.existsName(value) || this.$t('Files.InvalidNameAlreadyExists'),
    ]

    get path() {
        return `gcodes${this.currentPath}/${this.name}`
    }

    get isValid() {
        return !this.isInvalidName && this.name.length > 0
    }

    @Watch('showDialog')
    onShowDialogChanged(newVal: boolean) {
        if (!newVal) return

        this.name = ''
        this.isInvalidName = false

        setTimeout(() => {
            this.inputField?.focus()
        })
    }

    existsName(name: string) {
        return this.$store.getters['files/existsPath'](`gcodes${this.currentPath}/${name}`)
    }

    updateIsInvalidName(value: boolean) {
        this.isInvalidName = value
    }

    async createDirectory() {
        if (!this.isValid || this.isLoading) return

        this.isLoading = true
        const success = await this.$store.dispatch('files/createDirectory', this.path)
        this.isLoading = false

        if (success) this.closeDialog()
    }

    closeDialog() {
        this.showDialog = false
    }
}
</script>
