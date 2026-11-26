<template>
    <v-dialog v-model="showDialog" width="400">
        <panel
            :title="$t('Files.RenameDirectory')"
            card-class="gcodefiles-rename-directory-dialog"
            :margin-bottom="false">
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
                    @keydown.enter="renameDirectory" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn :disabled="!isValid" :loading="isLoading" color="primary" text @click="renameDirectory">
                    {{ $t('Files.Rename') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, VModel, Watch } from 'vue-property-decorator'
import type { FocusableRef } from '@/types/vuetify'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import { FileStateGcodefile } from '@/store/files/types'
import { joinPath, splitPath } from '@/store/files/helpers'

@Component({
    components: { Panel },
})
export default class GcodefilesRenameDirectoryDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick

    @VModel({ type: Boolean }) showDialog!: boolean
    @Prop({ type: Object, required: true }) readonly item!: FileStateGcodefile
    @Ref() readonly inputField!: FocusableRef

    name = ''
    isInvalidName = true
    isLoading = false

    nameInputRules = [
        (value: string) => !!value || this.$t('Files.InvalidNameEmpty'),
        (value: string) => !this.existsName(value) || this.$t('Files.InvalidNameAlreadyExists'),
    ]

    get parentDirectory() {
        return joinPath('gcodes', splitPath(this.item.full_filename).dir)
    }

    get isValid() {
        return !this.isInvalidName && this.name.length > 0
    }

    @Watch('showDialog')
    onShowDialogChanged(newVal: boolean) {
        if (!newVal) return

        this.name = this.item.filename
        this.isInvalidName = true

        setTimeout(() => {
            this.inputField?.focus()
        })
    }

    // renaming to an existing directory would move the directory into it
    existsName(name: string) {
        return this.$store.getters['files/existsPath'](`${this.parentDirectory}/${name}`)
    }

    updateIsInvalidName(value: boolean) {
        this.isInvalidName = value
    }

    async renameDirectory() {
        if (!this.isValid || this.isLoading) return

        this.isLoading = true
        const success = await this.$store.dispatch('files/move', {
            source: `gcodes/${this.item.full_filename}`,
            dest: `${this.parentDirectory}/${this.name}`,
        })
        this.isLoading = false

        if (success) this.closeDialog()
    }

    closeDialog() {
        this.showDialog = false
    }
}
</script>
