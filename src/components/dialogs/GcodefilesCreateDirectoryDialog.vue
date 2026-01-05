<template>
    <v-dialog v-model="showDialog" width="400">
        <panel :title="$t('Files.NewDirectory')" card-class="gcodefiles-new-directory-dialog" :margin-bottom="false">
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
                    @keydown.enter="createDirectoryAction" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closePrompt">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn
                    :disabled="isInvalidName || name.length === 0"
                    color="primary"
                    text
                    @click="createDirectoryAction">
                    {{ $t('Files.Create') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Ref, VModel, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import GcodefilesMixin from '@/components/mixins/gcodefiles'

@Component({
    components: { Panel },
})
export default class GcodefilesCreateDirectoryDialog extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiCloseThick = mdiCloseThick

    name = ''
    isInvalidName = false

    @VModel({ type: Boolean }) showDialog!: boolean
    @Ref() readonly inputField!: HTMLInputElement

    nameInputRules = [
        (value: string) => !!value || this.$t('Files.InvalidNameEmpty'),
        (value: string) => !this.existsFilename(value) || this.$t('Files.InvalidNameAlreadyExists'),
    ]

    updateIsInvalidName(value: boolean) {
        this.isInvalidName = value
    }

    createDirectoryAction() {
        this.$socket.emit(
            'server.files.post_directory',
            { path: 'gcodes' + this.currentPath + '/' + this.name },
            { action: 'files/getCreateDir' }
        )

        this.closePrompt()
    }

    closePrompt() {
        this.showDialog = false
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
}
</script>
