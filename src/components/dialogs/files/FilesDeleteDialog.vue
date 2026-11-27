<template>
    <v-dialog v-model="showDialog" width="400" :fullscreen="isMobile">
        <panel :title="title" :icon="mdiAlert" card-class="files-delete-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>{{ text }}</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn :loading="isLoading" color="error" text @click="submit">{{ $t('Buttons.Delete') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, VModel, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAlert, mdiCloseThick } from '@mdi/js'
import { FileStateFile } from '@/store/files/types'
import { joinPath } from '@/store/files/helpers'
import type { FileRelatedFilesGetter } from '@/components/files/types'

/**
 * Dialog to confirm the deletion of files and directories. It sends the requests itself, emits the
 * deleted items and only closes when all items were deleted.
 */
@Component({
    components: { Panel },
})
export default class FilesDeleteDialog extends Mixins(BaseMixin) {
    mdiAlert = mdiAlert
    mdiCloseThick = mdiCloseThick

    @VModel({ type: Boolean }) showDialog!: boolean
    /** Directory of the items, including the root */
    @Prop({ type: String, required: true }) readonly directory!: string
    @Prop({ type: Array, required: true }) readonly items!: FileStateFile[]
    /** Files that are deleted together with a file */
    @Prop({ type: Function, default: null }) readonly relatedFiles!: FileRelatedFilesGetter | null

    /** Items to delete. They are copied on open, so the text doesn't change while the dialog closes. */
    targets: FileStateFile[] = []
    isLoading = false

    get title() {
        if (this.targets.length === 1 && this.targets[0].isDirectory) return this.$t('Files.DeleteDirectory').toString()

        return this.$t('Files.Delete').toString()
    }

    get text() {
        if (this.targets.length !== 1) {
            return this.$t('Files.DeleteSelectedQuestion', { count: this.targets.length }).toString()
        }

        const [target] = this.targets
        if (target.isDirectory) return this.$t('Files.DeleteDirectoryQuestion', { name: target.filename }).toString()

        return this.$t('Files.DeleteSingleFileQuestion', { name: target.filename }).toString()
    }

    @Watch('showDialog')
    onShowDialogChanged(newVal: boolean) {
        if (newVal) this.targets = [...this.items]
    }

    async submit() {
        if (this.isLoading) return

        this.isLoading = true
        const results = await Promise.all(this.targets.map((item) => this.deleteItem(item)))
        this.isLoading = false

        const deleted = this.targets.filter((_, index) => results[index])
        if (deleted.length) this.$emit('deleted', deleted)

        // failed items stay in the dialog, so they can be deleted again
        this.targets = this.targets.filter((_, index) => !results[index])
        if (this.targets.length === 0) this.closeDialog()
    }

    async deleteItem(item: FileStateFile): Promise<boolean> {
        const path = joinPath(this.directory, item.filename)
        if (item.isDirectory) return await this.$store.dispatch('files/deleteDirectory', path)

        const success = await this.$store.dispatch('files/deleteFile', { path })
        if (success) await this.deleteRelatedFiles(item)

        return success
    }

    /** Deletes the related files of a file, e.g. the thumbnail of a timelapse video */
    async deleteRelatedFiles(item: FileStateFile) {
        if (!this.relatedFiles) return

        const targetNames = this.targets.map((target) => target.filename)
        const requests = this.relatedFiles(item.filename)
            .filter((related) => !targetNames.includes(related))
            .map((related) => joinPath(this.directory, related))
            .filter((path) => this.$store.getters['files/pathExists'](path))
            .map((path) => this.$store.dispatch('files/deleteFile', { path, silent: true }))

        await Promise.all(requests)
    }

    closeDialog() {
        this.showDialog = false
    }
}
</script>
