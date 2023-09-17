<template>
    <tr class="cursor-pointer" @click="setSpoolRow">
        <td style="width: 50px" class="pr-0 py-2">
            <spool-icon :color="color" style="width: 50px; float: left" class="mr-3" />
        </td>
        <td class="py-2">
            <strong>{{ vendor }} - {{ name }}</strong>
            <template v-if="location">
                <br />
                {{ $t('Panels.SpoolmanPanel.Location') }}: {{ location }}
            </template>
            <template v-if="spool.comment">
                <br />
                {{ spool.comment }}
            </template>
        </td>
        <td class="text-center">{{ material }}</td>
        <td class="text-right">{{ last_used }}</td>
        <td class="text-right">
            <strong>{{ rest_weight_format }}</strong>
            <small class="ml-1">/ {{ total_weight_format }}</small>
        </td>
    </tr>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
@Component({})
export default class SpoolmanChangeSpoolDialogRow extends Mixins(BaseMixin) {
    @Prop({ required: true }) declare readonly spool: ServerSpoolmanStateSpool

    get color() {
        const color = this.spool.filament?.color_hex ?? '000'

        return `#${color}`
    }

    get vendor() {
        return this.spool.filament?.vendor?.name ?? 'Unknown'
    }

    get name() {
        return this.spool.filament?.name ?? 'Unknown'
    }

    get location() {
        return this.spool.location
    }

    get material() {
        return this.spool.filament?.material ?? '--'
    }

    get used_weight() {
        return this.spool.used_weight ?? 0
    }

    get total_weight() {
        return this.spool.filament?.weight ?? 0
    }

    get rest_weight_format() {
        return `${(this.total_weight - this.used_weight).toFixed(0)}g`
    }

    get total_weight_format() {
        if (this.total_weight < 1000) {
            return `${this.total_weight.toFixed(0)}g`
        }

        let totalRound = Math.round(this.total_weight / 1000)
        if (totalRound !== this.total_weight / 1000) {
            totalRound = Math.round(this.total_weight / 100) / 10
        }

        return `${totalRound}kg`
    }

    get last_used() {
        const last_used = this.spool.last_used ?? null
        if (!last_used) return this.$t('Panels.SpoolmanPanel.Never')

        const date = new Date(this.spool.last_used)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        if (diff <= 1000 * 60 * 60 * 24) return this.$t('Panels.SpoolmanPanel.Today')
        if (diff <= 1000 * 60 * 60 * 24 * 2) return this.$t('Panels.SpoolmanPanel.Yesterday')
        if (diff <= 1000 * 60 * 60 * 24 * 14) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))

            return this.$t('Panels.SpoolmanPanel.DaysAgo', { days })
        }

        return date.toLocaleDateString()
    }

    setSpoolRow() {
        this.$emit('set-spool', this.spool)
    }
}
</script>
