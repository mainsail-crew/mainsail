<template>
    <div style="width: 100%">
        <afc-units-item
            v-for="(unit, unitName) in unitsData"
            :key="unitName"
            :unit="unit"
            :unit-name="unitName"
            class="unit-section" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcUnitsItem from '@/components/panels/Afc/AfcUnitsItem.vue'

@Component({
    components: { AfcUnitsItem },
})
export default class AfcUnits extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly unitsData!: Record<string, any>
}
</script>

<style scoped></style>
