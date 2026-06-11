<template>
    <v-row class="d-flex flex-row flex-nowrap">
        <v-col class="v-col-auto d-flex flex-column justify-center pr-0 py-0">
            <v-icon style="width: 32px">{{ mdiFileMultiple }}</v-icon>
        </v-col>
        <v-col class="py-2" style="min-width: 0; font-size: 0.875em">
            <div class="text-truncate">{{ headline }}</div>
            <small class="text-truncate">{{ description }}</small>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { mdiFileMultiple } from '@mdi/js'

const props = defineProps<{
    jobs: ServerJobQueueStateJob[]
}>()

const { t } = useI18n()

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

const headline = computed(() =>
    t('Panels.StatusPanel.JobqueueMoreFiles', { count: count.value })
)

const description = computed(() => {
    const filamentArray: string[] = []
    let filament = '--'
    if (filamentLength.value) filamentArray.push(filamentLength.value)
    if (filamentWeight.value) filamentArray.push(filamentWeight.value)
    if (filamentArray.length) filament = filamentArray.join(' / ')

    let time = '--'
    if (estimatedTime.value) time = estimatedTime.value

    return `Filament: ${filament}, Print Time: ${time}`
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
</script>
