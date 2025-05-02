<template>
    <div style="width: 100%">
        <afc-units-item v-for="(unit, index) in units" :key="index" :unit="unit" class="unit-section" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcUnitsItem from '@/components/panels/Afc/AfcUnitsItem.vue'
import { Unit } from '@/store/server/afc/types'

@Component({
    components: { AfcUnitsItem },
})
export default class AfcUnits extends Mixins(BaseMixin) {
    @Prop({ type: Array, required: true }) readonly units!: Unit[]
}
</script>

<style scoped></style>
