<template>
    <v-dialog v-model="showDialog" width="400">
        <panel
            :title="$t('Files.RenameDirectory')"
            card-class="gcodefiles-rename-directory-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
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
                    @keydown.enter="renameDirectoryAction" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closePrompt">{{ $t('Files.Cancel') }}</v-btn>
                <v-btn
                    :disabled="isInvalidName || name.length === 0"
                    color="primary"
                    text
                    @click="renameDirectoryAction">
                    {{ $t('Files.Rename') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, VModel, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick } from '@mdi/js'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { FileStateGcodefile } from '@/store/files/types'

@Component
export default class GcodefilesRenameDirectoryDialog extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiCloseThick = mdiCloseThick

    name = ''
    isInvalidName = true

    @VModel({ type: Boolean }) showDialog!: boolean
    @Prop({ type: Object, required: true }) item!: FileStateGcodefile
    @Ref() readonly inputField!: HTMLInputElement

    nameInputRules = [
        (value: string) => !!value || this.$t('Files.InvalidNameEmpty'),
        (value: string) => !this.existsFilename(value) || this.$t('Files.InvalidNameAlreadyExists'),
    ]

    updateIsInvalidName(value: boolean) {
        this.isInvalidName = value
    }

    renameDirectoryAction() {
        this.$socket.emit(
            'server.files.move',
            {
                source: 'gcodes' + this.currentPath + '/' + this.item.filename,
                dest: 'gcodes' + this.currentPath + '/' + this.name,
            },
            { action: 'files/getMove' }
        )

        this.closePrompt()
    }

    closePrompt() {
        this.showDialog = false
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
}
</script>
