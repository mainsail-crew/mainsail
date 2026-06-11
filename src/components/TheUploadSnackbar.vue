<template>
    <v-snackbar v-if="show" :timeout="-1" fixed right bottom>
        <span v-if="maxNumber > 1" class="mr-1">({{ currentNumber }}/{{ maxNumber }})</span>
        <strong>{{ $t('Editor.Uploading') + ' ' + filename }}</strong>
        <br />
        {{ percent }} % @ {{ speed }}/s
        <br />
        <v-progress-linear class="mt-2" v-model="percent"></v-progress-linear>
        <template #actions="{ props }">
            <v-btn color="red" variant="text" v-bind="props" style="min-width: auto" @click="cancelUpload">
                <v-icon class="0">{{ mdiClose }}</v-icon>
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { mdiClose } from '@mdi/js'
import { formatFilesize } from '@/plugins/helpers'

const store = useStore()

const show = computed(() => store.state.files.upload.show ?? false)
const cancelTokenSource = computed(() => store.state.files.upload.cancelTokenSource)
const filename = computed(() => store.state.files.upload.filename ?? '')
const currentNumber = computed(() => store.state.files.upload.currentNumber ?? 0)
const maxNumber = computed(() => store.state.files.upload.maxNumber ?? 0)
const speed = computed(() => formatFilesize(Math.round(store.state.files.upload.speed ?? 0)))
const percent = computed(() => Math.round(store.state.files.upload.percent ?? 0))

function cancelUpload() {
    cancelTokenSource.value?.cancel()
    store.dispatch('files/uploadSetShow', false)
    store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
    store.dispatch('socket/removeLoading', { name: 'configFileUpload' })
}

watch(show, (newVal: boolean) => {
    const body = document.getElementsByTagName('body')[0]

    if (newVal) body.classList.add('fullscreenUpload--active')
    else body.classList.remove('fullscreenUpload--active')
})
</script>
