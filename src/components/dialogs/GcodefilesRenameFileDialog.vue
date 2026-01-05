<template>
    <v-dialog v-model="showDialog" width="400">
        <panel :title="$t('Files.RenameFile')" card-class="gcodefiles-rename-file-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="showDialog = false">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-text-field
                    ref="inputFieldRenameFile"
                    v-model="name"
                    :label="$t('Files.Name')"
                    required
                    :rules="nameInputRules"
                    @update:error="updateIsInvalidName"
                    @keydown.enter="renameFileAction" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="showDialog = false">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn :disabled="isInvalidName || name.length === 0" color="primary" text @click="renameFileAction">
                    {{ $t('Files.Rename') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, VModel, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { FileStateGcodefile } from '@/store/files/types'

@Component({
    components: { Panel },
})
export default class GcodefilesRenameFileDialog extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiCloseThick = mdiCloseThick

    name = ''
    isInvalidName = true

    @VModel({ type: Boolean }) showDialog!: boolean
    @Prop({ type: Object, required: true }) item!: FileStateGcodefile
    @Ref('inputFieldRenameFile') readonly inputFieldRenameFile!: HTMLInputElement

    nameInputRules = [
        (value: string) => !!value || this.$t('Files.InvalidNameEmpty'),
        (value: string) => !this.existsFilename(value) || this.$t('Files.InvalidNameAlreadyExists'),
    ]

    updateIsInvalidName(value: boolean) {
        this.isInvalidName = value
    }

    renameFileAction() {
        this.$socket.emit(
            'server.files.move',
            {
                source: 'gcodes' + this.currentPath + '/' + this.item.filename,
                dest: 'gcodes' + this.currentPath + '/' + this.name,
            },
            { action: 'files/getMove' }
        )

        this.showDialog = false
    }

    @Watch('showDialog')
    onShowDialogChanged(newVal: boolean) {
        if (!newVal) return

        this.name = this.item.filename
        this.isInvalidName = true

        setTimeout(() => {
            this.inputFieldRenameFile.focus()
        }, 200)
    }
}
</script>
