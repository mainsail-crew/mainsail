<template>
    <tr>
        <td>{{ item.displayName }}</td>
        <td class="text-right">{{ value }}</td>
    </tr>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateAllPrintStatusEntry } from '@/store/server/history/types'
import { formatPrintTime } from '@/plugins/helpers'

@Component({
    components: {},
})
export default class HistoryAllPrintStatusTableItem extends Mixins(BaseMixin) {
    @Prop({ type: Object }) item!: ServerHistoryStateAllPrintStatusEntry
    @Prop({ type: String, default: 'amount' }) valueName!: 'amount' | 'filament' | 'time'

    get value() {
        if (this.valueName === 'filament') {
            if (this.item.value > 1000) return Math.round(this.item.value / 1000).toString() + ' m'

            return this.item.value.toString() + ' mm'
        }

        if (this.valueName === 'time') {
            return formatPrintTime(this.item.value, false)
        }

        return this.item.value.toString()
    }
}
</script>
