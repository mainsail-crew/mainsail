<template>
    <v-container>
        <v-row dense>
            <v-col v-for="index in unitArray" :key="'unit_' + index" cols="auto">
                <div :class="$vuetify.theme.dark ? 'mmu-unit mmu-unit-dark-theme' : 'mmu-unit mmu-unit-light-theme'">
                    <mmu-unit
                        :unit="index"
                        :edit-gate-map="editGateMap"
                        :edit-gate-selected="editGateSelected"
                        @select-gate="selectGate" />
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'

@Component({})
export default class MmuMachine extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: false, default: null }) readonly editGateMap!: MmuGateDetails[] | null
    @Prop({ required: false, default: -1 }) readonly editGateSelected!: number

    get unitArray(): number[] {
        return Array.from({ length: this.numUnits }, (_, k) => k)
    }

    private selectGate(gate: number): null {
        this.$emit('select-gate', gate)
    }
}
</script>

<style scoped>
.mmu-unit {
    padding-left: 16px;
    padding-right: 16px;
    border-radius: 10px 10px 10px 10px;
}

.mmu-unit-light-theme {
    background: #f0f0f0;
}

.mmu-unit-dark-theme {
    background: #2c2c2c;
}
</style>
