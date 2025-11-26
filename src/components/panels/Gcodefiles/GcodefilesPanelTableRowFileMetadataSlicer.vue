<template>
    <td class="text-no-wrap">
        {{ item.slicer }}
        <template v-if="item.slicer_version">
            <br />
            <small>{{ item.slicer_version }}</small>
        </template>
    </td>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'

@Component
export default class GcodefilesPanelTableRowFileMetadataSlicer extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly item!: FileStateGcodefile
}
</script>
