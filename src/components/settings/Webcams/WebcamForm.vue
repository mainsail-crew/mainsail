<template>
    <v-form ref="webcamForm" v-model="valid" @submit.prevent="submit">
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>
            <v-row>
                <v-col class="col-12 col-sm-6">
                    <v-row>
                        <v-col class="d-flex">
                            <v-item-group>
                                <v-menu v-model="selectIcon" location="bottom end" title="Icon">
                                    <template #activator="{ props: activatorProps }">
                                        <v-btn
                                            class="px-2 mr-2 _transition _menu-button"
                                            color="transparent"
                                            v-bind="activatorProps"
                                            elevation="0"
                                            :ripple="false">
                                            <v-icon>{{ convertWebcamIcon(form.icon) }}</v-icon>
                                            <v-icon :class="classIconButtonArrow" class="pl-1 mr-n2">
                                                {{ mdiMenuDown }}
                                            </v-icon>
                                        </v-btn>
                                    </template>
                                    <v-list density="compact" class="py-0">
                                        <v-list-item
                                            v-for="icon of iconItems"
                                            :key="icon.value"
                                            link
                                            @click="form.icon = icon.value">
                                            <template #prepend>
                                                <v-icon size="small" class="mt-1 mr-2">
                                                    {{ convertWebcamIcon(icon.value) }}
                                                </v-icon>
                                            </template>
                                            <template #title v-text="icon.text" />
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </v-item-group>
                            <v-text-field
                                v-model="form.name"
                                :label="$t('Settings.WebcamsTab.Name')"
                                hide-details="auto"
                                outlined
                                :rules="[rules.required, rules.unique]"
                                class="_webcam-settings-name-field"
                                dense />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="py-2">
                            <v-text-field
                                v-model="form.stream_url"
                                :label="$t('Settings.WebcamsTab.UrlStream')"
                                hide-details="auto"
                                outlined
                                dense
                                :rules="rulesStreamUrl" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="py-2">
                            <v-text-field
                                v-model="form.snapshot_url"
                                :label="$t('Settings.WebcamsTab.UrlSnapshot')"
                                hide-details="auto"
                                outlined
                                dense
                                :rules="rulesSnapshotUrl" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="py-2">
                            <v-select
                                v-model="form.service"
                                :items="serviceItems"
                                item-title="text"
                                item-value="value"
                                hide-details
                                outlined
                                dense
                                :label="$t('Settings.WebcamsTab.Service')" />
                        </v-col>
                    </v-row>
                    <v-row v-if="hasTargetFps || hasRotate">
                        <v-col v-if="hasAspectRatio" class="py-2">
                            <v-text-field
                                v-model="form.aspect_ratio"
                                :label="$t('Settings.WebcamsTab.AspectRatio')"
                                hide-details="auto"
                                outlined
                                dense
                                :rules="[rules.required, rules.aspect]" />
                        </v-col>
                        <v-col v-if="hasTargetFps" class="py-2 col-6">
                            <v-text-field
                                v-model="form.target_fps"
                                outlined
                                dense
                                hide-details
                                :label="$t('Settings.WebcamsTab.TargetFPS')" />
                        </v-col>
                        <v-col v-if="hasRotate" class="py-2 col-6">
                            <v-select
                                v-model="form.rotation"
                                :items="rotationItems"
                                item-title="text"
                                item-value="value"
                                outlined
                                dense
                                hide-details
                                :label="$t('Settings.WebcamsTab.Rotate')" />
                        </v-col>
                    </v-row>
                    <v-row v-if="hasFpsCounter">
                        <v-col class="pt-1 pb-3">
                            <v-checkbox
                                v-model="localHideFps"
                                class="mt-1"
                                hide-details
                                :label="$t('Settings.WebcamsTab.HideFps')" />
                        </v-col>
                    </v-row>
                    <v-row v-if="hasAudioOption">
                        <v-col class="pt-1 pb-3">
                            <v-checkbox
                                v-model="localEnableAudio"
                                class="mt-1"
                                hide-details
                                :label="$t('Settings.WebcamsTab.EnableAudio')" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="pt-1 pb-3">
                            <div class="v-label v-label--active text-subtitle-1">
                                {{ $t('Settings.WebcamsTab.FlipWebcam') }}
                            </div>
                        </v-col>
                    </v-row>
                    <v-row class="mt-0">
                        <v-col class="py-0">
                            <v-checkbox
                                v-model="form.flip_horizontal"
                                class="mt-1"
                                hide-details
                                :label="$t('Settings.WebcamsTab.Horizontally')" />
                        </v-col>
                        <v-col class="py-0">
                            <v-checkbox
                                v-model="form.flip_vertical"
                                class="mt-1"
                                hide-details
                                :label="$t('Settings.WebcamsTab.Vertically')" />
                        </v-col>
                    </v-row>
                    <template v-if="nozzleCrosshairAvialable">
                        <v-row>
                            <v-col class="pt-3 pb-3">
                                <div class="v-label v-label--active text-subtitle-1">
                                    {{ $t('Settings.WebcamsTab.NozzleCrosshair') }}:
                                </div>
                            </v-col>
                        </v-row>
                        <v-row class="mt-0">
                            <v-col class="py-0">
                                <v-checkbox
                                    v-model="localNozzleCrosshair"
                                    class="mt-1"
                                    hide-details
                                    :label="$t('Settings.WebcamsTab.Enable')" />
                            </v-col>
                            <v-col v-if="localNozzleCrosshair" class="py-0">
                                <v-menu location="bottom end" :close-on-content-click="false">
                                    <template #activator="{ props: activatorProps }">
                                        <v-btn
                                            v-bind="activatorProps"
                                            :color="localNozzleCrosshairColor"
                                            class="minwidth-0 px-5"
                                            small />
                                    </template>
                                    <v-color-picker
                                        :value="localNozzleCrosshairColor"
                                        hide-mode-switch
                                        mode="rgba"
                                        @update:color="updateLogoColor" />
                                </v-menu>
                                <div class="v-label v-label--active text-subtitle-1 d-inline-block ml-2 mt-2">
                                    {{ $t('Settings.WebcamsTab.Color') }}
                                </div>
                            </v-col>
                        </v-row>
                        <v-row v-if="localNozzleCrosshair">
                            <v-col>
                                <v-slider
                                    v-model="localNozzleCrosshairSize"
                                    :max="1"
                                    :min="0.01"
                                    :step="0.01"
                                    thumb-label
                                    thumb-size="24"
                                    hide-details
                                    :label="$t('Settings.WebcamsTab.Size')" />
                            </v-col>
                        </v-row>
                    </template>
                </v-col>
                <v-col class="col-12 col-sm-6 text-center" align-self="center">
                    <webcam-wrapper :webcam="webcam" page="settings" />
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
            <v-btn variant="text" @click="closeForm">{{ $t('Buttons.Cancel') }}</v-btn>
            <v-btn color="primary" variant="text" type="submit" :disabled="!valid">{{ actionButtonText }}</v-btn>
        </v-card-actions>
    </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { mdiMenuDown } from '@mdi/js'
