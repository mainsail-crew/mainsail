<template>
    <div>
        <v-card v-if="!form.bool" flat>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.WebcamsTab.Webcams') }}</h3>
                <div v-for="webcam in webcams" :key="webcam.id">
                    <v-divider class="my-2"></v-divider>
                    <settings-row
                        :title="webcam.name"
                        :icon="convertWebcamIcon(webcam.icon)"
                        :sub-title="getSubtitle(webcam)">
                        <v-btn small outlined @click="editWebcam(webcam)">
                            <v-icon small left>{{ mdiPencil }}</v-icon>
                            {{ $t('Settings.Edit') }}
                        </v-btn>
                        <v-btn
                            small
                            outlined
                            class="ml-3 minwidth-0 px-2"
                            color="error"
                            @click="deleteWebcam(webcam.id)">
                            <v-icon small>{{ mdiDelete }}</v-icon>
                        </v-btn>
                    </settings-row>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-btn v-if="existCrowsnestConf" text color="primary" @click="openCrowsnestConf">
                    {{ $t('Settings.WebcamsTab.EditCrowsnestConf') }}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="createWebcam">{{ $t('Settings.WebcamsTab.AddWebcam') }}</v-btn>
            </v-card-actions>
        </v-card>
        <v-card v-else flat>
            <v-form ref="webcamForm" v-model="form.valid" @submit.prevent="saveWebcam">
                <v-card-title>
                    {{
                        form.id === null ? $t('Settings.WebcamsTab.CreateWebcam') : $t('Settings.WebcamsTab.EditWebcam')
                    }}
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col class="col-12 col-sm-6">
                            <v-row>
                                <v-col class="d-flex">
                                    <v-item-group>
                                        <v-menu :offset-y="true" title="Icon">
                                            <template #activator="{ on, attrs }">
                                                <v-btn
                                                    class="px-2 mr-2 _transition _menu-button"
                                                    color="transparent"
                                                    v-bind="attrs"
                                                    elevation="0"
                                                    :ripple="false"
                                                    v-on="on"
                                                    @blur="selectIcon = !selectIcon"
                                                    @focus="selectIcon = !selectIcon">
                                                    <v-icon>{{ convertWebcamIcon(form.icon) }}</v-icon>
                                                    <v-icon
                                                        :class="!selectIcon ? '' : '_rotate-180'"
                                                        :color="!selectIcon ? '' : 'primary'"
                                                        class="pl-1 mr-n2">
                                                        {{ mdiMenuDown }}
                                                    </v-icon>
                                                </v-btn>
                                            </template>
                                            <v-list dense class="py-0">
                                                <v-list-item
                                                    v-for="icon of iconItems"
                                                    :key="icon.value"
                                                    link
                                                    @click="setFormIcon(icon.value)">
                                                    <v-list-item-icon class="mr-2">
                                                        <v-icon small class="mt-1">
                                                            {{ convertWebcamIcon(icon.value) }}
                                                        </v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-content>
                                                        <v-list-item-title v-text="icon.text"></v-list-item-title>
                                                    </v-list-item-content>
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
                                        dense></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-2">
                                    <v-text-field
                                        v-model="form.urlStream"
                                        :label="$t('Settings.WebcamsTab.UrlStream')"
                                        hide-details="auto"
                                        outlined
                                        dense
                                        :rules="
                                            form.service !== 'mjpegstreamer-adaptive' ? [rules.required] : []
                                        "></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-2">
                                    <v-text-field
                                        v-model="form.urlSnapshot"
                                        :label="$t('Settings.WebcamsTab.UrlSnapshot')"
                                        hide-details="auto"
                                        outlined
                                        dense
                                        :rules="
                                            form.service === 'mjpegstreamer-adaptive' ? [rules.required] : []
                                        "></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-2">
                                    <v-select
                                        v-model="form.service"
                                        :items="serviceItems"
                                        hide-details
                                        outlined
                                        dense
                                        :label="$t('Settings.WebcamsTab.Service')"
                                        attach></v-select>
                                </v-col>
                            </v-row>
                            <v-row v-if="form.service === 'mjpegstreamer-adaptive'">
                                <v-col class="py-2 col-6">
                                    <v-text-field
                                        v-model="form.targetFps"
                                        outlined
                                        dense
                                        hide-details
                                        :label="$t('Settings.WebcamsTab.TargetFPS')"></v-text-field>
                                </v-col>
                                <v-col class="py-2 col-6">
                                    <v-select
                                        v-model="form.rotate"
                                        :items="rotateItems"
                                        outlined
                                        dense
                                        hide-details
                                        :label="$t('Settings.WebcamsTab.Rotate')"></v-select>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="pt-1 pb-3">
                                    <div class="v-label v-label--active theme--dark text-subtitle-1">
                                        {{ $t('Settings.WebcamsTab.FlipWebcam') }}
                                    </div>
                                </v-col>
                            </v-row>
                            <v-row class="mt-0">
                                <v-col class="py-0">
                                    <v-checkbox
                                        v-model="form.flipX"
                                        class="mt-1"
                                        hide-details
                                        :label="$t('Settings.WebcamsTab.Horizontally')"></v-checkbox>
                                </v-col>
                                <v-col class="py-0">
                                    <v-checkbox
                                        v-model="form.flipY"
                                        class="mt-1"
                                        hide-details
                                        :label="$t('Settings.WebcamsTab.Vertically')"></v-checkbox>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col class="col-12 col-sm-6 text-center" align-self="center">
                            <template v-if="form.service === 'mjpegstreamer'">
                                <webcam-mjpegstreamer :cam-settings="form" />
                            </template>
                            <template v-else-if="form.service === 'mjpegstreamer-adaptive'">
                                <webcam-mjpegstreamer-adaptive :cam-settings="form" />
                            </template>
                            <template v-else-if="form.service === 'uv4l-mjpeg'">
                                <webcam-uv4l-mjpeg :cam-settings="form" />
                            </template>
                            <template v-else-if="form.service === 'ipstream'">
                                <webcam-ipstreamer :cam-settings="form" />
                            </template>
                            <template v-else-if="form.service === 'hlsstream'">
                                <webcam-hlsstreamer :cam-settings="form" />
                            </template>
                            <template v-else-if="form.service === 'webrtc-camerastreamer'">
                                <webcam-webrtc-camerastreamer :cam-settings="form" />
                            </template>
                            <template v-else-if="form.service === 'webrtc-rtspsimpleserver'">
                                <webcam-webrtc-rtspsimpleserver :cam-settings="form" />
                            </template>
                            <template v-else>
                                <p class="text-center py-3 font-italic">
                                    {{ $t('Panels.WebcamPanel.UnknownWebcamService') }}
                                </p>
                            </template>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions class="d-flex justify-end">
                    <v-btn text @click="form.bool = false">
                        {{ $t('Settings.Cancel') }}
                    </v-btn>
                    <v-btn color="primary" text type="submit" :disabled="!form.name">
                        {{
                            form.id === null
                                ? $t('Settings.WebcamsTab.SaveWebcam')
                                : $t('Settings.WebcamsTab.UpdateWebcam')
                        }}
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import Mjpegstreamer from '@/components/webcams/Mjpegstreamer.vue'
import MjpegstreamerAdaptive from '@/components/webcams/MjpegstreamerAdaptive.vue'
import Uv4lMjpeg from '@/components/webcams/Uv4lMjpeg.vue'
import WebrtcCameraStreamer from '@/components/webcams/WebrtcCameraStreamer.vue'
import WebrtcRTSPSimpleServer from '@/components/webcams/WebrtcRTSPSimpleServer.vue'
import Ipstreamer from '@/components/webcams/Ipstreamer.vue'
import { mdiMenuDown, mdiDelete, mdiPencil, mdiWebcam } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'
import { FileStateFile } from '@/store/files/types'
import Hlsstreamer from '../webcams/Hlsstreamer.vue'

