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

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import type { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'

const props = defineProps<{
    jobs: ServerJobQueueStateJob[]
}>()

const store = useStore()
const { printerIsPrinting } = useBase()

const sums = computed(() => {
    const result = { filamentLength: 0, filamentWeight: 0, estimatedTime: 0 }
    props.jobs.forEach((job) => {
        const count = (job.combinedIds?.length ?? 0) + 1
        result.filamentLength += (job.metadata?.filament_total ?? 0) * count
        result.filamentWeight += (job.metadata?.filament_weight_total ?? 0) * count
        result.estimatedTime += (job.metadata?.estimated_time ?? 0) * count
    })
    return result
})

const count = computed(() => {
    let total = 0
    props.jobs.forEach((item) => {
        total += (item.combinedIds?.length ?? 0) + 1
    })
    return total
})

const filamentLength = computed(() => {
    const length = sums.value.filamentLength
    if (length === 0) return null
    if (length >= 1000) return (length / 1000).toFixed(1) + ' m'
    return length.toFixed(0) + ' mm'
})

const filamentWeight = computed(() => {
    const weight = sums.value.filamentWeight
    if (weight === 0) return null
    if (weight >= 1000) return (weight / 1000).toFixed(1) + ' kg'
    return weight.toFixed(0) + ' g'
})

const filamentOutput = computed(() => {
    const filamentArray: string[] = []
    if (filamentLength.value) filamentArray.push(filamentLength.value)
    if (filamentWeight.value) filamentArray.push(filamentWeight.value)
    if (filamentArray.length) return filamentArray.join(' / ')
    return '--'
})

const estimatedTime = computed(() => {
    let totalSeconds = sums.value.estimatedTime
    if (totalSeconds == 0) return '--'

    const output: string[] = []

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

    if (hours > 0) return output.join(' ')

    const seconds = totalSeconds % 60
    if (seconds) output.push(seconds.toFixed(0) + 's')

    return output.join(' ')
})

const currentPrintEta = computed(() => {
    const eta = store.getters['printer/getEstimatedTimeETA']
    if (eta) return eta

    if (printerIsPrinting.value && store.state.printer.print_stats?.print_duration === 0) {
        return Date.now() + (store.state.printer.current_file?.estimated_time ?? 0) * 1000
    }

    return Date.now()
})

const eta = computed(() => {
    if (sums.value.estimatedTime === 0) return '--'

    const etaTime = currentPrintEta.value + sums.value.estimatedTime * 1000
    const hours12Format = store.getters['gui/getHours12Format'] ?? false
    const date = new Date(etaTime)
    let am = true
    let h: string | number = date.getHours()

    if (hours12Format && h > 11) am = false
    if (hours12Format && h > 12) h -= 12
    if (hours12Format && h == 0) h += 12
    if (h < 10) h = '0' + h

    const m = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()

    const diff = etaTime - new Date().getTime()
    let output = h + ':' + m
    if (hours12Format) output += ` ${am ? 'AM' : 'PM'}`
    if (diff > 60 * 60 * 24 * 1000) output += `+${Math.trunc(diff / (60 * 60 * 24 * 1000))}`

    return output
})
</script>

<style scoped>
.jobqueue-entry-sum {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.theme--light .jobqueue-entry-sum {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
