<template>
    <div class="d-flex justify-center flex-column" :class="dropzoneClasses" @drop="onDrop">
        <div class="textnode">{{ $t('FullscreenUpload.DropFilesToUploadFiles') }}</div>
    </div>
</template>

<script lang="ts">
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Component from 'vue-class-component'
import { validGcodeExtensions } from '@/store/variables'

@Component
export default class TheFullscreenUpload extends Mixins(BaseMixin) {
    private visable = false

    get dropzoneClasses() {
        return {
            'fullscreen-upload__dragzone': true,
            'fullscreen-upload__dragzone--visable': this.visable,
        }
    }

    get currentRoute() {
        return this.$route.path ?? ''
    }

    get currentPathGcodes() {
        return this.$store.state.gui.view.gcodefiles.currentPath ?? ''
    }

    get currentPathConfig() {
        return this.$store.state.gui.view.configfiles.currentPath ?? ''
    }

    mounted() {
        window.addEventListener('dragenter', this.onDragOverWindow)
        window.addEventListener('dragover', this.onDragOverWindow)
        window.addEventListener('dragleave', this.onDragLeaveWindow)
    }

    beforeDestroy() {
        window.removeEventListener('dragenter', this.onDragOverWindow)
        window.removeEventListener('dragover', this.onDragOverWindow)
        window.removeEventListener('dragleave', this.onDragLeaveWindow)
    }

    showDropZone() {
        this.visable = true
    }

    hideDropZone() {
        this.visable = false
    }

    onDragOverWindow(e: any) {
        const type = e.dataTransfer?.types[0] ?? ''
        if (type !== 'Files') return

        e.preventDefault()
        if (this.visable) return

        this.showDropZone()
    }

    onDragLeaveWindow(e: any) {
        e.preventDefault()
        this.hideDropZone()
    }

    async onDrop(e: any) {
        e.preventDefault()
        this.hideDropZone()

        if (e.dataTransfer?.files?.length) {
            const files = [...e.dataTransfer.files]

            await this.$store.dispatch('socket/addLoading', { name: 'gcodeUpload' })
            let successFiles = []
            await this.$store.dispatch('files/uploadSetCurrentNumber', 0)
            await this.$store.dispatch('files/uploadSetMaxNumber', files.length)

            for (const file of files) {
                const extensionPos = file.name.lastIndexOf('.')
                const extension = file.name.slice(extensionPos)
                const isGcode = validGcodeExtensions.includes(extension)

                let path = ''
                if (this.currentRoute === '/files' && isGcode) path = this.currentPathGcodes
                else if (this.currentRoute === '/config' && !isGcode) path = this.currentPathConfig

                const root = isGcode ? 'gcodes' : 'config'
                await this.$store.dispatch('files/uploadIncrementCurrentNumber')
                const result = await this.$store.dispatch('files/uploadFile', { file, path, root })
                successFiles.push(result)
            }

            await this.$store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
            for (const file of successFiles) {
                this.$toast.success(this.$t('Files.SuccessfullyUploaded', { filename: file }).toString())
            }
        }
    }
}
</script>

<style scoped>
.fullscreen-upload__dragzone {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99999;
    visibility: hidden;
    opacity: 0;
    transition: visibility 200ms, opacity 200ms;
    font: bold 42px Oswald, DejaVu Sans, Tahoma, sans-serif;
}

.fullscreen-upload__dragzone--visable {
    opacity: 1;
    visibility: visible;
}

.fullscreen-upload__dragzone:before {
    display: block;
    content: ' ';
    position: absolute;
    top: 15px;
    right: 15px;
    bottom: 15px;
    left: 15px;
    border: 3px dashed white;
    border-radius: 15px;
}

.fullscreen-upload__dragzone .textnode {
    text-align: center;
    transition: font-size 175ms;
}
</style>
