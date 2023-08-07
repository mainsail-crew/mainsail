<template>
    <div>
        <v-card flat>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.TimelapseTab.General') }}</h3>
                <settings-row
                    :title="$t('Settings.TimelapseTab.Enabled')"
                    :sub-title="$t('Settings.TimelapseTab.EnabledDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="enabled"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('enabled')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.Autorender')"
                    :sub-title="$t('Settings.TimelapseTab.AutorenderDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="autorender"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('autorender')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.Camera')"
                    :sub-title="$t('Settings.TimelapseTab.CameraDescription')">
                    <v-select
                        v-model="camera"
                        :items="cameraOptions"
                        hide-details
                        outlined
                        dense
                        :disabled="blockedsettings.includes('camera') || blockedsettings.includes('snapshoturl')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.Mode')"
                    :sub-title="$t('Settings.TimelapseTab.ModeDescription')">
                    <v-select
                        v-model="mode"
                        :items="modeOptions"
                        hide-details
                        outlined
                        dense
                        :disabled="blockedsettings.includes('modeOptions')" />
                </settings-row>
                <template v-if="mode === 'hyperlapse'">
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.HyperlapseCycle')"
                        :sub-title="$t('Settings.TimelapseTab.HyperlapseCycleDescription')">
                        <v-text-field
                            v-model="hyperlapseCycle"
                            type="number"
                            suffix="s"
                            hide-details="auto"
                            outlined
                            dense
                            :disabled="blockedsettings.includes('hyperlapseCycle')"
                            hide-spin-buttons />
                    </settings-row>
                </template>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.PreviewImage')"
                    :sub-title="$t('Settings.TimelapseTab.PreviewImageDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="previewimage"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('previewimage')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.SaveFrames')"
                    :sub-title="$t('Settings.TimelapseTab.SaveFramesDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="saveframes"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('saveframes')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.StreamDelayCompensation')"
                    :sub-title="$t('Settings.TimelapseTab.StreamDelayCompensationDescription')">
                    <v-text-field
                        v-model="stream_delay_compensation"
                        type="number"
                        suffix="s"
                        step="0.01"
                        hide-details="auto"
                        outlined
                        dense
                        :disabled="blockedsettings.includes('stream_delay_compensation')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.GcodeVerbose')"
                    :sub-title="$t('Settings.TimelapseTab.GcodeVerboseDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="gcode_verbose"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('gcode_verbose')" />
                </settings-row>
                <v-divider class="my-2" />
                <h3 class="text-h5 mt-6 mb-3">{{ $t('Settings.TimelapseTab.Parkhead') }}</h3>
                <settings-row
                    :title="$t('Settings.TimelapseTab.Parkhead')"
                    :sub-title="$t('Settings.TimelapseTab.ParkheadDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="parkhead"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('parkhead')" />
                </settings-row>
                <template v-if="parkhead">
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.Parkpos')"
                        :sub-title="$t('Settings.TimelapseTab.ParkposDescription')">
                        <v-select
                            v-model="parkpos"
                            :items="parkposOptions"
                            hide-details
                            outlined
                            dense
                            :disabled="blockedsettings.includes('parkposOptions')" />
                    </settings-row>
                    <template v-if="['x_only', 'custom'].includes(parkpos)">
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.PosX')"
                            :sub-title="$t('Settings.TimelapseTab.PosXDescription')">
                            <v-text-field
                                v-model="park_custom_pos_x"
                                type="number"
                                suffix="mm"
                                hide-details="auto"
                                outlined
                                dense
                                :disabled="blockedsettings.includes('park_custom_pos_x')"
                                hide-spin-buttons />
                        </settings-row>
                    </template>
                    <template v-if="['y_only', 'custom'].includes(parkpos)">
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.PosY')"
                            :sub-title="$t('Settings.TimelapseTab.PosYDescription')">
                            <v-text-field
                                v-model="park_custom_pos_y"
                                type="number"
                                suffix="mm"
                                hide-details="auto"
                                outlined
                                dense
                                :disabled="blockedsettings.includes('park_custom_pos_y')"
                                hide-spin-buttons />
                        </settings-row>
                    </template>
                    <template v-if="['x_only', 'y_only', 'custom'].includes(parkpos)">
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.PosDZ')"
                            :sub-title="$t('Settings.TimelapseTab.PosDZDescription')">
                            <v-text-field
                                v-model="park_custom_pos_dz"
                                type="number"
                                suffix="mm"
                                hide-details="auto"
                                outlined
                                dense
                                :disabled="blockedsettings.includes('park_custom_pos_dz')"
                                hide-spin-buttons />
                        </settings-row>
                    </template>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.TravelSpeed')"
                        :sub-title="$t('Settings.TimelapseTab.TravelSpeedDescription')">
                        <v-text-field
                            v-model="park_travel_speed"
                            type="number"
                            suffix="mm/s"
                            hide-details="auto"
                            outlined
                            dense
                            :disabled="blockedsettings.includes('park_travel_speed')"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.FwRetract')"
                        :sub-title="$t('Settings.TimelapseTab.FwRetractDescription')"
                        :dynamic-slot-width="true">
                        <v-switch
                            v-model="fw_retract"
                            hide-details
                            class="mt-0"
                            :disabled="blockedsettings.includes('fw_retract')" />
                    </settings-row>
                    <template v-if="!fw_retract">
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.RetractSpeed')"
                            :sub-title="$t('Settings.TimelapseTab.RetractSpeedDescription')">
                            <v-text-field
                                v-model="park_retract_speed"
                                type="number"
                                suffix="mm/s"
                                hide-details="auto"
                                outlined
                                dense
                                :disabled="blockedsettings.includes('park_retract_speed')"
                                hide-spin-buttons />
                        </settings-row>
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.RetractDistance')"
                            :sub-title="$t('Settings.TimelapseTab.RetractDistanceDescription')">
                            <v-text-field
                                v-model="park_retract_distance"
                                type="number"
                                suffix="mm"
                                hide-details="auto"
                                outlined
                                dense
                                :disabled="blockedsettings.includes('park_retract_distance')"
                                hide-spin-buttons />
                        </settings-row>
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.UnretractSpeed')"
                            :sub-title="$t('Settings.TimelapseTab.UnretractSpeedDescription')">
                            <v-text-field
                                v-model="park_extrude_speed"
                                type="number"
                                suffix="mm/s"
                                hide-details="auto"
                                outlined
                                dense
                                :disabled="blockedsettings.includes('park_extrude_speed')"
                                hide-spin-buttons />
                        </settings-row>
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.UnretractDistance')"
                            :sub-title="$t('Settings.TimelapseTab.UnretractDistanceDescription')">
                            <v-text-field
                                v-model="park_extrude_distance"
                                type="number"
                                suffix="mm"
                                hide-details="auto"
                                outlined
                                dense
                                :disabled="blockedsettings.includes('park_extrude_distance')"
                                hide-spin-buttons />
                        </settings-row>
                    </template>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.ParkTime')"
                        :sub-title="$t('Settings.TimelapseTab.ParkTimeDescription')">
                        <v-text-field
                            v-model="park_time"
                            type="number"
                            suffix="s"
                            hide-details="auto"
                            step="0.1"
                            outlined
                            dense
                            :disabled="blockedsettings.includes('park_time')" />
                    </settings-row>
                </template>
                <v-divider class="my-2" />
                <h3 class="text-h5 mt-6 mb-3">{{ $t('Settings.TimelapseTab.RenderingOptions') }}</h3>
                <settings-row
                    :title="$t('Settings.TimelapseTab.VariableFps')"
                    :sub-title="$t('Settings.TimelapseTab.VariableFpsDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="variable_fps"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('variable_fps')" />
                </settings-row>
                <template v-if="variable_fps">
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.Targetlength')"
                        :sub-title="$t('Settings.TimelapseTab.TargetlengthDescription')">
                        <v-text-field
                            v-model="targetlength"
                            type="number"
                            suffix="s"
                            hide-details="auto"
                            outlined
                            dense
                            :disabled="blockedsettings.includes('targetlength')"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.VariableFpsMin')"
                        :sub-title="$t('Settings.TimelapseTab.VariableFpsMinDescription')">
                        <v-text-field
                            v-model="variable_fps_min"
                            type="number"
                            suffix="frames"
                            hide-details="auto"
                            outlined
                            dense
                            :disabled="blockedsettings.includes('variable_fps_min')"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.VariableFpsMax')"
                        :sub-title="$t('Settings.TimelapseTab.VariableFpsMaxDescription')">
                        <v-text-field
                            v-model="variable_fps_max"
                            type="number"
                            suffix="frames"
                            hide-details="auto"
                            outlined
                            dense
                            :disabled="blockedsettings.includes('variable_fps_max')"
                            hide-spin-buttons />
                    </settings-row>
                </template>
                <template v-else>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.OutputFramerate')"
                        :sub-title="$t('Settings.TimelapseTab.OutputFramerateDescription')">
                        <v-text-field
                            v-model="output_framerate"
                            type="number"
                            suffix="frames"
                            hide-details="auto"
                            outlined
                            dense
                            :disabled="blockedsettings.includes('output_framerate')"
                            hide-spin-buttons />
                    </settings-row>
                </template>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.duplicatelastframe')"
                    :sub-title="$t('Settings.TimelapseTab.duplicatelastframeDescription')">
                    <v-text-field
                        v-model="duplicatelastframe"
                        type="number"
                        hide-details="auto"
                        outlined
                        dense
                        :disabled="blockedsettings.includes('duplicatelastframe')"
                        hide-spin-buttons />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.ConstantRateFactor')"
                    :sub-title="$t('Settings.TimelapseTab.ConstantRateFactorDescription')">
                    <v-text-field
                        v-model="constant_rate_factor"
                        type="number"
                        hide-details="auto"
                        outlined
                        dense
                        :disabled="blockedsettings.includes('constant_rate_factor')"
                        hide-spin-buttons />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.Pixelformat')"
                    :sub-title="$t('Settings.TimelapseTab.PixelformatDescription')">
                    <v-text-field
                        v-model="pixelformat"
                        type="text"
                        hide-details="auto"
                        outlined
                        dense
                        :disabled="blockedsettings.includes('pixelformat')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.TimeFormatCode')"
                    :sub-title="$t('Settings.TimelapseTab.TimeFormatCodeDescription')">
                    <v-text-field
                        v-model="time_format_code"
                        type="text"
                        hide-details="auto"
                        outlined
                        dense
                        :disabled="blockedsettings.includes('time_format_code')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.Extraoutputparams')"
                    :sub-title="$t('Settings.TimelapseTab.ExtraoutputparamsDescription')">
                    <v-text-field
                        v-model="extraoutputparams"
                        type="text"
                        hide-details="auto"
                        outlined
                        dense
                        :disabled="blockedsettings.includes('extraoutputparams')" />
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
@Component({
    components: { SettingsRow },
})
export default class SettingsTimelapseTab extends Mixins(BaseMixin) {
    private modeOptions = [
        {
            text: 'layermacro',
            value: 'layermacro',
        },
        {
            text: 'hyperlapse',
            value: 'hyperlapse',
        },
    ]

