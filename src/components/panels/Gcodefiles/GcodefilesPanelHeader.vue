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
                class="text-primary px-2 minwidth-0 ml-3"
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
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useGcodeFiles } from '@/composables/useGcodeFiles'
import { useSocket } from '@/composables/useSocket'
import { useToast } from 'vue-toast-notification'
import { mdiCloudDownload, mdiDelete, mdiFolderPlus, mdiMagnify, mdiRefresh, mdiUpload } from '@mdi/js'
import { FileStateFile } from '@/store/files/types'
import { escapePath, generateTimestamp } from '@/plugins/helpers'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import GcodefilesCreateDirectoryDialog from '@/components/dialogs/GcodefilesCreateDirectoryDialog.vue'
import GcodefilesPanelHeaderSettings from '@/components/panels/Gcodefiles/GcodefilesPanelHeaderSettings.vue'
import { validGcodeExtensions } from '@/store/variables'

const { apiUrl, isIOS, loadings } = useBase()
const { search, setSearch, currentPath, setCurrentPath, selectedFiles, setSelectedFiles } = useGcodeFiles()
const socket = useSocket()
const store = useStore()
const { t } = useI18n()
const toast = useToast()

const fileUpload = ref<HTMLInputElement | null>(null)

const showCreateDirectoryDialog = ref(false)
const showDeleteSelectedDialog = ref(false)

const gcodeInputFileAccept = computed(() => {
    if (isIOS.value) return []
    return validGcodeExtensions
})

const deleteSelectedText = computed(() => {
    if (selectedFiles.value.length === 1) {
        return t('Files.DeleteSingleFileQuestion', { name: selectedFiles.value[0].filename }).toString()
    }
    return t('Files.DeleteSelectedQuestion', { count: selectedFiles.value.length }).toString()
})

function downloadSelectedFiles() {
    if (selectedFiles.value.length === 1) {
        const filepath = `${currentPath.value}/${selectedFiles.value[0].filename}`
        const href = `${apiUrl.value}/server/files/gcodes${escapePath(filepath)}`
        window.open(href)
        setSelectedFiles([])
        return
    }

    const items: string[] = []

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

    addElementToItems('gcodes/' + currentPath.value, selectedFiles.value)

    socket.emit(
        'server.files.zip',
        { items, dest: `config/gcodes-${generateTimestamp()}.zip` },
        { action: 'files/downloadZip', loading: 'gcodeDownloadZip' }
    )

    setSelectedFiles([])
}

async function uploadFile() {
    if (fileUpload.value?.files === null || fileUpload.value?.files.length === 0) return

    const files = [...fileUpload.value.files]
    fileUpload.value.value = ''

    store.dispatch('socket/addLoading', { name: 'gcodeUpload' })
    store.dispatch('files/uploadSetCurrentNumber', 0)
    store.dispatch('files/uploadSetMaxNumber', fileUpload.value.files.length)

    for (const file of files) {
        store.dispatch('files/uploadIncrementCurrentNumber')
        const path = currentPath.value.slice(0, 1) === '/' ? currentPath.value.slice(1) : currentPath.value
        const result = await store.dispatch('files/uploadFile', {
            file,
            path,
            root: 'gcodes',
        })

        if (result !== false)
            toast.success(t('Files.SuccessfullyUploaded', { filename: result }).toString())
    }

    store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
}

function clickUploadButton() {
    fileUpload.value?.click()
}

function refreshFileList() {
    socket.emit(
        'server.files.get_directory',
        { path: 'gcodes' + currentPath.value },
        { action: 'files/getDirectory' }
    )
}

function deleteSelectedFiles(): void {
    selectedFiles.value.forEach((item) => {
        if (item.isDirectory) {
            socket.emit(
                'server.files.delete_directory',
                { path: 'gcodes' + currentPath.value + '/' + item.filename, force: true },
                { action: 'files/getDeleteDir' }
            )
            return
        }

        socket.emit(
            'server.files.delete_file',
            { path: 'gcodes' + currentPath.value + '/' + item.filename },
            { action: 'files/getDeleteFile' }
        )
    })

    setSelectedFiles([])
}
</script>

<style scoped>
.max-width-300 {
    max-width: 300px;
}
</style>
