<template>
    <td class="text-no-wrap">{{ values.join(', ') }}</td>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'

@Component
export default class GcodefilesPanelTableRowFileMetadataFilamentStrings extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly item!: FileStateGcodefile
    @Prop({ type: String, required: true }) readonly column!: string

    get value() {
        return this.item[this.column] ?? null
    }

    get values() {
        return (this.value ?? '').replace(/"/g, '').split(';')
    }
}
</script>
