<template>
    <v-tooltip :disabled="tooltipDisabled" top>
        <template #activator="{ on, attrs }">
            <span class="d-flex align-center mx-1" v-bind="attrs" v-on="on">
                <span
                    v-if="label"
                    class="mr-2 text-subtitle-1 font-weight-bold text-uppercase"
                    style="padding-right: 4px">
                    {{ label }}
                </span>
                <div class="d-flex flex-column align-center">
                    <v-chip v-if="filament.color" :color="filament.color" x-small :style="chipStyle" class="chip">
                        {{ weightText }}
                    </v-chip>
                    <small v-if="filament.type" class="type mt-1">{{ filament.type }}</small>
                </div>
                <slot name="append" />
            </span>
        </template>
        <template v-if="details">
            <div v-if="details.spoolId">
                <div class="font-weight-bold">#{{ details.spoolId }} | {{ details.vendorName ?? '--' }}</div>
                <div>{{ details.filamentName ?? '--' }}</div>
                <div v-if="details.materialDetails">{{ details.materialDetails }}</div>
                <div v-if="details.weightsOutput">{{ details.weightsOutput }}</div>
            </div>
            <div v-else>
                <div v-if="details.material">{{ details.material }}</div>
                <div v-if="details.remainingWeight !== undefined">
                    {{ $t('Panels.AfcPanel.WeightRemaining', { weight: Math.round(details.remainingWeight) }) }}
                </div>
            </div>
        </template>
        <span v-else>{{ filament.name }}</span>
    </v-tooltip>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FilamentBadgeDetails, FileStateGcodefileFilament } from '@/store/files/types'
import { filamentTextColor, filamentWeightFormat } from '@/plugins/helpers'

@Component
export default class GcodefilesPanelTableRowFileMetadataFilaments extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly filament!: FileStateGcodefileFilament
    @Prop({ type: Object, required: false, default: undefined }) readonly details?: FilamentBadgeDetails
    @Prop({ type: String, required: false, default: undefined }) readonly label?: string
    @Prop({ type: Boolean, required: false, default: false }) readonly hideZeroWeight!: boolean

    get weightText() {
        const weight = this.filament.weight ?? 0
        if (this.hideZeroWeight && weight <= 0) return ''

        return filamentWeightFormat(weight)
    }

    get fontColor() {
        return filamentTextColor(this.filament.color)
    }

    get chipStyle() {
        return {
            color: this.fontColor,
        }
    }

    get tooltipDisabled(): boolean {
        if (!this.details) return false
        if (this.details.spoolId) return false

        return !this.details.material && this.details.remainingWeight === undefined
    }
}
</script>

<style scoped>
.chip {
    font-size: 0.7rem;
    cursor: pointer;
}

.type {
    font-size: 0.7rem;
    line-height: 1;
}
</style>
