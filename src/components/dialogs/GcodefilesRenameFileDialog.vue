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
import type { FocusableRef } from '@/types/vuetify'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { FileStateGcodefile } from '@/store/files/types'
import { splitPath } from '@/store/files/paths'

@Component({
    components: { Panel },
})
export default class GcodefilesRenameFileDialog extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiCloseThick = mdiCloseThick

    name = ''
    isInvalidName = true

    @VModel({ type: Boolean }) showDialog!: boolean
    @Prop({ type: Object, required: true }) item!: FileStateGcodefile
    @Ref('inputFieldRenameFile') readonly inputFieldRenameFile!: FocusableRef

    nameInputRules = [
        (value: string) => !!value || this.$t('Files.InvalidNameEmpty'),
        (value: string) => !this.existsFilename(value) || this.$t('Files.InvalidNameAlreadyExists'),
    ]

    get directory() {
        return splitPath(this.item.full_filename).dir
    }

    get basename() {
        return splitPath(this.item.full_filename).name
    }

    // the file can be in another directory than the one shown in the gcode files panel
    existsFilename(name: string) {
        return this.$store.getters['files/getFile'](`gcodes/${this.directory}/${name}`) !== null
    }

    updateIsInvalidName(value: boolean) {
        this.isInvalidName = value
    }

    renameFileAction() {
        this.$store.dispatch('files/move', {
            source: `gcodes/${this.item.full_filename}`,
            dest: `gcodes/${this.directory}/${this.name}`,
        })

        this.showDialog = false
    }

    @Watch('showDialog')
    onShowDialogChanged(newVal: boolean) {
        if (!newVal) return

        this.name = this.basename
        this.isInvalidName = true

        setTimeout(() => {
            this.inputFieldRenameFile.focus()
        }, 200)
    }
}
</script>
