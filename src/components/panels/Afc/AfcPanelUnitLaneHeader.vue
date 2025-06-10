<template>
    <v-row class="flex-grow-0">
        <v-col class="px-6 pt-6 pb-3 py-4">
            <v-btn dense small class="w-100 elevation-0" @click="showDialog = true">
                {{ name }} > {{ mappedTool }}
            </v-btn>
            <afc-unit-lane-mapping-tool-dialog :name="name" :show="showDialog" @close="showDialog = false" />
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

@Component
export default class AfcPanelUnitLaneHeader extends Mixins(BaseMixin, AfcMixin) {
    @Prop({ type: String, required: true }) readonly name!: string

    showDialog = false

    get lane() {
        const printer = this.$store.state.printer ?? {}
        const unitObjectName = `AFC_stepper ${this.name}`.toLowerCase()
        const objectName = Object.keys(printer).find((key) => key.toLowerCase() === unitObjectName) ?? ''

        return printer[objectName] ?? {}
    }

    get mappedTool() {
        return this.lane.map ?? '--'
    }
}
</script>
