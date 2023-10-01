<template>
    <v-form ref="webcamForm" v-model="valid" @submit.prevent="submit">
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>
            <v-row>
                <v-col class="col-12 col-sm-6">
                    <v-row>
                        <v-col class="d-flex">
                            <v-item-group>
                                <v-menu v-model="selectIcon" :offset-y="true" title="Icon">
                                    <template #activator="{ on, attrs }">
                                        <v-btn
                                            class="px-2 mr-2 _transition _menu-button"
                                            color="transparent"
                                            v-bind="attrs"
                                            elevation="0"
                                            :ripple="false"
                                            v-on="on">
                                            <v-icon>{{ convertWebcamIcon(webcam.icon) }}</v-icon>
                                            <v-icon :class="classIconButtonArrow" class="pl-1 mr-n2">
                                                {{ mdiMenuDown }}
                                            </v-icon>
                                        </v-btn>
                                    </template>
                                    <v-list dense class="py-0">
                                        <v-list-item
                                            v-for="icon of iconItems"
                                            :key="icon.value"
                                            link
                                            @click="webcam.icon = icon.value">
                                            <v-list-item-icon class="mr-2">
                                                <v-icon small class="mt-1">
                                                    {{ convertWebcamIcon(icon.value) }}
                                                </v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                <v-list-item-title v-text="icon.text" />
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </v-item-group>
                            <v-text-field
                                v-model="webcam.name"
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
                                v-model="webcam.stream_url"
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
                                v-model="webcam.snapshot_url"
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
                                v-model="webcam.service"
                                :items="serviceItems"
                                hide-details
                                outlined
                                dense
                                :label="$t('Settings.WebcamsTab.Service')" />
                        </v-col>
                    </v-row>
                    <v-row v-if="['mjpegstreamer-adaptive', 'jmuxer-stream'].includes(webcam.service)">
                        <v-col class="py-2 col-6">
                            <v-text-field
                                v-model="webcam.target_fps"
                                outlined
                                dense
                                hide-details
                                :label="$t('Settings.WebcamsTab.TargetFPS')" />
                        </v-col>
                        <v-col class="py-2 col-6">
                            <v-select
                                v-model="webcam.rotation"
                                :items="rotationItems"
                                outlined
                                dense
                                hide-details
                                :label="$t('Settings.WebcamsTab.Rotate')" />
                        </v-col>
                    </v-row>
                    <v-row v-if="hasFpsCounter">
                        <v-col class="pt-1 pb-3">
                            <v-checkbox
                                v-model="hideFps"
                                class="mt-1"
                                hide-details
                                :label="$t('Settings.WebcamsTab.HideFps')" />
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
                                v-model="webcam.flip_horizontal"
                                class="mt-1"
                                hide-details
                                :label="$t('Settings.WebcamsTab.Horizontally')" />
                        </v-col>
                        <v-col class="py-0">
                            <v-checkbox
                                v-model="webcam.flip_vertical"
                                class="mt-1"
                                hide-details
                                :label="$t('Settings.WebcamsTab.Vertically')" />
                        </v-col>
                    </v-row>
                </v-col>
                <v-col class="col-12 col-sm-6 text-center" align-self="center">
                    <webcam-wrapper :webcam="webcam" />
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
            <v-btn text @click="closeForm">{{ $t('Settings.Cancel') }}</v-btn>
            <v-btn color="primary" text type="submit" :disabled="!valid">{{ actionButtonText }}</v-btn>
        </v-card-actions>
    </v-form>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPencil, mdiMenuDown } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

@Component({
    components: {
        SettingsRow,
    },
})
export default class WebcamForm extends Mixins(BaseMixin, WebcamMixin) {
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete
    mdiMenuDown = mdiMenuDown

    @Prop({ type: Object, required: true }) private webcam!: GuiWebcamStateWebcam
    @Prop({ type: String, default: 'create' }) readonly type!: 'create' | 'edit'

    private selectIcon = false
    private valid = false
    private oldWebcamName = ''

