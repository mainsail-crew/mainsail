import { validGcodeExtensions } from '@/store/variables'
import Vue from 'vue'
import Component from 'vue-class-component'

type FileUploadRoot = 'gcodes' | 'config'
type FileUploadDestination = { root: FileUploadRoot; path?: string }
type FileUploadDestinationGetter = (file: File) => FileUploadDestination

@Component
export default class FilesMixins extends Vue {
    loadingKeyForRoot(root?: FileUploadRoot) {
        if (root === 'config') {
            return 'configFileUpload'
        }
        return 'gcodeUpload'
    }

    isGcodeFilename(filename: string) {
        const extensionPos = filename.lastIndexOf('.')
        const extension = filename.slice(extensionPos)
        return validGcodeExtensions.includes(extension)
    }

    async uploadFiles(files: File[], destination: Partial<FileUploadDestination> | FileUploadDestinationGetter = {}) {
        const loadingKey = this.loadingKeyForRoot(typeof destination === 'object' ? destination.root : 'gcodes')
        await this.$store.dispatch('socket/addLoading', { name: loadingKey })
        await this.$store.dispatch('files/uploadSetCurrentNumber', 0)
        await this.$store.dispatch('files/uploadSetMaxNumber', files.length)

        const uploadedFiles = []
        for (const file of files) {
            await this.$store.dispatch('files/uploadIncrementCurrentNumber')
            const { path = '', root } = typeof destination === 'function' ? destination(file) : destination
            const pathWithoutPrefix = path.slice(0, 1) === '/' ? path.slice(1) : path
            const result = await this.$store.dispatch('files/uploadFile', { file, path: pathWithoutPrefix, root })

            if (result !== false) {
                this.$toast.success(this.$t('Files.SuccessfullyUploaded', { filename: result }).toString())
                uploadedFiles.push(file)
            }
        }

        await this.$store.dispatch('socket/removeLoading', { name: loadingKey })
        return uploadedFiles
    }
}
