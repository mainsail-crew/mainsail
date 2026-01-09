<template>
    <v-row class="flex-grow-0">
        <v-col class="px-6 pt-6 pb-3 py-4">
            <v-btn dense small class="w-100 elevation-0" @click="showDialog = true">
                {{ name }} > {{ mappedTool }}
            </v-btn>
            <afc-unit-lane-mapping-tool-dialog v-model="showDialog" :name="name" />
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
        return this.getAfcLaneObject(this.name)
    }

    get mappedTool() {
        return this.lane.map ?? '--'
    }
}
</script>
