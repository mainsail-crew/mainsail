<template>
    <v-simple-table>
        <tbody>
            <tr v-for="status in printStatusArray" :key="status.name">
                <td>{{ status.displayName }}</td>
                <td class="text-right">{{ status.value }}</td>
            </tr>
        </tbody>
    </v-simple-table>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateAllPrintStatusEntry } from '@/store/server/history/types'
import HistoryStatsMixin from '@/components/mixins/historyStats'

@Component({
    components: {},
})
export default class HistoryAllPrintStatusTable extends Mixins(BaseMixin, HistoryStatsMixin) {
    get selectedJobs() {
        return this.$store.getters['server/history/getSelectedJobs']
    }

    get printStatusArray() {
        const output: ServerHistoryStateAllPrintStatusEntry[] = []
        const orgArray = this.selectedJobs.length ? this.selectedPrintStatusChartData : this.allPrintStatusChartData

        orgArray.forEach((status: ServerHistoryStateAllPrintStatusEntry) => {
            const tmp = { ...status }
            tmp.name = status.displayName
            output.push(tmp)
        })

        return output
    }
}
</script>
