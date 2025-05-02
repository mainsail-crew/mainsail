<template>
    <div class="empty-card-body">
        <div class="empty-card-info text--disabled">{{ laneStatus }}</div>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component({
    components: {},
})
export default class AfcUnits extends Mixins(BaseMixin) {
    @Prop({ type: String, required: false }) readonly laneStatus!: string
}
</script>

<style scoped>
.empty-card-body {
    padding-top: 10px;
    min-height: 90px;
}
.empty-card-info {
    text-align: center;
    width: 100%;
    min-width: 74px;
}
</style>
