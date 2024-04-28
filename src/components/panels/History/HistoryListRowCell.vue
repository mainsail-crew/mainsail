<template>
    <td :class="cssClass">{{ output }}</td>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { HistoryListHeadertype } from '@/components/panels/HistoryListPanel.vue'
import { formatFilesize, formatPrintTime } from '@/plugins/helpers'

@Component
export default class HistoryListRowCell extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) job!: ServerHistoryStateJob
    @Prop({ type: Object, required: true }) col!: HistoryListHeadertype

    get cssClass() {
        if (this.col.outputType === 'date') return ''

        return 'text-no-wrap'
    }

    get value() {
        if (this.col.value in this.job) return this.job[this.col.value]

        const metadata = this.job.metadata ?? null
        if (metadata && this.col.value in metadata) return metadata[this.col.value]

        return null
    }

    get output() {
        // return fallback if value is null or 0
        if (this.value === null || this.value === 0) return '--'

        // direct output of strings or other non-numeric values
        if (typeof this.value !== 'number') return this.value

        switch (this.col.outputType) {
            case 'filesize':
                return formatFilesize(this.value)

            case 'date':
                return this.formatDateTime(this.value * 1000)

            case 'time':
                return formatPrintTime(this.value)

            case 'temp':
                return this.value?.toFixed() + ' °C'

            case 'length':
                if (this.value > 1000) return (this.value / 1000).toFixed(2) + ' m'

                return this.value?.toFixed(2) + ' mm'

            default:
                return this.value
        }
    }
}
</script>