interface webcamForm {
    bool: boolean
    id: string | null
    valid: boolean
    name: string
    icon: string
    service: string
    targetFps: number
    urlStream: string
    urlSnapshot: string
    rotate: number
    flipX: boolean
    flipY: boolean
}

@Component({
    components: {
        SettingsRow,
        'webcam-mjpegstreamer': Mjpegstreamer,
        'webcam-mjpegstreamer-adaptive': MjpegstreamerAdaptive,
        'webcam-uv4l-mjpeg': Uv4lMjpeg,
        'webcam-ipstreamer': Ipstreamer,
        'webcam-webrtc-camerastreamer': WebrtcCameraStreamer,
        'webcam-hlsstreamer': Hlsstreamer,
        'webcam-webrtc-rtspsimpleserver': WebrtcRTSPSimpleServer,
    },
})
export default class SettingsWebcamsTab extends Mixins(BaseMixin, WebcamMixin) {
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete
    mdiMenuDown = mdiMenuDown

    private selectIcon: boolean = false

    private form: webcamForm = {
        bool: false,
        id: null,
        valid: false,
        name: '',
        icon: '',
        service: '',
        targetFps: 15,
        urlStream: '',
        urlSnapshot: '',
        rotate: 0,
        flipX: false,
        flipY: false,
    }

    private rules = {
        required: (value: string) => value !== '' || this.$t('Settings.WebcamsTab.Required'),
        unique: (value: string) => !this.existsWebcamName(value) || this.$t('Settings.WebcamsTab.NameAlreadyExists'),
    }

    private rotateItems = [
        { value: 0, text: '0°' },
        { value: 90, text: '90°' },
        { value: 180, text: '180°' },
        { value: 270, text: '270°' },
    ]

    declare $refs: {
        webcamForm: any
    }

    get webcams() {
        return this.$store.getters['gui/webcams/getWebcams'] ?? []
    }

