<template>
    <div class="d-flex justify-center flex-column fullscreen-upload__dragzone" :class="dropzoneClasses" @drop="onDrop">
        <v-icon class="fullscreen-upload__icon">{{ mdiTrayArrowDown }}</v-icon>
        <div class="textnode">{{ $t('FullscreenUpload.DropFilesToUploadFiles') }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { validGcodeExtensions } from '@/store/variables'
import { mdiTrayArrowDown } from '@mdi/js'

const store = useStore()
const route = useRoute()
const { t } = useI18n()
const { proxy } = getCurrentInstance()!
const { } = useBase()

const visible = ref(false)

const dropzoneClasses = computed(() => ({
    'fullscreen-upload__dragzone--visible': visible.value,
}))

const currentRoute = computed(() => route.path ?? '')

const currentPathGcodes = computed(() => store.state.gui.view.gcodefiles.currentPath ?? '')

const currentPathConfig = computed(() => store.state.gui.view.configfiles.currentPath ?? '')

function showDropZone() {
    visible.value = true
}

function hideDropZone() {
    visible.value = false
}

function onDragOverWindow(e: DragEvent) {
    const types = e.dataTransfer?.types ?? []
    if (!types.includes('Files')) return

    e.preventDefault()
    if (visible.value) return

    showDropZone()
}

function onDragLeaveWindow(e: DragEvent) {
    e.preventDefault()
    hideDropZone()
}

async function onDrop(e: DragEvent) {
    e.preventDefault()
    hideDropZone()

    if (e.dataTransfer?.files?.length) {
        const files = [...e.dataTransfer.files]

        await store.dispatch('socket/addLoading', { name: 'gcodeUpload' })
        await store.dispatch('files/uploadSetCurrentNumber', 0)
        await store.dispatch('files/uploadSetMaxNumber', files.length)

        for (const file of files) {
            const extensionPos = file.name.lastIndexOf('.')
            const extension = file.name.slice(extensionPos)
            const isGcode = validGcodeExtensions.includes(extension)

            let path = ''
            if (currentRoute.value === '/files' && isGcode) path = currentPathGcodes.value
            else if (currentRoute.value === '/config' && !isGcode) path = currentPathConfig.value

            const root = isGcode ? 'gcodes' : 'config'
            await store.dispatch('files/uploadIncrementCurrentNumber')
            const result = await store.dispatch('files/uploadFile', { file, path, root })

            if (result !== false)
                proxy!.$toast.success(t('Files.SuccessfullyUploaded', { filename: result }).toString())
        }

        await store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
    }
}

onMounted(() => {
    window.addEventListener('dragenter', onDragOverWindow)
    window.addEventListener('dragover', onDragOverWindow)
    window.addEventListener('dragleave', onDragLeaveWindow)
})

onBeforeUnmount(() => {
    window.removeEventListener('dragenter', onDragOverWindow)
    window.removeEventListener('dragover', onDragOverWindow)
    window.removeEventListener('dragleave', onDragLeaveWindow)
})
</script>

<style>
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
    transition:
        visibility 200ms,
        opacity 200ms;
    font:
        bold 42px Oswald,
        DejaVu Sans,
        Tahoma,
        sans-serif;
}

/*noinspection CssUnusedSymbol*/
.fullscreen-upload__dragzone--visible {
    opacity: 1;
    visibility: visible;
}

/*noinspection CssUnusedSymbol*/
.fullscreen-upload__dragzone:before {
    display: block;
    content: ' ';
    position: absolute;
    top: 1em;
    right: 1em;
    bottom: 1em;
    left: 1em;
    border: 3px dashed white;
    border-radius: 1em;
}

/*noinspection CssUnusedSymbol*/
.fullscreen-upload__icon .v-icon__svg {
    width: 250px;
    height: 250px;
}

.fullscreen-upload__dragzone .textnode {
    text-align: center;
    transition: font-size 175ms;
    font-size: 82px;
}
</style>
