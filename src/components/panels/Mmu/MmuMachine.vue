<template>
  <v-container>
    <v-row dense>
        <v-col v-for="index in unitArray" cols="auto" :key="'unit_' + index">
          <div :class="$vuetify.theme.dark ? 'mmu-unit-dark-theme' : 'mmu-unit-light-theme'">
            <mmu-unit :unit="index"
                      :editGateMap="editGateMap"
                      :editGateSelected="editGateSelected"
                      @select-gate="selectGate"/>
          </div>
        </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import MmuUnit from '@/components/panels/Mmu/MmuUnit.vue'

@Component({ })
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
.mmu-unit-light-theme {
    border-radius: 10px;
    background: #F0F0F0;
}

.mmu-unit-dark-theme {
    border-radius: 10px;
    background: #2C2C2C;
}
</style>
