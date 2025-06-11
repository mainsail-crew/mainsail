<template>
    <v-row>
        <v-col class="pl-6 pr-0 pt-0 pb-0 d-flex flex-column">
            <v-tooltip top>
                <template #activator="{ on, attr }">
                    <span class="text-center" v-bind="attr" v-on="on">
                        <afc-filament-reel
                            :percent="spoolPercent"
                            :color="spoolColor"
                            class="filamentSpool cursor-pointer"
                            @click-spool="onFilamentClick" />
                    </span>
                </template>
                <span>
                    #{{ spoolId }} | {{ spoolVendor }}
                    <br />
                    {{ spoolFilamentName }}
                </span>
            </v-tooltip>
            <spoolman-change-spool-dialog
                :show-dialog="showSpoolmanDialog"
                :afc-lane="name"
                @close="showSpoolmanDialog = false" />
            <afc-unit-lane-filament-dialog
                :show="showFilamentDialog"
                :name="name"
                @close="showFilamentDialog = false" />
        </v-col>
        <v-col class="pr-6 pl-2 pt-0 pb-0 d-flex flex-column justify-space-between align-end">
            <v-btn v-if="afcShowLaneInfinite" x-small @click="showInfintiyDialog = true">
                <v-icon v-if="runoutLane === 'NONE'" color="error" small>{{ afcIconInfintiy }}</v-icon>
                <template v-else>{{ runoutLane }}</template>
            </v-btn>
            <afc-unit-lane-infinite-dialog
                :show="showInfintiyDialog"
                :name="name"
                @close="showInfintiyDialog = false" />
            <span class="font-weight-bold">{{ spoolMaterial }}</span>
            <span class="text--disabled">{{ spoolRemainingWeightOutput }}</span>
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import { afcIconInfintiy } from '@/plugins/afcIcons'
import AfcUnitLaneInfiniteDialog from '@/components/dialogs/AfcUnitLaneInfiniteDialog.vue'
import AfcUnitLaneFilamentDialog from '@/components/dialogs/AfcUnitLaneFilamentDialog.vue'

@Component({
    components: {
        AfcUnitLaneFilamentDialog,
        AfcUnitLaneInfiniteDialog,
    },
})
export default class AfcPanelUnitLaneBody extends Mixins(BaseMixin, AfcMixin) {
    afcIconInfintiy = afcIconInfintiy

    @Prop({ type: String, required: true }) readonly name!: string

    showInfintiyDialog = false
    showSpoolmanDialog = false
    showFilamentDialog = false

    get lane() {
        const printer = this.$store.state.printer ?? {}
        const key = `AFC_stepper ${this.name}`
        const key2 = `AFC_lane ${this.name}`

        return printer[key] ?? printer[key2] ?? {}
    }

    get runoutLane() {
        return this.lane.runout_lane ?? 'NONE'
    }

    get spoolId(): number {
        return Number(this.lane.spool_id || '0')
    }

    get spool(): ServerSpoolmanStateSpool | null {
        if (this.spoolId === 0) return null

        const spools = this.$store.state.server.spoolman?.spools || []

        return spools.find((spool: ServerSpoolmanStateSpool) => spool.id === this.spoolId) || null
    }

    get spoolColor() {
        return this.lane.color || '#000000'
    }

    get spoolRemainingWeight() {
        return Math.round(this.lane.weight ?? 0)
    }

    get spoolRemainingWeightOutput() {
        return `${this.spoolRemainingWeight} g`
    }

    get spoolFullWeight() {
        return this.spool?.filament?.weight ?? 1000
    }

    get spoolPercent() {
        if (this.spoolFullWeight === 0) return 100

        return Math.round((this.spoolRemainingWeight / this.spoolFullWeight) * 100)
    }

    get spoolMaterial() {
        return this.lane.material || '--'
    }

    get spoolVendor() {
        return this.spool?.filament?.vendor?.name ?? 'Unknown'
    }

    get spoolFilamentName() {
        return this.spool?.filament?.name ?? 'Unknown'
    }

    onFilamentClick() {
        if (this.afcExistsSpoolman) {
            this.showSpoolmanDialog = true
            return
        }

        this.showFilamentDialog = true
    }
}
</script>

<style scoped>
.filamentSpool {
    max-width: 38px;
}
</style>
