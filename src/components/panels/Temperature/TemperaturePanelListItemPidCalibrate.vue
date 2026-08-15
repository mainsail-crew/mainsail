<template>
    <tr v-if="entry !== null" class="_pid-calibrate-row">
        <td :colspan="colspan" class="pb-2">
            <div v-if="entry.status === 'running'" class="pt-1">
                <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption">
                        {{ $t('Panels.TemperaturePanel.PidCalibrate.Running', { target: entry.target }) }}
                    </span>
                    <span class="text-caption text--disabled">
                        {{ $t('Panels.TemperaturePanel.PidCalibrate.Elapsed', { time: elapsedFormatted }) }}
                    </span>
                </div>
                <v-progress-linear :indeterminate="peaksObserved === null" :value="progressPercent" height="4" />
                <div class="d-flex justify-space-between text-caption text--disabled mt-1">
                    <span v-if="peaksObserved !== null">
                        {{
                            $t('Panels.TemperaturePanel.PidCalibrate.PeaksObserved', {
                                count: peaksObserved,
                                total: peaksNeeded,
                            })
                        }}
                    </span>
                    <span v-else>{{ $t('Panels.TemperaturePanel.PidCalibrate.WaitingForFirstPeak') }}</span>
                </div>
                <div class="text-caption text--disabled">
                    {{ $t('Panels.TemperaturePanel.PidCalibrate.NoProgressNote') }}
                </div>
            </div>
            <div v-else class="d-flex justify-space-between align-start py-1">
                <div>
                    <div class="text-caption" :class="entry.status === 'failed' ? 'red--text' : ''">
                        <v-icon v-if="entry.status === 'failed'" small color="red" class="mr-1">
                            {{ mdiAlertCircleOutline }}
                        </v-icon>
                        {{ headline }}
                    </div>

                    <div v-if="entry.status === 'failed'" class="text-caption text--disabled">
                        {{ $t('Panels.TemperaturePanel.PidCalibrate.Error', { message: entry.errorMessage }) }}
                    </div>

                    <template v-else>
                        <div class="text-caption text--disabled">
                            {{ $t('Panels.TemperaturePanel.PidCalibrate.NewValues') }}:
                            {{ formatPid(entry.result) }}
                        </div>

                        <div v-if="entry.previous" class="text-caption text--disabled">
                            {{ $t('Panels.TemperaturePanel.PidCalibrate.PreviousValues') }}:
                            {{ formatPid(entry.previous) }}
                        </div>
                        <div v-else class="text-caption text--disabled">
                            {{ $t('Panels.TemperaturePanel.PidCalibrate.NoPreviousValues') }}
                        </div>

                        <div v-if="interpretationText" class="text-caption text--disabled mt-1">
                            {{ interpretationText }}
                        </div>

                        <div class="text-caption text--disabled mt-1">
                            {{ $t('Panels.TemperaturePanel.PidCalibrate.WhatDoesThisMean') }}
                        </div>

                        <div class="text-caption text--disabled mt-1">
                            {{ $t('Panels.TemperaturePanel.PidCalibrate.SaveConfigReminder') }}
                        </div>
                    </template>
                </div>

                <v-btn icon small plain class="mt-n1" @click="dismiss">
                    <v-icon small>{{ mdiClose }}</v-icon>
                </v-btn>
            </div>
        </td>
    </tr>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiAlertCircleOutline, mdiClose } from '@mdi/js'
import { formatPrintTime } from '@/plugins/helpers'
import { PidCalibratePid } from '@/store/printer/pidCalibrate/types'
import { PID_CALIBRATE_PEAKS_NEEDED, estimatedPeaksObserved } from '@/store/printer/pidCalibrate/helpers'

@Component
export default class TemperaturePanelListItemPidCalibrate extends Mixins(BaseMixin) {
    mdiClose = mdiClose
    mdiAlertCircleOutline = mdiAlertCircleOutline

    @Prop({ type: String, required: true }) readonly heaterName!: string
    @Prop({ type: Boolean, required: true }) readonly isResponsiveMobile!: boolean

    now = Date.now()
    tickInterval: number | null = null

    get entry() {
        return this.$store.getters['printer/pidCalibrate/getEntry'](this.heaterName)
    }

    get comparison() {
        return this.$store.getters['printer/pidCalibrate/getComparison'](this.heaterName)
    }

    get colspan() {
        return this.isResponsiveMobile ? 4 : 5
    }

    // drives the mounted/beforeDestroy-independent start/stop of the 1s ticker below - this
    // component is always mounted (one per heater, v-if lives on its own root node), so the
    // ticker must not run for heaters that are never being calibrated
    get isRunning(): boolean {
        return this.entry?.status === 'running'
    }

    get elapsedFormatted() {
        if (this.entry === null) return '--'

        const elapsedSeconds = Math.max(0, Math.round((this.now - this.entry.startedAt) / 1000))
        if (elapsedSeconds < 1) return '0s'

        return formatPrintTime(elapsedSeconds, false)
    }

    get peaksNeeded(): number {
        return PID_CALIBRATE_PEAKS_NEEDED
    }

    // null until the first genuine target toggle is observed - stays indeterminate until then,
    // since crediting the unobservable first peak before we've seen any real signal at all would
    // overstate what's actually known (see estimatedPeaksObserved)
    get peaksObserved(): number | null {
        if (this.entry === null || this.entry.observedToggles === 0) return null

        return estimatedPeaksObserved(this.entry.observedToggles)
    }

    get progressPercent(): number {
        if (this.peaksObserved === null) return 0

        return (this.peaksObserved / this.peaksNeeded) * 100
    }

    get headline() {
        if (this.entry === null) return ''

        const key =
            this.entry.status === 'failed'
                ? 'Panels.TemperaturePanel.PidCalibrate.Failed'
                : 'Panels.TemperaturePanel.PidCalibrate.Success'

        return this.$t(key, { name: this.heaterName }).toString()
    }

    get interpretationText() {
        const comparison = this.comparison
        if (comparison === null) return null

        if (!comparison.isProportionalRetune) {
            return this.$t('Panels.TemperaturePanel.PidCalibrate.CannotCompareShape').toString()
        }

        const percent = Math.abs(comparison.aggressivenessDeltaPercent).toFixed(0)
        const key =
            comparison.aggressivenessDeltaPercent >= 0
                ? 'Panels.TemperaturePanel.PidCalibrate.MoreAggressive'
                : 'Panels.TemperaturePanel.PidCalibrate.LessAggressive'

        return this.$t(key, { percent }).toString()
    }

    @Watch('isRunning', { immediate: true })
    onIsRunningChanged(isRunning: boolean): void {
        if (isRunning) this.startTicking()
        else this.stopTicking()
    }

    beforeDestroy() {
        this.stopTicking()
    }

    startTicking(): void {
        if (this.tickInterval !== null) return

        this.now = Date.now()
        this.tickInterval = window.setInterval(() => {
            this.now = Date.now()
        }, 1000)
    }

    stopTicking(): void {
        if (this.tickInterval === null) return

        window.clearInterval(this.tickInterval)
        this.tickInterval = null
    }

    formatPid(pid: PidCalibratePid): string {
        return `Kp ${pid.kp.toFixed(3)}, Ki ${pid.ki.toFixed(3)}, Kd ${pid.kd.toFixed(3)}`
    }

    dismiss(): void {
        this.$store.dispatch('printer/pidCalibrate/dismissEntry', this.heaterName)
    }
}
</script>

<style scoped>
._pid-calibrate-row > td {
    border-top: none !important;
}
</style>
