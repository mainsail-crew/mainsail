<template>
    <v-dialog :value="showDialog" width="400">
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
                    ref="inputFieldRenameDirectory"
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
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { FileStateGcodefile } from '@/store/files/types'

@Component({
    components: { Panel },
})
export default class GcodefilesRenameDirectoryDialog extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiCloseThick = mdiCloseThick

    name = ''
    isInvalidName = false

    @Prop({ type: Boolean, default: false }) showDialog!: boolean
    @Prop({ type: Object, required: true }) item!: FileStateGcodefile
    @Ref('inputFieldRenameDirectory') readonly inputFieldRenameDirectory!: HTMLInputElement

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
        this.$emit('close')
    }

    @Watch('showDialog')
    onShowDialogChanged(newVal: boolean) {
        if (!newVal) return

        this.name = this.item.filename
        this.isInvalidName = false

        setTimeout(() => {
            this.inputFieldRenameDirectory.focus()
        }, 200)
    }
}
</script>
