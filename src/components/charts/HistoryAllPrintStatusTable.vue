<template>
    <v-simple-table>
        <tbody>
            <history-all-print-status-table-item
                v-for="status in printStatusArray"
                :key="status.name"
                :item="status"
                :value-name="valueName" />
        </tbody>
    </v-simple-table>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import HistoryStatsMixin from '@/components/mixins/historyStats'
import HistoryAllPrintStatusTableItem from '@/components/charts/HistoryAllPrintStatusTableItem.vue'
import { HistoryStatsValueNames } from '@/store/server/history/types'

@Component({
    components: { HistoryAllPrintStatusTableItem },
})
export default class HistoryAllPrintStatusTable extends Mixins(BaseMixin, HistoryStatsMixin) {
    @Prop({ type: String, default: 'amount' }) valueName!: HistoryStatsValueNames
}
</script>
