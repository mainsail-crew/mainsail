<style scoped></style>

<template>
    <div>
        <v-card class="mb-3">
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading align-baseline">
                        <v-icon left>{{ mdiInformation }}</v-icon>
                        {{ $t('Timelapse.Status') }}
                    </span>
                </v-toolbar-title>
            </v-toolbar>
            <v-row no-gutters>
                <v-col class="col-12 col-sm-6 col-md-12 pb-3 pb-md-0 text--secondary">
                    <v-card-text v-if="frameUrl" class="pb-0">
                        <v-row>
                            <v-col>
                                <vue-load-image>
                                    <img
                                        ref="timelapsePreview"
                                        slot="image"
                                        :src="frameUrl"
                                        :alt="$t('Timelapse.Preview')"
                                        class="w-100"
                                        :style="webcamStyle"
                                        @load="calcRatio" />
                                    <div slot="preloader">
                                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                    </div>
                                    <div slot="error">
                                        <v-icon>{{ mdiFile }}</v-icon>
                                    </div>
                                </vue-load-image>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-col>
                <v-col
                    v-if="framesCount > 0"
                    class="col-12 col-sm-6 col-md-12 pt-3 pt-md-0 text--secondary"
                    align-self="center">
                    <v-card-text :class="framesCount ? 'pt-0' : ''">
                        <template v-if="framesCount > 0">
                            <settings-row :title="$t('Timelapse.Frames').toString()">
                                {{ framesCount }}
                            </settings-row>
                            <v-divider class="my-2"></v-divider>
                            <settings-row
                                :title="$t('Timelapse.EstimatedLength').toString()"
                                :dynamic-slot-width="true">
                                {{ estimatedVideoLength }}
                            </settings-row>
                        </template>
                        <template v-if="['printing', 'paused'].includes(printer_state)">
                            <v-divider class="my-2"></v-divider>
                            <settings-row :title="$t('Timelapse.Enabled').toString()" :dynamic-slot-width="true">
                                <v-switch v-model="enabled" hide-details class="mt-0"></v-switch>
                            </settings-row>
                            <template v-if="enabled">
                                <v-divider v-if="framesCount > 0" class="my-2"></v-divider>
                                <settings-row :title="$t('Timelapse.Autorender').toString()" :dynamic-slot-width="true">
                                    <v-switch v-model="autorender" hide-details class="mt-0"></v-switch>
                                </settings-row>
                            </template>
                        </template>
                        <template v-if="framesCount > 0 && !['printing', 'paused'].includes(printer_state)">
                            <v-divider class="mt-2 mb-4"></v-divider>
                            <v-row>
                                <v-col class="text-center">
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
                    </v-card-text>
                </v-col>
                <v-col v-else class="col-12 text--secondary" align-self="center">
                    <v-card-text class="pt-0 pt-md-3">
                        <p class="text-center my-0 font-italic">{{ $t('Timelapse.NoActiveTimelapse') }}</p>
                    </v-card-text>
                </v-col>
            </v-row>
        </v-card>
        <v-dialog v-model="boolDialogRendersettings" :max-width="700" :max-height="500">
            <panel
                :title="$t('Timelapse.RenderSettings').toString()"
                :icon="mdiTextBoxSearchOutline"
                card-class="timelapse-rendersettings-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon @click="boolDialogRendersettings = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="">
                    <v-row>
                        <v-col class="col-4">
                            <v-select
                                v-model="variable_fps"
                                :label="$t('Timelapse.Type')"
                                :items="framerateTypeOptions"
                                outlined
                                dense
                                hide-details></v-select>
                        </v-col>
                        <v-col class="col-4">
                            <template v-if="variable_fps">
                                <v-text-field
                                    v-model="variable_fps_min"
                                    :label="$t('Timelapse.MinFramerate')"
                                    type="number"
                                    outlined
                                    dense
                                    hide-details
                                    hide-spin-buttons></v-text-field>
                                <v-text-field
                                    v-model="variable_fps_max"
                                    :label="$t('Timelapse.MaxFramerate')"
                                    type="number"
                                    outlined
                                    dense
                                    hide-details
                                    hide-spin-buttons
                                    class="mt-3"></v-text-field>
                                <v-text-field
                                    v-model="targetlength"
                                    :label="$t('Timelapse.Targetlength')"
                                    type="number"
                                    outlined
                                    dense
                                    hide-details
                                    hide-spin-buttons
                                    class="mt-3"></v-text-field>
                            </template>
                            <template v-else>
                                <v-text-field
                                    v-model="output_framerate"
                                    :label="$t('Timelapse.Framerate')"
                                    type="number"
                                    outlined
                                    dense
                                    hide-details
                                    hide-spin-buttons></v-text-field>
                            </template>
                            <v-text-field
                                v-model="duplicatelastframe"
                                :label="$t('Timelapse.DuplicateLastframe')"
                                type="number"
                                outlined
                                dense
                                hide-details
                                hide-spin-buttons
                                class="mt-3"></v-text-field>
                        </v-col>
                        <v-col class="col-4">
                            <template v-if="variable_fps">
                                <v-text-field
                                    v-model="variableTargetFps"
                                    :label="$t('Timelapse.TargetFps')"
                                    type="number"
                                    outlined
                                    dense
                                    hide-details
                                    readonly
                                    class="mb-3"></v-text-field>
                            </template>
                            <v-text-field
                                v-model="estimatedVideoLength"
                                :label="$t('Timelapse.EstimatedLength')"
                                outlined
                                dense
                                hide-details
                                readonly></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="boolDialogRendersettings = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn text color="primary" @click="startRender">{{ $t('Timelapse.StartRender') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiFile, mdiInformation, mdiTextBoxSearchOutline, mdiCloseThick } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'
