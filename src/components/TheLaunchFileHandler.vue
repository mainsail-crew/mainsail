<template>
    <start-print-dialog
        v-if="showPrintDialog"
        :bool="showPrintDialog"
        :file="file"
        current-path=""
        @closeDialog="onCloseDialog" />
</template>

<script lang="ts">
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import FilesMixin from '@/components/mixins/files'
import Component from 'vue-class-component'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import { FileStateGcodefile } from '@/store/files/types'
import { launchCount } from '@/plugins/pwaLaunchCount'

@Component({
    components: {
        StartPrintDialog,
    },
})
export default class TheLaunchFileHandler extends Mixins(BaseMixin, FilesMixin) {
    item: FileStateGcodefile | null = null
    private uploadedFile: null | { path: string; filename: string } = null

    get fileReady() {
        return this.file && this.file.metadataPulled
    }

    get file() {
        if (!this.uploadedFile) return null
        const { path, filename } = this.uploadedFile
        const files = this.$store.getters['files/getGcodeFiles'](path ? `/${path}` : path, false, true)
        return files.find((f: FileStateGcodefile) => f.filename === filename)
    }

    get canPrint() {
        return !this.isUpdating && !['error', 'printing', 'paused'].includes(this.printer_state)
    }

    get isUpdating() {
        return Boolean(this.$store.state.server.updateManager.updateResponse.application ?? '')
    }

    get showPrintDialog() {
        return this.fileReady && this.canPrint
    }

    @Watch('file')
    onFileChange(file: FileStateGcodefile) {
        if (file && !file.metadataPulled && !file.metadataRequested) {
            const filename = ['gcodes', file.path, file.filename].filter(Boolean).join('/')
            this.$store.dispatch('files/requestMetadata', [{ filename }])
        }
    }

    mounted() {
        window.launchQueue?.setConsumer(this.onLaunch)
    }

    beforeDestroy() {
        window.launchQueue?.setConsumer(() => undefined)
    }

    /**
     * Determine if the launch is a new file launch. This is somewhat quirky because the launch queue is is re-sent
     * when the page is reloaded, so to prevent re-processing the same launch when the page is reloaded, we calculate a
     * launch key, save it to session storage, and compare it to the last launch key. And we also check the launch count
     * to see if this is the first launch or a subsequent launch. This is needed because the launch queue is re-sent
     * when the page is reloaded, so we need to differentiate between the first launch and subsequent launches.
     *
     * @param files The files to check.
     */
    isNewFileLaunch(files: File[]) {
        const lastLaunchKey = sessionStorage.getItem('launchKey')
        const launchKey = files
            .map(({ name, lastModified, size }: File) => [name, lastModified, size].join('::'))
            .sort()
            .join(',')
        sessionStorage.setItem('launchKey', launchKey)

        return launchCount.value > 1 || launchKey !== lastLaunchKey
    }

    isGcodeFileHandle(file: FileSystemHandle): file is FileSystemFileHandle {
        if (file.kind !== 'file') return false
        return this.isGcodeFilename(file.name) //
    }

    onCloseDialog() {
        this.uploadedFile = null
    }

    async onLaunch(launchParams: LaunchParams) {
        // increment the launch count
        launchCount.value++

        // Nothing to do when the queue is empty.
        if (!launchParams.files || !launchParams.files.length) {
            return
        }

        // Filter to only gcode files and get the files from the file handles
        const files = await Promise.all(
            launchParams.files.filter(this.isGcodeFileHandle).map((file: FileSystemFileHandle) => file.getFile())
        )

        if (!this.isNewFileLaunch(files)) {
            console.log('Repeated first launch key, ignoring because the page was probably just reloaded.')
            return
        }
        this.uploadedFile = null

        const root = 'gcodes'
        const path = ''
        const uploadedFiles = await this.uploadFiles(files, { root, path })

        if (uploadedFiles.length > 0) this.uploadedFile = { path, filename: uploadedFiles[0].name }
    }
}
</script>
