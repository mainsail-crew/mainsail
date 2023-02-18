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

@Component({
    components: {},
})
export default class HistoryAllPrintStatusTable extends Mixins(BaseMixin) {
    get selectedJobs() {
        return this.$store.state.gui.view.history.selectedJobs ?? []
    }

    get allPrintStatusArray() {
        return this.$store.getters['server/history/getAllPrintStatusArrayAll']
    }

    get selectedPrintStatusArray() {
        return this.$store.getters['server/history/getSelectedPrintStatusArray']
    }

    get printStatusArray() {
        const output: ServerHistoryStateAllPrintStatusEntry[] = []
        const orgArray = this.selectedJobs.length ? this.selectedPrintStatusArray : this.allPrintStatusArray

        orgArray.forEach((status: ServerHistoryStateAllPrintStatusEntry) => {
            const tmp = { ...status }
            tmp.name = status.displayName
            output.push(tmp)
        })

        return output
    }
}
</script>
