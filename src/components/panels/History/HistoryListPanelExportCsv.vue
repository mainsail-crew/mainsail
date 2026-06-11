<template>
    <v-tooltip top>
    <template #activator="{ props }">
        <v-btn class="px-2 minwidth-0 ml-3" v-bind="props" @click="exportHistory">
                <v-icon>{{ mdiDatabaseExportOutline }}</v-icon>
            </v-btn>
        </template>
        <span>{{ $t('History.TitleExportHistory') }}</span>
    </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBase } from '@/composables/useBase'
import { useHistory } from '@/composables/useHistory'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { formatFilesize } from '@/plugins/helpers'
import { mdiDatabaseExportOutline } from '@mdi/js'
import { HistoryListPanelCol } from '@/store/server/history/types'

const props = defineProps<{
    headers: HistoryListPanelCol[]
    tableFields: HistoryListPanelCol[]
}>()

const { browserLocale, formatDateTime } = useBase()
const { selectedJobs, jobs } = useHistory()

const existsSlicerCol = computed(() =>
    props.headers.find((header) => header.value === 'slicer')?.visible ?? false
)

const exportJobs = computed(() => {
    if (selectedJobs.value.length) return [...selectedJobs.value]
    return [...jobs.value]
})

function exportHistory() {
    const checkString = parseFloat('1.23').toLocaleString(browserLocale.value)
    const decimalSeparator = checkString.indexOf(',') >= 0 ? ',' : '.'
    const csvSeperator = decimalSeparator === ',' ? ';' : ','

    const content: string[][] = []
    content.push(createHeaderRow())
    content.push(...createContentRows(csvSeperator))

    const csvContent =
        'data:text/csv;charset=utf-8,' +
        content.map((entry) =>
            entry.map((field) => (field.indexOf(csvSeperator) === -1 ? field : `"${field}"`)).join(csvSeperator)
        ).join('\n')

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', 'print_history.csv')
    document.body.appendChild(link)

    link.click()
    link.remove()
}

function createHeaderRow() {
    const row: string[] = []
    row.push('filename')
    row.push('status')
    props.tableFields.forEach((col) => {
        row.push(col.value)
    })
    if (existsSlicerCol.value) row.push('slicer')
    return row
}

function createContentRows(csvSeperator: string) {
    if (exportJobs.value.length === 0) return []

    const rows: string[][] = []

    exportJobs.value.forEach((job: ServerHistoryStateJob) => {
        const row: string[] = []

        if (job.filename.includes(csvSeperator)) row.push(`"${job.filename}"`)
        else row.push(job.filename)
        row.push(job.status)

        props.tableFields.forEach((col) => {
            row.push(outputValue(col, job, csvSeperator))
        })

        if (existsSlicerCol.value) {
            const slicer = job.metadata?.slicer ?? '--'
            const slicer_version = job.metadata?.slicer_version ?? '--'
            row.push(`${slicer} ${slicer_version}`)
        }

        rows.push(row)
    })

    return rows
}

function outputValue(col: HistoryListPanelCol, job: ServerHistoryStateJob, escapeChar: string): string {
    const key = col.value
    let value: string | number | null = null
    if (key in job) {
        const raw = job[key as keyof ServerHistoryStateJob]
        if (typeof raw === 'string' || typeof raw === 'number') value = raw
    } else if (key in job.metadata) {
        const raw = job.metadata[key]
        if (typeof raw === 'string' || typeof raw === 'number') value = raw
    }

    if (key.startsWith('history_field_')) {
        const fieldName = key.replace('history_field_', '')
        const field = job.auxiliary_data?.find((field) => field.name === fieldName)
        if (field && !Array.isArray(field.value)) return `${Math.round(field.value * 1000) / 1000} ${field.units}`
    }

    if (value === null) return ''

    if (typeof value === 'string') {
        if (value.includes(escapeChar)) return '"' + value + '"'
        return value
    }

    switch (col.outputType) {
        case 'date':
            return formatDateTime(value * 1000)
        case 'time':
            return value.toFixed()
        default:
            return value.toLocaleString(browserLocale.value, { useGrouping: false })
    }
}
</script>
