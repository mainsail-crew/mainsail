<template>
    <v-tooltip top>
        <template #activator="{ on, attrs }">
            <div class="d-flex flex-column align-center mx-1" v-bind="attrs" v-on="on">
                <v-chip :color="filament.color" x-small :style="chipStyle" class="chip">{{ weight }}</v-chip>
                <small class="type mt-1">{{ filament.type }}</small>
            </div>
        </template>
        <span>{{ filament.name }}</span>
    </v-tooltip>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefileFilament } from '@/store/files/types'
import { filamentTextColor } from '@/plugins/helpers'

@Component
export default class GcodefilesPanelTableRowFileMetadataFilaments extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly filament!: FileStateGcodefileFilament

    get weight() {
        const weight = this.filament.weight ?? 0

        if (weight > 1000) return Math.round(weight / 10) / 100 + ' kg'
        else if (weight > 100) return `${Math.round(weight)} g`

        return `${Math.round(weight * 10) / 10} g`
    }

    get fontColor() {
        return filamentTextColor(this.filament.color)
    }

    get chipStyle() {
        return {
            color: this.fontColor,
        }
    }
}
</script>

<style scoped>
.chip {
    font-size: 0.7rem;
    cursor: pointer;
}

.type {
    line-height: 1;
}
</style>
