<template>
    <v-list-item three-line>
        <v-list-item-content :class="listItemContentClass">
            <div :class="overlineClass">#{{ id }} | {{ vendor }}</div>
            <v-list-item-title :class="listItemTitleClass">
                <span class="cursor-pointer" @click="clickSpool">{{ name }}</span>
            </v-list-item-title>
            <v-list-item-subtitle>{{ subtitle }}</v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-avatar tile :size="avatarSize">
            <spool-icon :color="color" @click-spool="clickSpool" />
        </v-list-item-avatar>
    </v-list-item>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import SpoolmanChangeSpoolDialog from '@/components/dialogs/SpoolmanChangeSpoolDialog.vue'
import SpoolmanEjectSpoolDialog from '@/components/dialogs/SpoolmanEjectSpoolDialog.vue'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

@Component({
    components: { Panel, SpoolmanChangeSpoolDialog, SpoolmanEjectSpoolDialog },
})
export default class SpoolmanPanelActiveSpool extends Mixins(BaseMixin) {
    @Prop({ required: false, default: false }) readonly small!: boolean

    get listItemContentClass() {
        if (this.small) return 'my-0'

        return ''
    }

    get overlineClass() {
        const classes = ['text-overline', 'mb-1']
        if (this.small) classes.push('line-height-auto')

        return classes
    }

    get listItemTitleClass() {
        if (this.small) return ['text-h6', 'mb-1']

        return ['text-h5', 'mb-1']
    }

    get avatarSize() {
        if (this.small) return 60

        return 80
    }

    get active_spool(): ServerSpoolmanStateSpool | null {
        return this.$store.state.server.spoolman.active_spool ?? null
    }

    get color() {
        const color = this.active_spool?.filament.color_hex ?? null
        if (color === null) return '#000'

        return `#${color}`
    }

    get id() {
        return this.active_spool?.id ?? 'XX'
    }

    get vendor() {
        return this.active_spool?.filament?.vendor?.name ?? 'Unknown'
    }

    get name() {
        return this.active_spool?.filament.name ?? 'Unknown'
    }

    get materialOutput() {
        const material = this.active_spool?.filament.material ?? null
        if (material === null) return null

        return material
    }

    get weightOutput() {
        let remaining = this.active_spool?.remaining_weight ?? null
        let total = this.active_spool?.filament.weight ?? null
        let unit = 'g'

        if (remaining === null || total === null) return null
        remaining = Math.round(remaining)
        let totalRound = Math.floor(total / 1000)

        if (total >= 1000) {
            if (totalRound !== total / 1000) {
                totalRound = Math.round(total / 100) / 10
            }

            return `${remaining}g / ${totalRound}kg`
        }

        return `${remaining} / ${total}${unit}`
    }

    get lengthOutput() {
        let remaining = this.active_spool?.remaining_length ?? null

        if (remaining === null) return null
        remaining = Math.round(remaining / 1000)

        return `${remaining}m`
    }

    get subtitle() {
        return [this.materialOutput, this.weightOutput, this.lengthOutput].filter((v) => v !== null).join(' | ')
    }

    clickSpool() {
        this.$emit('change-spool')
    }
}
</script>

<style scoped>
.line-height-auto {
    line-height: 1;
}
</style>
