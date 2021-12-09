<template>
    <div>
        <v-card flat v-if="!form.bool">
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.WebcamsTab.Webcams') }}</h3>
                <div v-for="(webcam) in webcams" v-bind:key="webcam.id">
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="webcam.name" :icon="webcam.icon" :sub-title="getSubtitle(webcam)">
                        <v-btn small outlined @click="editWebcam(webcam)">
                            <v-icon small left>mdi-pencil</v-icon> {{ $t('Settings.Edit') }}
                        </v-btn>
                        <v-btn small outlined @click="deleteWebcam(webcam.id)" class="ml-3 minwidth-0 px-2" color="error">
                            <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                    </settings-row>
                </div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text color="primary" @click="createWebcam">{{ $t("Settings.WebcamsTab.AddWebcam")}}</v-btn>
            </v-card-actions>
        </v-card>
        <v-card flat v-else>
            <v-form v-model="form.valid" ref="webcamForm" @submit.prevent="saveWebcam">
                <v-card-title>
                    {{ form.id === null ? $t("Settings.WebcamsTab.CreateWebcam") : $t("Settings.WebcamsTab.EditWebcam") }}
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col class="col-12 col-sm-6">
                            <v-row>
                                <v-col class="col-2">
                                    <v-item-group>
                                        <v-menu :offset-y="true" title="Icon">
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn class="px-2 minwidth-0" color="transparent" v-bind="attrs" v-on="on" elevation="0">
                                                    <v-icon>{{ form.icon }}</v-icon>
                                                </v-btn>
                                            </template>
                                            <v-list dense class="py-0">
                                                <v-list-item v-for="icon of iconItems" v-bind:key="icon.value" link @click="setFormIcon(icon.value)">
                                                    <v-list-item-icon class="mr-0">
                                                        <v-icon small>{{ icon.value }}</v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-content>
                                                        <v-list-item-title v-text="icon.text"></v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </v-item-group>
                                </v-col>
                                <v-col class="col-10">
                                    <v-text-field
                                        v-model="form.name"
                                        :label="$t('Settings.WebcamsTab.Name')"
                                        hide-details="auto"
                                        :rules="[rules.required, rules.unique]"
                                        dense
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-1">
                                    <v-text-field
                                        v-model="form.urlStream"
                                        :label="$t('Settings.WebcamsTab.UrlStream')"
                                        hide-details="auto"
                                        :rules="form.service !== 'mjpegstreamer-adaptive' ? [rules.required] : []"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-1">
                                    <v-text-field
                                        v-model="form.urlSnapshot"
                                        :label="$t('Settings.WebcamsTab.UrlSnapshot')"
                                        hide-details="auto"
                                        :rules="form.service === 'mjpegstreamer-adaptive' ? [rules.required] : []"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-1">
                                    <v-select
                                        v-model="form.service"
                                        :items="serviceItems"
                                        hide-details
                                        :label="$t('Settings.WebcamsTab.Service')"
                                        attach
                                    ></v-select>
                                </v-col>
                            </v-row>
                            <v-row v-if="form.service === 'mjpegstreamer-adaptive'">
                                <v-col class="py-1">
                                    <v-text-field
                                        v-model="form.targetFps"
                                        hide-details
                                        :label="$t('Settings.WebcamsTab.TargetFPS')"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-1">
                                    <v-checkbox
                                        v-model="form.flipX"
                                        hide-details
                                        class="mt-1"
                                        :label="$t('Settings.WebcamsTab.FlipHorizontally')"
                                    ></v-checkbox>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-1">
                                    <v-checkbox
                                        v-model="form.flipY"
                                        hide-details
                                        class="mt-1"
                                        :label="$t('Settings.WebcamsTab.FlipVertically')"
                                    ></v-checkbox>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col class="col-12 col-sm-6 text-center" align-self="center">
                            <template v-if="form.service === 'mjpegstreamer'">
                                <webcam-mjpegstreamer :cam-settings="form"></webcam-mjpegstreamer>
                            </template>
                            <template v-else-if="form.service === 'mjpegstreamer-adaptive'">
                                <webcam-mjpegstreamer-adaptive :cam-settings="form"></webcam-mjpegstreamer-adaptive>
                            </template>
                            <template v-else-if="form.service === 'uv4l-mjpeg'">
                                <webcam-uv4l-mjpeg :cam-settings="form"></webcam-uv4l-mjpeg>
                            </template>
                            <template v-else-if="form.service === 'ipstream'">
                                <webcam-ipstreamer :cam-settings="form"></webcam-ipstreamer>
                            </template>
                            <template v-else>
                                <p class="text-center py-3 font-italic">{{ $t('Panels.WebcamPanel.UnknownWebcamService') }}</p>
                            </template>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions class="d-flex justify-end">
                    <v-btn
                        text
                        @click="form.bool = false"
                    >
                        {{ $t('Settings.Cancel') }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        type="submit"
                    >
                        {{ form.id === null ? $t("Settings.WebcamsTab.SaveWebcam") : $t("Settings.WebcamsTab.UpdateWebcam") }}
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </div>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import {GuiWebcamStateWebcam} from '@/store/gui/webcams/types'
import Mjpegstreamer from '@/components/webcams/Mjpegstreamer.vue'
import MjpegstreamerAdaptive from '@/components/webcams/MjpegstreamerAdaptive.vue'
import Uv4lMjpeg from '@/components/webcams/Uv4lMjpeg.vue'
import Ipstreamer from '@/components/webcams/Ipstreamer.vue'

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
    }
})
export default class SettingsWebcamsTab extends Mixins(BaseMixin) {

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
        flipX: false,
        flipY: false,
    }

    private rules = {
        required: (value: string) => value !== '' || this.$t('Settings.WebcamsTab.Required'),
        unique: (value: string) => !this.existsWebcamName(value) || this.$t('Settings.WebcamsTab.NameAlreadyExists'),
    }

    $refs!: {
        webcamForm: any
    }

    get webcams() {
        return this.$store.getters['gui/webcams/getWebcams'] ?? []
    }

    get iconItems() {
        return [
            { value: 'mdi-printer-3d',          text: this.$t('Settings.WebcamsTab.IconPrinter') },
            { value: 'mdi-printer-3d-nozzle',   text: this.$t('Settings.WebcamsTab.IconNozzle') },
            { value: 'mdi-radiator-disabled',   text: this.$t('Settings.WebcamsTab.IconBed') },
            { value: 'mdi-webcam',              text: this.$t('Settings.WebcamsTab.IconCam') },
            { value: 'mdi-album',               text: this.$t('Settings.WebcamsTab.IconFilament') },
            { value: 'mdi-door',                text: this.$t('Settings.WebcamsTab.IconDoor') },
            { value: 'mdi-raspberry-pi',        text: this.$t('Settings.WebcamsTab.IconMcu') },
            { value: 'mdi-campfire',            text: this.$t('Settings.WebcamsTab.IconHot') },
        ]
    }

    get serviceItems() {
        return [
            { value: 'mjpegstreamer',           text: this.$t('Settings.WebcamsTab.Mjpegstreamer')},
            { value: 'mjpegstreamer-adaptive',  text: this.$t('Settings.WebcamsTab.MjpegstreamerAdaptive') },
            { value: 'uv4l-mjpeg',              text: this.$t('Settings.WebcamsTab.Uv4lMjpeg') },
            { value: 'ipstream',                text: this.$t('Settings.WebcamsTab.Ipstream') },
        ]
    }

    get webcamStyle() {
        let transforms = ''
        if (this.form.flipX) transforms += ' scaleX(-1)'
        if (this.form.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimLeft().length) {
            return { transform: transforms.trimLeft() }
        }

        return ''
    }

    getSubtitle(webcam: GuiWebcamStateWebcam) {
        return 'URL: '+ (webcam.service === 'mjpegstreamer-adaptive' ? webcam.urlSnapshot : webcam.urlStream)
    }

    existsWebcamName(name: string) {
        return (this.webcams.findIndex((webcam: GuiWebcamStateWebcam) => webcam.name === name && webcam.id !== this.form.id) !== -1)
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
        this.form.icon = 'mdi-webcam'
        this.form.service = 'mjpegstreamer-adaptive'
        this.form.targetFps = 15
        this.form.urlStream = '/webcam/?action=stream'
        this.form.urlSnapshot = '/webcam/?action=snapshot'
        this.form.flipX = false
        this.form.flipY = false
    }

    setFormIcon(icon: string) {
        this.form.icon = icon
    }
}
</script>
