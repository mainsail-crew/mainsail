<template>
    <v-row>
        <v-col class="col-12 d-flex align-center">
            <v-text-field
                v-model="search"
                :append-icon="mdiMagnify"
                :label="$t('Files.Search')"
                single-line
                outlined
                clearable
                hide-details
                dense
                class="max-width-300" />
            <v-spacer />
            <v-btn
                v-if="selectedFiles.length"
                :title="$t('Files.Download')"
                color="primary"
                class="px-2 minwidth-0 ml-3"
                :loading="isDownloadingZip"
                @click="downloadSelectedFiles">
                <v-icon>{{ mdiCloudDownload }}</v-icon>
            </v-btn>
            <v-btn
                v-if="selectedFiles.length"
                :title="$t('Files.Delete')"
                color="error"
                class="px-2 minwidth-0 ml-3"
                @click="showDeleteSelectedDialog = true">
                <v-icon>{{ mdiDelete }}</v-icon>
            </v-btn>
            <confirmation-dialog
                v-model="showDeleteSelectedDialog"
                :title="$t('Files.Delete')"
                :text="deleteSelectedText"
                :action-button-text="$t('Buttons.Delete')"
                @action="deleteSelectedFiles" />
            <input
                ref="fileUpload"
                type="file"
                :accept="gcodeInputFileAccept.join(', ')"
                class="d-none"
                multiple
                @change="uploadFile" />
            <v-btn
                :title="$t('Files.UploadNewGcode')"
                class="primary--text px-2 minwidth-0 ml-3"
                :loading="loadings.includes('gcodeUpload')"
                @click="clickUploadButton">
                <v-icon>{{ mdiUpload }}</v-icon>
            </v-btn>
            <v-btn
                :title="$t('Files.CreateNewDirectory')"
                class="px-2 minwidth-0 ml-3"
                @click="showCreateDirectoryDialog = true">
                <v-icon>{{ mdiFolderPlus }}</v-icon>
            </v-btn>
            <gcodefiles-create-directory-dialog v-model="showCreateDirectoryDialog" />
            <v-btn :title="$t('Files.RefreshCurrentDirectory')" class="px-2 minwidth-0 ml-3" @click="refreshFileList">
                <v-icon>{{ mdiRefresh }}</v-icon>
            </v-btn>
            <gcodefiles-panel-header-settings />
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { Component, Mixins, Ref } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { mdiCloudDownload, mdiDelete, mdiFolderPlus, mdiMagnify, mdiRefresh, mdiUpload } from '@mdi/js'
import { escapePath, generateTimestamp } from '@/plugins/helpers'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import { validGcodeExtensions } from '@/store/variables'
import { FileUploadItem } from '@/store/files/types'

@Component({
    components: { ConfirmationDialog },
})
export default class GcodefilesPanelHeader extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiCloudDownload = mdiCloudDownload
    mdiDelete = mdiDelete
    mdiFolderPlus = mdiFolderPlus
    mdiMagnify = mdiMagnify
    mdiRefresh = mdiRefresh
    mdiUpload = mdiUpload

    showCreateDirectoryDialog = false
    showDeleteSelectedDialog = false
    isDownloadingZip = false

    @Ref('fileUpload') fileUpload!: HTMLInputElement

    get gcodeInputFileAccept() {
        if (this.isIOS) return []

        return validGcodeExtensions
    }

    get deleteSelectedText(): string {
        if (this.selectedFiles.length === 1) {
            return this.$t('Files.DeleteSingleFileQuestion', { name: this.selectedFiles[0].filename }).toString()
        }

        return this.$t('Files.DeleteSelectedQuestion', { count: this.selectedFiles.length }).toString()
    }

    async downloadSelectedFiles() {
        if (this.selectedFiles.length === 1 && !this.selectedFiles[0].isDirectory) {
            const filepath = `${this.currentPath}/${this.selectedFiles[0].filename}`
            const href = `${this.apiUrl}/server/files/gcodes${escapePath(filepath)}`
            window.open(href)

            this.selectedFiles = []
            return
        }

        this.isDownloadingZip = true
        await this.$store.dispatch('files/downloadZip', {
            items: this.selectedFiles.map((file) => `gcodes/${file.full_filename}`),
            dest: `config/gcodes-${generateTimestamp()}.zip`,
        })
        this.isDownloadingZip = false

        this.selectedFiles = []
    }

    async uploadFile() {
        const files: FileUploadItem[] = [...(this.fileUpload.files ?? [])].map((file) => ({
            file,
            root: 'gcodes',
            path: this.currentPath,
        }))
        this.fileUpload.value = ''

        await this.$store.dispatch('files/uploadFiles', { files, loading: 'gcodeUpload' })
    }

    clickUploadButton() {
        this.fileUpload.click()
    }

    refreshFileList() {
        this.$store.dispatch('files/loadDirectoryTree', `gcodes${this.currentPath}`)
    }

    deleteSelectedFiles(): void {
        this.selectedFiles.forEach((item) => {
            const path = `gcodes/${item.full_filename}`

            if (item.isDirectory) this.$store.dispatch('files/deleteDirectory', path)
            else this.$store.dispatch('files/deleteFile', { path })
        })

        this.selectedFiles = []
    }
}
</script>

<style scoped>
.max-width-300 {
    max-width: 300px;
}
</style>