@Component({
    components: { Panel, SettingsRow },
})
export default class TimelapseStatusPanel extends Mixins(BaseMixin, WebcamMixin) {
    mdiInformation = mdiInformation
    mdiFile = mdiFile
    mdiCloseThick = mdiCloseThick
    mdiTextBoxSearchOutline = mdiTextBoxSearchOutline

    private boolDialogRendersettings = false
    private scale = 1

    declare $refs: {
        timelapsePreview: HTMLImageElement
    }

    get frameUrl() {
        const frame = this.$store.state.server.timelapse?.lastFrame?.file ?? null

        if (frame) {
            return this.apiUrl + '/server/files/timelapse_frames/' + frame
        }

        return null
    }

    get framesCount() {
        return this.$store.state.server.timelapse?.lastFrame?.count ?? 0
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

    get variable_fps() {
        return this.$store.state.server.timelapse?.settings?.variable_fps ?? false
    }

    set variable_fps(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps: newVal })
    }

    get framerateTypeOptions() {
        return [
            {
                value: false,
                text: this.$t('Timelapse.Fixed'),
            },
            {
                value: true,
                text: this.$t('Timelapse.Variable'),
            },
        ]
    }

    get variable_fps_min() {
        return this.$store.state.server.timelapse?.settings?.variable_fps_min ?? 5
    }

    set variable_fps_min(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_min: newVal })
    }

    get variable_fps_max() {
        return this.$store.state.server.timelapse?.settings?.variable_fps_max ?? 60
    }

    set variable_fps_max(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_max: newVal })
    }

    get targetlength() {
        return this.$store.state.server.timelapse?.settings?.targetlength ?? 10
    }

    set targetlength(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { targetlength: newVal })
    }

    get output_framerate() {
        return this.$store.state.server.timelapse?.settings?.output_framerate ?? 30
    }

    set output_framerate(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { output_framerate: newVal })
    }

    get duplicatelastframe() {
        return this.$store.state.server.timelapse?.settings?.duplicatelastframe ?? 0
    }

    set duplicatelastframe(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { duplicatelastframe: newVal })
    }

    get estimatedVideoLength() {
        let seconds = Math.round((this.framesCount + this.duplicatelastframe) / this.output_framerate)

        if (this.variable_fps) {
            seconds = Math.round((this.framesCount + this.duplicatelastframe) / this.variableTargetFps)
            if (seconds < this.targetlength) seconds = this.targetlength
        }

        return seconds > 60
            ? Math.floor(seconds / 60) + 'm ' + (seconds - Math.floor(seconds / 60) * 60) + 's'
            : seconds + 's'
    }

    get variableTargetFps() {
        let targetFps = Math.floor(this.framesCount / this.targetlength)
        targetFps = Math.max(targetFps, this.variable_fps_min)
        targetFps = Math.min(targetFps, this.variable_fps_max)

        return targetFps
    }

    get disableRenderButton() {
        return (this.$store.state.server.timelapse?.rendering.status ?? '') === 'running'
    }

    get camId() {
        return this.$store.state.server.timelapse.settings.camera ?? ''
    }

    get camSettings() {
        return this.$store.getters['gui/webcams/getWebcam'](this.camId)
    }

    get webcamStyle() {
        return {
            transform: this.generateTransform(
                this.camSettings.flip_horizontal ?? false,
                this.camSettings.flip_vertical ?? false,
                this.camSettings.rotation ?? 0
            ),
        }
    }

    startRender() {
        this.boolDialogRendersettings = false

        this.$socket.emit('machine.timelapse.render', {})
    }

    saveFrames() {
        this.$socket.emit('machine.timelapse.saveframes', {}, { loading: 'timelapse_saveframes' })
    }

    calcRatio() {
        if (this.$refs.timelapsePreview) {
            this.scale = this.$refs.timelapsePreview.naturalHeight / this.$refs.timelapsePreview.naturalWidth
            if (this.scale > 1) {
                this.scale = this.$refs.timelapsePreview.naturalWidth / this.$refs.timelapsePreview.naturalHeight
            }
        }
    }
}
</script>