import { useWebcam } from '@/composables/useWebcam'
import type { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

const props = defineProps({
    webcam: { type: Object, required: true },
    type: { type: String, default: 'create' },
})

const emit = defineEmits<{
    (e: 'close'): void
}>()

const store = useStore()
const { t } = useI18n()
const { convertWebcamIcon } = useWebcam()

const webcamForm = ref<any>(null)
const selectIcon = ref(false)
const valid = ref(false)
const oldWebcamName = ref('')

const form = reactive({ ...(props.webcam as GuiWebcamStateWebcam) })

const localHideFps = computed({
    get: () => (props.webcam as GuiWebcamStateWebcam).extra_data?.hideFps ?? false,
    set: (newVal) => {
        if (!('extra_data' in (props.webcam as GuiWebcamStateWebcam))) {
            ;(props.webcam as GuiWebcamStateWebcam).extra_data = { hideFps: newVal }
            return
        }
        ;(props.webcam as GuiWebcamStateWebcam).extra_data!.hideFps = newVal
    },
})

const localEnableAudio = computed({
    get: () => (props.webcam as GuiWebcamStateWebcam).extra_data?.enableAudio ?? false,
    set: (newVal) => {
        if (!('extra_data' in (props.webcam as GuiWebcamStateWebcam))) {
            ;(props.webcam as GuiWebcamStateWebcam).extra_data = { enableAudio: newVal }
            return
        }
        ;(props.webcam as GuiWebcamStateWebcam).extra_data!.enableAudio = newVal
    },
})

const localNozzleCrosshair = computed({
    get: () => (props.webcam as GuiWebcamStateWebcam).extra_data?.nozzleCrosshair ?? false,
    set: (newVal) => {
        const extraData = { ...((props.webcam as GuiWebcamStateWebcam).extra_data ?? {}) }
        extraData.nozzleCrosshair = newVal
        ;(props.webcam as GuiWebcamStateWebcam).extra_data = extraData
    },
})

const localNozzleCrosshairColor = computed({
    get: () => (props.webcam as GuiWebcamStateWebcam).extra_data?.nozzleCrosshairColor ?? '#ff0000',
    set: (newVal) => {
        const extraData = { ...((props.webcam as GuiWebcamStateWebcam).extra_data ?? {}) }
        extraData.nozzleCrosshairColor = newVal
        ;(props.webcam as GuiWebcamStateWebcam).extra_data = extraData
    },
})

const localNozzleCrosshairSize = computed({
    get: () => (props.webcam as GuiWebcamStateWebcam).extra_data?.nozzleCrosshairSize ?? 0.1,
    set: (newVal) => {
        const extraData = { ...((props.webcam as GuiWebcamStateWebcam).extra_data ?? {}) }
        extraData.nozzleCrosshairSize = newVal
        ;(props.webcam as GuiWebcamStateWebcam).extra_data = extraData
    },
})

const rules = {
    required: (value: string) => value !== '' || t('Settings.WebcamsTab.Required'),
    unique: (value: string) => !existsWebcamName(value) || t('Settings.WebcamsTab.NameAlreadyExists'),
    aspect: (value: string) => {
        const match = value.toString().match(/^(\d+)\s*[:/]\s*(\d+)$/)
        if (!match) return t('Settings.WebcamsTab.InvalidAspectRatio')
        const width = parseInt(match[1])
        const height = parseInt(match[2])
        if (width < 1 || height < 1) return t('Settings.WebcamsTab.InvalidAspectRatio')
        return true
    },
}

const webcams = computed(() => store.state.gui.webcams?.webcams ?? [])

const title = computed(() => {
    if (props.type === 'create') return t('Settings.WebcamsTab.CreateWebcam')
    return t('Settings.WebcamsTab.EditWebcam')
})

const actionButtonText = computed(() => {
    if (props.type === 'create') return t('Settings.WebcamsTab.SaveWebcam')
    return t('Settings.WebcamsTab.UpdateWebcam')
})

const rotationItems = computed(() => {
    const options = [0, 90, 180, 270]
    return options.map((value) => ({ value, text: `${value}°` }))
})

const rulesStreamUrl = computed(() => {
    const r = []
    if (form.service !== 'mjpegstreamer-adaptive') {
        r.push(rules.required)
    }
    return r
})

const rulesSnapshotUrl = computed(() => {
    const r = []
    if (form.service === 'mjpegstreamer-adaptive') {
        r.push(rules.required)
    }
    return r
})

const serviceItems = computed(() => [
    { value: 'mjpegstreamer', text: t('Settings.WebcamsTab.Mjpegstreamer') },
    { value: 'mjpegstreamer-adaptive', text: t('Settings.WebcamsTab.MjpegstreamerAdaptive') },
    { value: 'uv4l-mjpeg', text: t('Settings.WebcamsTab.Uv4lMjpeg') },
    { value: 'html-video', text: t('Settings.WebcamsTab.HtmlVideo') },
    { value: 'iframe', text: t('Settings.WebcamsTab.HtmlIframe') },
    { value: 'webrtc-camerastreamer', text: t('Settings.WebcamsTab.WebrtcCameraStreamer') },
    { value: 'webrtc-go2rtc', text: t('Settings.WebcamsTab.WebrtcGo2rtc') },
    { value: 'webrtc-mediamtx', text: t('Settings.WebcamsTab.WebrtcMediaMTX') },
    { value: 'hlsstream', text: t('Settings.WebcamsTab.Hlsstream') },
    { value: 'jmuxer-stream', text: t('Settings.WebcamsTab.JMuxerStream') },
    { value: 'webrtc-janus', text: t('Settings.WebcamsTab.WebrtcJanus') },
])

const iconItems = computed(() => [
    { value: 'mdiPrinter3d', text: t('Settings.WebcamsTab.IconPrinter') },
    { value: 'mdiPrinter3dNozzle', text: t('Settings.WebcamsTab.IconNozzle') },
    { value: 'mdiRadiatorDisabled', text: t('Settings.WebcamsTab.IconBed') },
    { value: 'mdiWebcam', text: t('Settings.WebcamsTab.IconCam') },
    { value: 'mdiAlbum', text: t('Settings.WebcamsTab.IconFilament') },
    { value: 'mdiDoor', text: t('Settings.WebcamsTab.IconDoor') },
    { value: 'mdiRaspberryPi', text: t('Settings.WebcamsTab.IconMcu') },
    { value: 'mdiCampfire', text: t('Settings.WebcamsTab.IconHot') },
])

const classIconButtonArrow = computed(() => {
    const classes = ['_transition']
    if (selectIcon.value) classes.push('_rotate-180')
    return classes
})

const hasTargetFps = computed(() => ['mjpegstreamer-adaptive', 'jmuxer-stream'].includes(form.service))
const hasRotate = computed(() => [
    'hlsstream', 'html-video', 'iframe', 'jmuxer-stream', 'mjpegstreamer',
    'mjpegstreamer-adaptive', 'uv4l-mjpeg', 'webrtc-camerastreamer',
    'webrtc-go2rtc', 'webrtc-janus', 'webrtc-mediamtx',
].includes(form.service))
const hasFpsCounter = computed(() => ['mjpegstreamer', 'mjpegstreamer-adaptive'].includes(form.service))
const hasAspectRatio = computed(() => ['iframe'].includes(form.service))
const hasAudioOption = computed(() => ['webrtc-go2rtc'].includes(form.service))
const nozzleCrosshairAvialable = computed(() =>
    ['mjpegstreamer', 'mjpegstreamer-adaptive', 'webrtc-camerastreamer'].includes(form.service)
)

onMounted(() => {
    oldWebcamName.value = form.name
})

function updateLogoColor(color: string | { hex: string }) {
    if (typeof color === 'object') {
        localNozzleCrosshairColor.value = color.hex
        return
    }
    localNozzleCrosshairColor.value = color
}

function existsWebcamName(name: string) {
    name = name.toLowerCase().trim()
    const count = webcams.value.filter((webcam: GuiWebcamStateWebcam) =>
        webcam.name.toLowerCase().trim() === name
    ).length

    if (props.type === 'create') return count !== 0
    return count >= 1
}

function submit() {
    if (props.type === 'create') {
        save()
        return
    }
    update()
}

async function save() {
    await store.dispatch('gui/webcams/store', form)
    emit('close')
}

async function update() {
    await store.dispatch('gui/webcams/update', { webcam: form, oldWebcamName: oldWebcamName.value })
    emit('close')
}

function closeForm() {
    emit('close')
}
</script>

<style scoped>
:deep(._transition) svg {
    transition: transform 500ms;
}
:deep(._rotate-180) svg {
    transform: rotate(180deg);
}

.v-item-group {
    button:hover::before,
    button:focus::before {
        opacity: 0 !important;
    }
    ._menu-button {
        height: 40px;
        width: 62px;
        border: 1px solid rgba(255, 255, 255, 0.25) !important;
    }
    ._menu-button:hover {
        border-color: rgba(255, 255, 255, 1) !important;
    }
    ._menu-button:focus {
        border: 2px solid var(--color-primary) !important;
    }
}

._webcam-settings-name-field :deep(.v-text-field__details) {
    margin-bottom: -12px !important;
}
</style>
