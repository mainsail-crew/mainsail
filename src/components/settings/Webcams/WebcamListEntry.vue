<template>
    <div>
        <v-divider v-if="boolBorderTop" class="my-2" />
        <settings-row :title="webcam.name" :icon="icon" :sub-title="subtitle">
            <template v-if="webcam.source === 'database'">
                <v-btn
                    class="minwidth-0 px-2"
                    small variant="outlined" :color="webcam.enabled ? '' : 'secondary'"
                    @click="toogleStatus">
                    <v-icon small>{{ mdiLightbulbOutline }}</v-icon>
                </v-btn>
                <v-btn class="ml-3" small variant="outlined" @click="edit">
                    <v-icon small left>{{ mdiPencil }}</v-icon>
                    {{ $t('Settings.Edit') }}
                </v-btn>
                <v-btn small variant="outlined" class="ml-3 minwidth-0 px-2" color="error" @click="deleteWebcam">
                    <v-icon small>{{ mdiDelete }}</v-icon>
                </v-btn>
            </template>
        </settings-row>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useWebcam } from '@/composables/useWebcam'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { mdiDelete, mdiPencil, mdiLightbulbOutline } from '@mdi/js'

const props = defineProps({
    webcam: { type: Object, default: () => ({}) },
    boolBorderTop: { type: Boolean, default: false },
})

const emit = defineEmits<{
    (e: 'edit-webcam', webcam: GuiWebcamStateWebcam): void
}>()

const store = useStore()
const { convertWebcamIcon } = useWebcam()

const icon = computed(() => convertWebcamIcon((props.webcam as GuiWebcamStateWebcam).icon))

const subtitle = computed(() => {
    const w = props.webcam as GuiWebcamStateWebcam
    if (w.service === 'mjpegstreamer-adaptive') return `URL: ${w.snapshot_url}`
    return `URL: ${w.stream_url}`
})

function toogleStatus() {
    const webcam = { ...(props.webcam as GuiWebcamStateWebcam) }
    webcam.enabled = !webcam.enabled
    store.dispatch('gui/webcams/update', { webcam, oldWebcamName: webcam.name })
}

function edit() {
    emit('edit-webcam', props.webcam as GuiWebcamStateWebcam)
}

function deleteWebcam() {
    store.dispatch('gui/webcams/delete', (props.webcam as GuiWebcamStateWebcam).name)
}
</script>

<style scoped></style>