    get iconItems() {
        return [
            { value: 'mdiPrinter3d', text: this.$t('Settings.WebcamsTab.IconPrinter') },
            { value: 'mdiPrinter3dNozzle', text: this.$t('Settings.WebcamsTab.IconNozzle') },
            { value: 'mdiRadiatorDisabled', text: this.$t('Settings.WebcamsTab.IconBed') },
            { value: 'mdiWebcam', text: this.$t('Settings.WebcamsTab.IconCam') },
            { value: 'mdiAlbum', text: this.$t('Settings.WebcamsTab.IconFilament') },
            { value: 'mdiDoor', text: this.$t('Settings.WebcamsTab.IconDoor') },
            { value: 'mdiRaspberryPi', text: this.$t('Settings.WebcamsTab.IconMcu') },
            { value: 'mdiCampfire', text: this.$t('Settings.WebcamsTab.IconHot') },
        ]
    }

    get serviceItems() {
        return [
            { value: 'mjpegstreamer', text: this.$t('Settings.WebcamsTab.Mjpegstreamer') },
            { value: 'mjpegstreamer-adaptive', text: this.$t('Settings.WebcamsTab.MjpegstreamerAdaptive') },
            { value: 'uv4l-mjpeg', text: this.$t('Settings.WebcamsTab.Uv4lMjpeg') },
            { value: 'ipstream', text: this.$t('Settings.WebcamsTab.Ipstream') },
            { value: 'webrtc-camerastreamer', text: this.$t('Settings.WebcamsTab.WebrtcCameraStreamer') },
            { value: 'webrtc-rtspsimpleserver', text: this.$t('Settings.WebcamsTab.WebrtcRTSPSimpleServer') },
            { value: 'hlsstream', text: this.$t('Settings.WebcamsTab.Hlsstream') },
        ]
    }

    get configfiles() {
        return this.$store.getters['files/getDirectory']('config')?.childrens ?? []
    }

    get crowsnestConf(): FileStateFile | null {
        return this.configfiles.find((file: FileStateFile) => file.filename === 'crowsnest.conf')
    }

    get existCrowsnestConf(): boolean {
        return this.configfiles.findIndex((file: FileStateFile) => file.filename === 'crowsnest.conf') !== -1
    }

    getSubtitle(webcam: GuiWebcamStateWebcam) {
        return 'URL: ' + (webcam.service === 'mjpegstreamer-adaptive' ? webcam.urlSnapshot : webcam.urlStream)
    }

    existsWebcamName(name: string) {
        return (
            this.webcams.findIndex(
                (webcam: GuiWebcamStateWebcam) => webcam.name === name && webcam.id !== this.form.id
            ) !== -1
        )
    }

    createWebcam() {
        this.clearDialog()

        this.form.bool = true
    }

    editWebcam(webcam: GuiWebcamStateWebcam) {
        this.form.id = webcam.id ?? null
        this.form.name = webcam.name
        this.form.icon = webcam.icon
        this.form.service = webcam.service
        this.form.targetFps = webcam.targetFps
        this.form.urlStream = webcam.urlStream
        this.form.urlSnapshot = webcam.urlSnapshot
        this.form.rotate = webcam.rotate ?? 0
        this.form.flipX = webcam.flipX
        this.form.flipY = webcam.flipY

        this.form.bool = true
        this.form.valid = false

        this.$nextTick(() => {
            this.$refs.webcamForm?.validate()
        })
    }

    saveWebcam() {
        if (this.form.valid) {
            const values = {
                name: this.form.name,
                icon: this.form.icon,
                service: this.form.service,
                targetFps: this.form.targetFps,
                urlStream: this.form.urlStream,
                urlSnapshot: this.form.urlSnapshot,
                rotate: this.form.rotate,
                flipX: this.form.flipX,
                flipY: this.form.flipY,
            }

            if (this.form.id !== null) this.$store.dispatch('gui/webcams/update', { id: this.form.id, values: values })
            else this.$store.dispatch('gui/webcams/store', { values })

            this.clearDialog()
        }
    }

    deleteWebcam(id: string) {
        this.$store.dispatch('gui/webcams/delete', id)
    }

    clearDialog() {
        this.form.bool = false
        this.form.id = null
        this.form.name = ''
        this.form.icon = mdiWebcam
        this.form.service = 'mjpegstreamer-adaptive'
        this.form.targetFps = 15
        this.form.urlStream = '/webcam/?action=stream'
        this.form.urlSnapshot = '/webcam/?action=snapshot'
        this.form.rotate = 0
        this.form.flipX = false
        this.form.flipY = false
    }

    setFormIcon(icon: string) {
        this.form.icon = icon
    }

    openCrowsnestConf() {
        this.$store.dispatch('editor/openFile', {
            root: 'config',
            path: '/',
            filename: this.crowsnestConf?.filename,
            size: this.crowsnestConf?.size,
            permissions: this.crowsnestConf?.permissions,
        })
    }
}
</script>

<style lang="scss" scoped>
._transition i::before {
    transition: transform 500ms;
}
._rotate-180:before {
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

._webcam-settings-name-field ::v-deep .v-text-field__details {
    margin-bottom: -12px !important;
}
</style>
