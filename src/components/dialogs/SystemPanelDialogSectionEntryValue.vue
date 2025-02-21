<template>
    <div v-if="valueType === 'string'">{{ value }}</div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class SystemPanelDialogSectionEntryValue extends Mixins(BaseMixin) {
    @Prop({ required: true, type: String }) readonly name!: string
    @Prop({ required: true, type: Object }) readonly value!: object

    get valueType() {
        return typeof this.value
    }

    get valueOutput() {
        if (typeof this.value === 'object') {
            return JSON.stringify(this.value)
        }

        return this.value
    }
}
</script>
