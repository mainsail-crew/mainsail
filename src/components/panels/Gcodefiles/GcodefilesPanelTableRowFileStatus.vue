<template>
    <td class="text-right text-no-wrap">
        <v-tooltip v-if="item.last_status" top>
            <template #activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on">
                    <span v-if="item.count_printed > 0" :class="`file-list__count_printed ${printStatusTextColor}`">
                        {{ item.count_printed }}
                    </span>
                    <v-icon small :color="printStatusIconColor">{{ printStatusIcon }}</v-icon>
                </span>
            </template>
            <span>{{ item.last_status.replace(/_/g, ' ') }}</span>
        </v-tooltip>
    </td>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import { convertPrintStatusIcon, convertPrintStatusIconColor } from '@/plugins/helpers'

@Component
export default class GcodefilesPanelTableRowFileStatus extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly item!: FileStateGcodefile

    get printStatusTextColor() {
        switch (this.item.last_status) {
            case 'in_progress':
                return 'blue--text'
            case 'completed':
                return 'green--text'
            case 'cancelled':
                return 'red--text'
            default:
                return 'orange--text'
        }
    }

    get printStatusIcon() {
        return convertPrintStatusIcon(this.item.last_status ?? '')
    }

    get printStatusIconColor() {
        return convertPrintStatusIconColor(this.item.last_status ?? '')
    }
}
</script>

<style scoped>
.file-list__count_printed {
    position: relative;
    top: 1px;
}
</style>
