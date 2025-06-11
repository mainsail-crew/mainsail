<template>
    <div class="grey darken-3 flex-grow-1 afc-unit-lane d-flex flex-column" :class="laneStatusClass">
        <afc-panel-unit-lane-header :name="name" />
        <template v-if="laneReady">
            <afc-panel-unit-lane-body :name="name" />
            <afc-panel-unit-lane-actions :name="name" />
        </template>
        <afc-panel-unit-lane-empty v-else :name="name" />
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

@Component
export default class AfcPanelUnitLane extends Mixins(BaseMixin, AfcMixin) {
    @Prop({ type: String, required: true }) readonly name!: string

    get lane() {
        const printer = this.$store.state.printer ?? {}
        const key = `AFC_stepper ${this.name}`
        const key2 = `AFC_lane ${this.name}`

        return printer[key] ?? printer[key2] ?? {}
    }

    get laneActive() {
        const activeLaneName = this.afcCurrentLane?.name ?? ''

        return this.name === activeLaneName
    }

    get laneStatusClass() {
        if (this.laneActive && this.afcErrorState) return 'border-error'
        if (this.laneActive) return 'border-success'

        return ''
    }

    get laneReady() {
        return this.lane.load && this.lane.prep
    }
}
</script>

<style scoped>
.afc-unit-lane {
    border-radius: 8px;
    box-sizing: border-box !important;
    border-width: 1px;
    border-style: solid;
    flex-basis: 0;
}

.v-application .border-error {
    border-color: var(--v-error-base) !important;
}

.v-application .border-success {
    border-color: var(--v-primary-base) !important;
}
</style>