    private parkposOptions = [
        {
            text: 'center',
            value: 'center',
        },
        {
            text: 'front_left',
            value: 'front_left',
        },
        {
            text: 'front_right',
            value: 'front_right',
        },
        {
            text: 'back_left',
            value: 'back_left',
        },
        {
            text: 'back_right',
            value: 'back_right',
        },
        {
            text: 'x_only',
            value: 'x_only',
        },
        {
            text: 'y_only',
            value: 'y_only',
        },
        {
            text: 'custom',
            value: 'custom',
        },
    ]

    get cameraOptions() {
        const webcams = this.$store.getters['gui/webcams/getWebcams']
        const output: any = []

        webcams
            .filter((webcam: GuiWebcamStateWebcam) => webcam.snapshot_url !== '')
            .forEach((webcam: GuiWebcamStateWebcam) => {
                output.push({
                    text: webcam.name,
                    value: webcam.name,
                })
            })

        return caseInsensitiveSort(output, 'text')
    }

    get blockedsettings() {
        return this.$store.state.server.timelapse.settings.blockedsettings ?? []
    }

    get enabled() {
        return this.$store.state.server.timelapse.settings.enabled
    }

    set enabled(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { enabled: newVal })
    }

    get mode() {
        return this.$store.state.server.timelapse.settings.mode
    }

    set mode(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { mode: newVal })
    }

    get hyperlapseCycle() {
        return this.$store.state.server.timelapse.settings.hyperlapse_cycle
    }

    set hyperlapseCycle(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { hyperlapse_cycle: newVal })
    }

    get autorender() {
        return this.$store.state.server.timelapse.settings.autorender
    }

    set autorender(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { autorender: newVal })
    }

    get saveframes() {
        return this.$store.state.server.timelapse.settings.saveframes
    }

    set saveframes(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { saveframes: newVal })
    }

    get stream_delay_compensation() {
        return this.$store.state.server.timelapse.settings.stream_delay_compensation
    }

    set stream_delay_compensation(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { stream_delay_compensation: newVal })
    }

    get previewimage() {
        return this.$store.state.server.timelapse.settings.previewimage
    }

    set previewimage(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { previewimage: newVal })
    }

    get gcode_verbose() {
        return this.$store.state.server.timelapse.settings.gcode_verbose
    }

    set gcode_verbose(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { gcode_verbose: newVal })
    }

    get parkhead() {
        return this.$store.state.server.timelapse.settings.parkhead
    }

    set parkhead(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { parkhead: newVal })
    }

    get parkpos() {
        return this.$store.state.server.timelapse.settings.parkpos
    }

    set parkpos(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { parkpos: newVal })
    }

    get park_custom_pos_x() {
        return this.$store.state.server.timelapse.settings.park_custom_pos_x
    }

    set park_custom_pos_x(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { park_custom_pos_x: newVal })
    }

    get park_custom_pos_y() {
        return this.$store.state.server.timelapse.settings.park_custom_pos_y
    }

    set park_custom_pos_y(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { park_custom_pos_y: newVal })
    }

    get park_custom_pos_dz() {
        return this.$store.state.server.timelapse.settings.park_custom_pos_dz
    }

    set park_custom_pos_dz(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { park_custom_pos_dz: newVal })
    }

    get park_travel_speed() {
        return this.$store.state.server.timelapse.settings.park_travel_speed
    }

    set park_travel_speed(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { park_travel_speed: newVal })
    }

    get park_retract_speed() {
        return this.$store.state.server.timelapse.settings.park_retract_speed
    }

    set park_retract_speed(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { park_retract_speed: newVal })
    }

    get park_extrude_speed() {
        return this.$store.state.server.timelapse.settings.park_extrude_speed
    }

    set park_extrude_speed(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { park_extrude_speed: newVal })
    }

    get park_retract_distance() {
        return this.$store.state.server.timelapse.settings.park_retract_distance
    }

    set park_retract_distance(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { park_retract_distance: newVal })
    }

    get park_extrude_distance() {
        return this.$store.state.server.timelapse.settings.park_extrude_distance
    }

    set park_extrude_distance(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { park_extrude_distance: newVal })
    }

    get park_time() {
        return this.$store.state.server.timelapse.settings.park_time
    }

    set park_time(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { park_time: newVal })
    }

    get fw_retract() {
        return this.$store.state.server.timelapse.settings.fw_retract
    }

    set fw_retract(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { fw_retract: newVal })
    }

    get constant_rate_factor() {
        return this.$store.state.server.timelapse.settings.constant_rate_factor
    }

    set constant_rate_factor(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { constant_rate_factor: newVal })
    }

    get output_framerate() {
        return this.$store.state.server.timelapse.settings.output_framerate
    }

    set output_framerate(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { output_framerate: newVal })
    }

    get pixelformat() {
        return this.$store.state.server.timelapse.settings.pixelformat
    }

    set pixelformat(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { pixelformat: newVal })
    }

    get extraoutputparams() {
        return this.$store.state.server.timelapse.settings.extraoutputparams
    }

    set extraoutputparams(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { extraoutputparams: newVal })
    }

    get variable_fps() {
        return this.$store.state.server.timelapse.settings.variable_fps
    }

    set variable_fps(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps: newVal })
    }

    get targetlength() {
        return this.$store.state.server.timelapse.settings.targetlength
    }

    set targetlength(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { targetlength: newVal })
    }

    get variable_fps_min() {
        return this.$store.state.server.timelapse.settings.variable_fps_min
    }

    set variable_fps_min(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_min: newVal })
    }

    get variable_fps_max() {
        return this.$store.state.server.timelapse.settings.variable_fps_max
    }

    set variable_fps_max(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_max: newVal })
    }

    get duplicatelastframe() {
        return this.$store.state.server.timelapse.settings.duplicatelastframe
    }

    set duplicatelastframe(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { duplicatelastframe: newVal })
    }

    get camera() {
        return this.$store.state.server.timelapse.settings.camera
    }

    set camera(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { camera: newVal })
    }

    get time_format_code() {
        return this.$store.state.server.timelapse.settings.time_format_code
    }

    set time_format_code(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { time_format_code: newVal })
    }
}
</script>
