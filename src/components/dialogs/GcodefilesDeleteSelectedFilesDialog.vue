<template>
    <v-dialog :value="showDialog" width="400">
        <panel
            :title="$t('Files.DeleteDirectory')"
            card-class="gcodefiles-delete-directory-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <p v-if="selectedFiles.length === 1" class="mb-0">
                    {{ $t('Files.DeleteSingleFileQuestion', { name: selectedFiles[0].filename }) }}
                </p>
                <p v-else class="mb-0">{{ $t('Files.DeleteSelectedQuestion', { count: selectedFiles.length }) }}</p>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closePrompt">{{ $t('Files.Cancel') }}</v-btn>
                <v-btn color="error" text @click="deleteSelectedFiles">{{ $t('Files.Delete') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'

import { mdiCloseThick } from '@mdi/js'
import { FileStateGcodefile } from '@/store/files/types'
import GcodefilesMixin from '@/components/mixins/gcodefiles'

@Component({
    components: { Panel },
})
export default class GcodefilesDeleteSelectedFilesDialog extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiCloseThick = mdiCloseThick

    @Prop({ type: Boolean, default: false }) showDialog!: boolean

    deleteSelectedFiles(): void {
        this.selectedFiles.forEach((item: FileStateGcodefile) => {
            if (item.isDirectory) {
                this.$socket.emit(
                    'server.files.delete_directory',
                    { path: 'gcodes' + this.currentPath + '/' + item.filename, force: true },
                    { action: 'files/getDeleteDir' }
                )

                return
            }

            this.$socket.emit(
                'server.files.delete_file',
                { path: 'gcodes' + this.currentPath + '/' + item.filename },
                { action: 'files/getDeleteFile' }
            )
        })

        this.selectedFiles = []
        this.closePrompt()
    }

    closePrompt() {
        this.$emit('close')
    }
}
</script>

<style scoped></style>
