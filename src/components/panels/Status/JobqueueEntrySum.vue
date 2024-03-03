<template>
    <v-row class="jobqueue-entry-sum">
        <v-col class="py-2" style="font-size: 0.875em">
            <small>
                <span class="text-no-wrap mr-1">{{ $t('Panels.StatusPanel.Filament') }}: {{ filamentOutput }},</span>
                <span class="text-no-wrap mr-1">{{ $t('Panels.StatusPanel.PrintTime') }}: {{ estimatedTime }},</span>
                <span class="text-no-wrap mr-1">{{ $t('Panels.StatusPanel.ETA') }}: {{ eta }}</span>
            </small>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
@Component
export default class StatusPanelJobqueueEntrySum extends Mixins(BaseMixin) {
    @Prop({ type: Array, required: true }) jobs!: ServerJobQueueStateJob[]

    get sums() {
        const sums = {
            filamentLength: 0,
            filamentWeight: 0,
            estimatedTime: 0,
        }

        this.jobs.forEach((job: ServerJobQueueStateJob) => {
            const count = (job.combinedIds?.length ?? 0) + 1

            sums.filamentLength += (job.metadata?.filament_total ?? 0) * count
            sums.filamentWeight += (job.metadata?.filament_weight_total ?? 0) * count
            sums.estimatedTime += (job.metadata?.estimated_time ?? 0) * count
        })

        return sums
    }

    get count() {
        let count = 0

        this.jobs.forEach((item: ServerJobQueueStateJob) => {
            count += (item.combinedIds?.length ?? 0) + 1
        })

        return count
    }

    get filamentLength() {
        const length = this.sums.filamentLength
        if (length === 0) return null

        if (length >= 1000) return (length / 1000).toFixed(1) + ' m'

        return length.toFixed(0) + ' mm'
    }

    get filamentWeight() {
        const weight = this.sums.filamentWeight
        if (weight === 0) return null

        if (weight >= 1000) return (weight / 1000).toFixed(1) + ' kg'

        return weight.toFixed(0) + ' g'
    }

    get filamentOutput() {
        const filamentArray = []
        if (this.filamentLength) filamentArray.push(this.filamentLength)
        if (this.filamentWeight) filamentArray.push(this.filamentWeight)
        if (filamentArray.length) return filamentArray.join(' / ')

        return '--'
    }

    get estimatedTime() {
        let totalSeconds = this.sums.estimatedTime
        if (totalSeconds == 0) return '--'

        const output = []

        const days = Math.floor(totalSeconds / (3600 * 24))
        if (days) {
            totalSeconds %= 3600 * 24
            output.push(days + 'd')
        }

        const hours = Math.floor(totalSeconds / 3600)
        totalSeconds %= 3600
        if (hours) output.push(hours + 'h')

        const minutes = Math.floor(totalSeconds / 60)
        if (minutes) output.push(minutes + 'm')

        // skip seconds if there are hours
        if (hours > 0) return output.join(' ')

        const seconds = totalSeconds % 60
        if (seconds) output.push(seconds.toFixed(0) + 's')

        return output.join(' ')
    }

    get currentPrintEta() {
        let eta = this.$store.getters['printer/getEstimatedTimeETA']
        if (eta) return eta

        // if no eta and printer is printing, use the estimated time from the current file + now.
        // this is a fallback for the case when the printer is in the preheating time, and the
        // estimated time is not yet available
        if (this.printerIsPrinting && this.$store.state.printer.print_stats?.print_duration === 0) {
            return Date.now() + (this.$store.state.printer.current_file?.estimated_time ?? 0) * 1000
        }

        // fallback current time
        return Date.now()
    }

    get eta() {
        if (this.sums.estimatedTime === 0) return '--'

        let eta = this.currentPrintEta + this.sums.estimatedTime * 1000
        const hours12Format = this.$store.getters['gui/getHours12Format'] ?? false
        const date = new Date(eta)
        let am = true
        let h: string | number = date.getHours()

        if (hours12Format && h > 11) am = false
        if (hours12Format && h > 12) h -= 12
        if (hours12Format && h == 0) h += 12
        if (h < 10) h = '0' + h

        const m = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()

        const diff = eta - new Date().getTime()
        let output = h + ':' + m
        if (hours12Format) output += ` ${am ? 'AM' : 'PM'}`
        if (diff > 60 * 60 * 24 * 1000) output += `+${Math.trunc(diff / (60 * 60 * 24 * 1000))}`

        return output
    }
}
</script>

<style scoped>
.jobqueue-entry-sum {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.theme--light .jobqueue-entry-sum {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
