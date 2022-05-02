<template>
    <div
        class="d-flex justify-center flex-column"
        :class="dropzoneClasses"
        @dragenter="onDragEnter"
        @dragover="onDragOver"
        @dragleave="hideDropZone"
        @drop="onDrop">
        <div class="textnode">{{ $t('Files.DropFilesToAddGcode') }}</div>
    </div>
</template>

<script lang="ts">
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Component from 'vue-class-component'

@Component
export default class TheFullscreenUpload extends Mixins(BaseMixin) {
    private visable = false

    get blockFileUpload() {
        return this.$store.state.gui.view.blockFileUpload ?? false
    }

    get dropzoneClasses() {
        return {
            'fullscreen-upload__dragzone': true,
            'fullscreen-upload__dragzone--visable': this.visable,
        }
    }

    onDrop(e: any) {
        e.preventDefault()
        this.hideDropZone()
        window.console.log('handleDrop', e, e.dataTransfer.files)
    }

    mounted() {
        window.addEventListener('dragenter', this.onDragOverWindow)
        window.addEventListener('dragover', this.onDragOverWindow)
    }

    beforeDestroy() {
        window.removeEventListener('dragenter', this.onDragOverWindow)
        window.removeEventListener('dragover', this.onDragOverWindow)
    }

    showDropZone() {
        this.visable = true
    }

    hideDropZone() {
        this.visable = false
    }

    onDragOverWindow(e: any) {
        if (this.blockFileUpload) return
        e.preventDefault()
        if (this.visable) return

        this.showDropZone()
    }

    onDragEnter(e: any) {
        e.dataTransfer.dropEffect = 'copy'
        e.preventDefault()
    }

    onDragOver(e: any) {
        e.preventDefault()
    }

    /*async dragDropUpload(e: any) {
        if (!this.blockFileUpload) {
            e.preventDefault()

            this.dropzone.visibility = 'hidden'
            this.dropzone.opacity = 0

            if (e.dataTransfer.files.length) {
                const files = [...e.dataTransfer.files].filter((file: File) => {
                    const format = file.name.slice(file.name.lastIndexOf('.'))

                    if (!validGcodeExtensions.includes(format)) {
                        this.$toast.error(this.$t('Files.WrongFileUploaded', { filename: file.name }).toString())

                        return false
                    }

                    return true
                })

                this.$store.dispatch('socket/addLoading', { name: 'gcodeUpload' })
                let successFiles = []
                this.uploadSnackbar.number = 0
                this.uploadSnackbar.max = files.length
                for (const file of files) {
                    this.uploadSnackbar.number++
                    const result = await this.doUploadFile(file)
                    successFiles.push(result)
                }

                this.$store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
                for (const file of successFiles) {
                    this.$toast.success(this.$t('Files.SuccessfullyUploaded', { filename: file }).toString())
                }
            }
        }
    }*/
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
