<template>
    <v-tooltip top>
        <template #activator="{ on, attrs }">
            <v-btn class="px-2 minwidth-0 ml-3" v-bind="attrs" v-on="on" @click="exportHistory">
                <v-icon>{{ mdiDatabaseExportOutline }}</v-icon>
            </v-btn>
        </template>
        <span>{{ $t('History.TitleExportHistory') }}</span>
    </v-tooltip>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { formatFilesize } from '@/plugins/helpers'
import { mdiDatabaseExportOutline } from '@mdi/js'
import { HistoryListPanelCol } from '@/components/panels/HistoryListPanel.vue'

@Component
export default class HistoryListPanelExportCsv extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize
    mdiDatabaseExportOutline = mdiDatabaseExportOutline

    @Prop({ type: Array, required: true }) headers!: HistoryListPanelCol[]
    @Prop({ type: Array, required: true }) tableFields!: HistoryListPanelCol[]

    get jobs() {
        return this.$store.getters['server/history/getFilteredJobList'] ?? []
    }

    get selectedJobs() {
        return this.$store.state.gui.view.history.selectedJobs ?? []
    }

    get existsSlicerCol() {
        return this.headers.find((header) => header.value === 'slicer')?.visible ?? false
    }

    exportHistory() {
        const checkString = parseFloat('1.23').toLocaleString(this.browserLocale)
        const decimalSeparator = checkString.indexOf(',') >= 0 ? ',' : '.'
        const csvSeperator = decimalSeparator === ',' ? ';' : ','

        const content: string[][] = []
        content.push(this.createHeaderRow())
        content.push(...this.createContentRows(csvSeperator))

        // escape fields with the csvSeperator in the content
        // prettier-ignore
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

    private createHeaderRow() {
        const row: string[] = []

        row.push('filename')
        row.push('status')

        this.tableFields.forEach((col) => {
            row.push(col.value)
        })

        if (this.existsSlicerCol) row.push('slicer')

        return row
    }

    get exportJobs() {
        if (this.selectedJobs.length) return [...this.selectedJobs]

        return [...this.jobs]
    }

    private createContentRows(csvSeperator: string) {
        if (this.exportJobs.length === 0) return []

        const rows: string[][] = []

        this.exportJobs.forEach((job: ServerHistoryStateJob) => {
            const row: string[] = []

            if (job.filename.includes(csvSeperator)) row.push(`"${job.filename}"`)
            else row.push(job.filename)
            row.push(job.status)

            this.tableFields.forEach((col) => {
                row.push(this.outputValue(col, job, csvSeperator))
            })

            if (this.existsSlicerCol) {
                const slicer = job.metadata?.slicer ?? '--'
                const slicer_version = job.metadata?.slicer_version ?? '--'

                row.push(`${slicer} ${slicer_version}`)
            }

            rows.push(row)
        })

        return rows
    }

    private outputValue(col: any, job: any, escapeChar: string) {
        let value = col.value in job ? job[col.value] : null
        if (value === null) value = col.value in job.metadata ? job.metadata[col.value] : null

        switch (col.outputType) {
            case 'date':
                return this.formatDateTime(value * 1000)

            case 'time':
                return value?.toFixed() ?? ''

            default:
                switch (typeof value) {
                    case 'number':
                        return value?.toLocaleString(this.browserLocale, { useGrouping: false }) ?? 0

                    case 'string':
                        if (escapeChar !== null && value.includes(escapeChar)) value = '"' + value + '"'

                        return value

                    default:
                        return value
                }
        }
    }
}
</script>
