<template>
    <panel :title="$t('Timelapse.Status')" :icon="mdiInformation" card-class="timelapse-status-panel">
        <v-card-text v-if="framesCount">
            <v-row v-if="frameUrl">
                <v-col class="pb-0">
                    <vue-load-image class="d-flex align-center justify-center">
                        <img
                            ref="timelapsePreview"
                            slot="image"
                            :src="frameUrl"
                            :alt="$t('Timelapse.Preview').toString()"
                            class="w-100"
                            :style="webcamStyle"
                            @load="calcRatio" />
                        <div slot="preloader">
                            <v-progress-circular indeterminate color="primary" />
                        </div>
                        <div slot="error">
                            <v-icon>{{ mdiFile }}</v-icon>
                        </div>
                    </vue-load-image>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="text--secondary">
                    <settings-row :title="$t('Timelapse.Frames')" :dynamic-slot-width="true">
                        {{ framesCount }}
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Timelapse.EstimatedLength')" :dynamic-slot-width="true">
                        {{ estimatedVideoLength }}
                    </settings-row>
                    <template v-if="!['printing', 'paused'].includes(printer_state)">
                        <v-divider class="mt-2 mb-4" />
                        <v-row>
                            <v-col class="text-center py-1">
                                <v-btn
                                    text
                                    color="primary"
                                    :disabled="disableRenderButton"
                                    @click="boolDialogRendersettings = true">
                                    {{ $t('Timelapse.Render') }}
                                </v-btn>
                                <v-btn
                                    text
                                    color="primary"
                                    :loading="loadings.includes('timelapse_saveframes')"
                                    @click="saveFrames">
                                    {{ $t('Timelapse.SaveFrames') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-text v-else class="">
            <p class="text-center my-0 font-italic">{{ $t('Timelapse.NoActiveTimelapse') }}</p>
        </v-card-text>
        <v-card-text v-if="['printing', 'paused'].includes(printer_state)" class="pt-0">
            <v-divider class="mt-0 mb-2" />
            <settings-row :title="$t('Timelapse.Enabled')" :dynamic-slot-width="true">
                <v-switch v-model="enabled" hide-details class="mt-0" />
            </settings-row>
            <template v-if="enabled">
                <v-divider class="my-2" />
                <settings-row :title="$t('Timelapse.Autorender')" :dynamic-slot-width="true">
                    <v-switch v-model="autorender" hide-details class="mt-0" />
                </settings-row>
            </template>
        </v-card-text>
        <timelapse-renderingsettings-dialog
            :show="boolDialogRendersettings"
            @close="boolDialogRendersettings = false" />
    </panel>
</template>
<script lang="ts">
import { Component, Mixins, Ref } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiFile, mdiInformation, mdiCloseThick } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'
import TimelapseRenderingsettingsDialog from '@/components/dialogs/TimelapseRenderingsettingsDialog.vue'
import TimelapseMixin from '@/components/mixins/timelapse'
@Component({
    components: { TimelapseRenderingsettingsDialog, Panel, SettingsRow },
})
export default class TimelapseStatusPanel extends Mixins(BaseMixin, TimelapseMixin, WebcamMixin) {
    mdiInformation = mdiInformation
    mdiFile = mdiFile
    mdiCloseThick = mdiCloseThick

    boolDialogRendersettings = false
    scale = 1

    @Ref('timelapsePreview') timelapsePreview!: HTMLImageElement

    get frameUrl() {
        const frame = this.$store.state.server.timelapse?.lastFrame?.file ?? null

        if (frame) {
            return this.apiUrl + '/server/files/timelapse_frames/' + frame
        }

        return null
    }

    get enabled() {
        return this.$store.state.server.timelapse?.settings?.enabled ?? false
    }

    set enabled(newVal) {
        this.$socket.emit(
            'machine.timelapse.post_settings',
            { enabled: newVal },
            { action: 'server/timelapse/initSettings' }
        )
    }

    get autorender() {
        return this.$store.state.server.timelapse?.settings?.autorender ?? false
    }

    set autorender(newVal) {
        this.$socket.emit(
            'machine.timelapse.post_settings',
            { autorender: newVal },
            { action: 'server/timelapse/initSettings' }
        )
    }

    get disableRenderButton() {
        return (this.$store.state.server.timelapse?.rendering.status ?? '') === 'running'
    }

    get existsSnapshoturlInMoonrakerConfig() {
        return 'snapshoturl' in this.$store.state.server.config.orig.timelapse
    }

    get moonrakerTimelapseConfig() {
        return this.$store.state.server.config.config.timelapse ?? {}
    }

    get camId() {
        return this.$store.state.server.timelapse.settings.camera ?? ''
    }

    get camSettings() {
        return this.$store.getters['gui/webcams/getWebcam'](this.camId)
    }

    get webcamStyle() {
        // if the snapshoturl is set in moonraker config,
        // we also use the flip_x and flip_y values from the moonraker config
        if (this.existsSnapshoturlInMoonrakerConfig) {
            return {
                transform: this.generateTransform(
                    this.moonrakerTimelapseConfig.flip_x ?? false,
                    this.moonrakerTimelapseConfig.flip_y ?? false,
                    0
                ),
            }
        }

        if (!this.camSettings) return {}

        return {
            transform: this.generateTransform(
                this.camSettings.flip_horizontal ?? false,
                this.camSettings.flip_vertical ?? false,
                this.camSettings.rotation ?? 0
            ),
        }
    }

    saveFrames() {
        this.$socket.emit('machine.timelapse.saveframes', {}, { loading: 'timelapse_saveframes' })
    }

    calcRatio() {
        this.scale = this.timelapsePreview.naturalHeight / this.timelapsePreview.naturalWidth

        if (this.scale > 1) {
            this.scale = this.timelapsePreview.naturalWidth / this.timelapsePreview.naturalHeight
        }
    }
}
</script>
