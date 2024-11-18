<template>
    <v-row v-if="show" class="history-details-dialog-entry">
        <v-col>{{ field.label }}</v-col>
        <v-col class="text-right">{{ output }}</v-col>
    </v-row>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { HistoryDetailsField } from '@/components/dialogs/HistoryDetailsDialog.vue'

@Component
export default class HistoryDetailsDialogEntry extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) job!: ServerHistoryStateJob
    @Prop({ type: Object, required: true }) field!: HistoryDetailsField

    get show() {
        return this.value ?? false
    }

    get value() {
        const boolMetadata = this.field.metadata ?? false
        if (!boolMetadata) return this.job[this.field.key]

        const metadata = this.job.metadata ?? null
        if (metadata === null) return null

        return metadata[this.field.key]
    }

    get output() {
        let output = this.value
        if (this.field.format) output = this.field.format(this.value)

        if (this.field.unit) return `${output} ${this.field.unit}`

        return output
    }
}
</script>
