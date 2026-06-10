<template>
    <div>
        <v-row class="my-3">
            <v-col class="pl-6 pr-0 pt-0 pb-0 d-flex flex-column">
                <v-tooltip top>
                    <template #activator="{ on, attr }">
                        <span class="d-flex align-center justify-center" v-bind="attr" v-on="on">
                            <afc-filament-reel
                                :percent="spoolPercent"
                                :color="spoolColor"
                                class="filamentSpool cursor-pointer"
                                @click-spool="onFilamentClick" />
                        </span>
                    </template>
                    <span>
                        <strong>ID #{{ spoolId }}</strong>
                        <br />
                        <template v-if="spoolFilamentVendor">{{ spoolFilamentVendor }} —</template>
                        {{ spoolFilamentName }}
                        <template v-if="spoolMaterial">
                            <br />
                            {{ spoolMaterial }}
                            <template v-if="spoolExtruderTemp != null">| {{ spoolExtruderTemp }}°C</template>
                            <template v-if="spoolBedTemp != null">| {{ spoolBedTemp }}°C</template>
                        </template>
                        <template v-if="spoolRemainingWeight != null">
                            <br />
                            {{ $t('Panels.AfcPanel.WeightRemaining', { weight: Math.round(spoolRemainingWeight) }) }}
                            <template v-if="spoolUsedWeight != null">
                                ({{ $t('Panels.AfcPanel.WeightUsed', { weight: Math.round(spoolUsedWeight) }) }})
                            </template>
                        </template>
                    </span>
                </v-tooltip>
                <spoolman-change-spool-dialog v-if="afcExistsSpoolman" v-model="showSpoolmanDialog" :afc-lane="name" />
                <afc-unit-lane-filament-dialog v-model="showFilamentDialog" :name="name" />
            </v-col>
            <v-col class="pr-6 pl-2 pt-0 pb-0 d-flex flex-column justify-space-between align-end">
                <v-btn v-if="afcShowLaneInfinite" x-small @click="showInfintiyDialog = true">
                    <v-icon v-if="runoutLane === 'NONE'" color="error" small>{{ afcIconInfintiy }}</v-icon>
                    <template v-else>{{ runoutLane }}</template>
                </v-btn>
                <afc-unit-lane-infinite-dialog v-model="showInfintiyDialog" :name="name" />
                <span class="font-weight-bold">{{ spoolMaterial || '--' }}</span>
                <span class="text--disabled">
                    <template v-if="spoolRemainingWeight != null">{{ Math.round(spoolRemainingWeight) }} g</template>
                    <template v-else>--</template>
                </span>
                <v-tooltip v-if="hasTd" top>
                    <template #activator="{ on, attr }">
                        <span class="d-flex align-center justify-center text--disabled" v-bind="attr" v-on="on">
                            TD: {{ tdValue }}
                        </span>
                    </template>
                    <span>{{ $t('Panels.AfcPanel.Color') }}: #{{ tdColor }}</span>
                </v-tooltip>
            </v-col>
        </v-row>
        <v-row v-if="afcShowFilamentName" class="mb-0 mt-n3">
            <v-col class="px-6 pt-1">
                <div class="position-relative pb-4">
                    <a
                        v-if="spoolUrl"
                        :href="spoolUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="position-absolute text-truncate text-truncate-element text-center text-decoration-none filament-link">
                        {{ spoolFilamentName }}
                    </a>
                    <span v-else class="position-absolute text-truncate text-truncate-element text-center">
                        {{ spoolFilamentName }}
                    </span>
                </div>
            </v-col>
        </v-row>
    </div>
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
        return this.getAfcLaneObject(this.name)
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
        if (this.hasTd && this.showTd1Color) return `#${this.tdColor}`

        return this.lane.color || '#000000'
    }

    get spoolRemainingWeight(): number | undefined {
        return this.spool?.remaining_weight ?? this.lane.weight ?? undefined
    }

    get spoolFullWeight(): number | undefined {
        return this.spool?.initial_weight ?? this.lane.initial_weight ?? undefined
    }

    get spoolPercent() {
        if (this.spoolRemainingWeight == null || this.spoolFullWeight == null) return 100
        if (this.spoolFullWeight === 0) return 100

        return Math.round((this.spoolRemainingWeight / this.spoolFullWeight) * 100)
    }

    get spoolMaterial(): string {
        return this.spool?.filament?.material ?? this.lane.material ?? ''
    }

    get spoolFilamentVendor(): string | undefined {
        return this.spool?.filament?.vendor?.name
    }

    get spoolFilamentName(): string | undefined {
        return this.spool?.filament?.name || this.lane.filament_name || undefined
    }

    get spoolUrl(): string | undefined {
        if (!this.spoolManagerUrl || !this.spoolId) return undefined

        return `${this.spoolManagerUrl.replace(/\/$/, '')}/spool/show/${this.spoolId}`
    }

    get spoolExtruderTemp(): number | undefined {
        return this.spool?.filament?.settings_extruder_temp
    }

    get spoolBedTemp(): number | undefined {
        return this.spool?.filament?.settings_bed_temp
    }

    get spoolUsedWeight(): number | undefined {
        return this.spool?.used_weight
    }

    get showTd1Color(): boolean {
        return this.$store.state.gui.view.afc?.showTd1Color ?? true
    }

    get hasTd() {
        return (this.lane?.td1_td || null) !== null
    }

    get tdValue() {
        return this.lane?.td1_td || '--'
    }

    get tdColor() {
        return this.lane?.td1_color || '------'
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

.text-truncate-element {
    left: 0;
    right: 0;
}

.filament-link {
    color: inherit !important;
    cursor: pointer;
}

.filament-link:hover,
.filament-link:focus {
    text-decoration: underline !important;
}
</style>
