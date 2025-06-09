<template>
    <td :class="tdClass">{{ value }}</td>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin, { tableColumnSetting } from '@/components/mixins/gcodefiles'
import { FileStateGcodefile } from '@/store/files/types'
import { formatFilesize, formatPrintTime } from '@/plugins/helpers'

@Component
export default class GcodefilesPanelTableRowFileMetadata extends Mixins(BaseMixin, GcodefilesMixin) {
    @Prop({ type: Object, required: true }) readonly item!: FileStateGcodefile
    @Prop({ type: Object, required: true }) readonly col!: tableColumnSetting

    get tdClass() {
        return this.col.outputType !== 'date' ? 'text-no-wrap' : ''
    }

    get value() {
        const value = this.col.value in this.item ? this.item[this.col.value] : null

        if (value === null) return '--'

        switch (this.col.outputType) {
            case 'filesize':
                return formatFilesize(value)

            case 'date':
                return this.formatDateTime(value)

            case 'time':
                return formatPrintTime(value)

            case 'temp':
                return value.toFixed() + ' °C'

            case 'length':
                if (value > 1000) return (value / 1000).toFixed(2) + ' m'

                return value.toFixed(2) + ' mm'

            case 'weight':
                return value.toFixed(2) + ' g'

            default:
                return value
        }
    }
}
</script>
