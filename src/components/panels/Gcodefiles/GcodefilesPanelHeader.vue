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
                :loading="loadings.includes('gcodeDownloadZip')"
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
            <gcodefiles-delete-selected-files-dialog
                :show-dialog="showDeleteSelectedDialog"
                @close="showDeleteSelectedDialog = false" />
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
            <gcodefiles-create-directory-dialog
                :show-dialog="showCreateDirectoryDialog"
                @close="showCreateDirectoryDialog = false" />
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
import { FileStateFile } from '@/store/files/types'
import { escapePath } from '@/plugins/helpers'
import GcodefilesDeleteSelectedFilesDialog from '@/components/dialogs/GcodefilesDeleteSelectedFilesDialog.vue'
import { validGcodeExtensions } from '@/store/variables'

@Component({
    components: { GcodefilesDeleteSelectedFilesDialog },
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

    @Ref('fileUpload') fileUpload!: HTMLInputElement

    get gcodeInputFileAccept() {
        if (this.isIOS) return []

        return validGcodeExtensions
    }

    downloadSelectedFiles() {
        let items: string[] = []

        const addElementToItems = (absolutPath: string, directory: FileStateFile[]) => {
            for (const file of directory) {
                const filePath = `${absolutPath}/${escapePath(file.filename)}`

                if (file.isDirectory && file.childrens) {
                    addElementToItems(filePath, file.childrens)

                    continue
                }

                items.push(filePath)
            }
        }

        addElementToItems('gcodes/' + this.currentPath, this.selectedFiles)
        const date = new Date()
        const timestamp = `${date.getFullYear()}${date.getMonth()}${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`

        this.$socket.emit(
            'server.files.zip',
            { items, dest: `config/gcodes-${timestamp}.zip` },
            { action: 'files/downloadZip', loading: 'gcodeDownloadZip' }
        )

        this.selectedFiles = []
    }

    async uploadFile() {
        if (this.fileUpload.files === null || this.fileUpload.files.length === 0) return

        const files = [...this.fileUpload.files]
        this.fileUpload.value = ''

        this.$store.dispatch('socket/addLoading', { name: 'gcodeUpload' })
        this.$store.dispatch('files/uploadSetCurrentNumber', 0)
        this.$store.dispatch('files/uploadSetMaxNumber', this.fileUpload.files.length)

        for (const file of files) {
            this.$store.dispatch('files/uploadIncrementCurrentNumber')
            const path = this.currentPath.slice(0, 1) === '/' ? this.currentPath.slice(1) : this.currentPath
            const result = await this.$store.dispatch('files/uploadFile', {
                file,
                path,
                root: 'gcodes',
            })

            if (result !== false)
                this.$toast.success(this.$t('Files.SuccessfullyUploaded', { filename: result }).toString())
        }

        this.$store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
    }

    clickUploadButton() {
        this.fileUpload.click()
    }

    refreshFileList() {
        this.$socket.emit(
            'server.files.get_directory',
            { path: 'gcodes' + this.currentPath },
            { action: 'files/getDirectory' }
        )
    }
}
</script>

<style scoped>
.max-width-300 {
    max-width: 300px;
}
</style>