    private rules = {
        required: (value: string) => value !== '' || this.$t('Settings.WebcamsTab.Required'),
        unique: (value: string) => !this.existsWebcamName(value) || this.$t('Settings.WebcamsTab.NameAlreadyExists'),
    }

    get webcams() {
        return this.$store.state.gui.webcams?.webcams ?? []
    }

    get title() {
        if (this.type === 'create') return this.$t('Settings.WebcamsTab.CreateWebcam')

        return this.$t('Settings.WebcamsTab.EditWebcam')
    }

    get actionButtonText() {
        if (this.type === 'create') return this.$t('Settings.WebcamsTab.SaveWebcam')

        return this.$t('Settings.WebcamsTab.UpdateWebcam')
    }

    get rotationItems() {
        const options = [0, 90, 180, 270]
        const output: { value: number; text: string }[] = []

        options.forEach((value: number) => {
            output.push({ value, text: `${value}°` })
        })

        return output
    }

    get rulesStreamUrl() {
        let rules = []

        if (this.webcam.service !== 'mjpegstreamer-adaptive') {
            rules.push(this.rules.required)
        }

        return rules
    }

    get rulesSnapshotUrl() {
        let rules = []

        if (this.webcam.service === 'mjpegstreamer-adaptive') {
            rules.push(this.rules.required)
        }

        return rules
    }

    get serviceItems() {
        return [
            { value: 'mjpegstreamer', text: this.$t('Settings.WebcamsTab.Mjpegstreamer') },
            { value: 'mjpegstreamer-adaptive', text: this.$t('Settings.WebcamsTab.MjpegstreamerAdaptive') },
            { value: 'uv4l-mjpeg', text: this.$t('Settings.WebcamsTab.Uv4lMjpeg') },
            { value: 'ipstream', text: this.$t('Settings.WebcamsTab.Ipstream') },
            { value: 'webrtc-camerastreamer', text: this.$t('Settings.WebcamsTab.WebrtcCameraStreamer') },
            { value: 'webrtc-mediamtx', text: this.$t('Settings.WebcamsTab.WebrtcMediaMTX') },
            { value: 'hlsstream', text: this.$t('Settings.WebcamsTab.Hlsstream') },
            { value: 'jmuxer-stream', text: this.$t('Settings.WebcamsTab.JMuxerStream') },
            { value: 'webrtc-janus', text: this.$t('Settings.WebcamsTab.WebrtcJanus') },
        ]
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

    get classIconButtonArrow() {
        let classes = ['_transition']

        if (this.selectIcon) classes.push('_rotate-180')

        return classes
    }

    get hasFpsCounter() {
        return ['mjpegstreamer', 'mjpegstreamer-adaptive'].includes(this.webcam.service)
    }

    get hideFps() {
        return this.webcam.extra_data?.hideFps ?? false
    }

    set hideFps(newVal) {
        if (!('extra_data' in this.webcam)) {
            this.webcam.extra_data = {
                hideFps: newVal,
            }

            return
        }

        // @ts-ignore
        this.webcam.extra_data.hideFps = newVal
    }

    mounted() {
        this.oldWebcamName = this.webcam.name
    }

    existsWebcamName(name: string) {
        name = name.toLowerCase().trim()

        const count =
            this.webcams.find((webcam: GuiWebcamStateWebcam) => webcam.name.toLowerCase().trim() === name)?.length ?? 0

        // If we are creating a new webcam, we only want to check if the name already exists
        if (this.type === 'create') return count !== 0

        // If we are editing a webcam, we want to check if the name only exists once (the one we are editing)
        return count >= 1
    }

    submit() {
        if (this.type === 'create') {
            this.save()
            return
        }

        this.update()
    }

    async save() {
        await this.$store.dispatch('gui/webcams/store', this.webcam)
        this.$emit('close')
    }

    async update() {
        await this.$store.dispatch('gui/webcams/update', { webcam: this.webcam, oldWebcamName: this.oldWebcamName })
        this.$emit('close')
    }

    closeForm() {
        this.$emit('close')
    }
}
</script>

<style lang="scss" scoped>
::v-deep ._transition svg {
    transition: transform 500ms;
}
::v-deep ._rotate-180 svg {
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
