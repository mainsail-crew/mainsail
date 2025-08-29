<template>
    <v-card-text class="py-3 bt-1">bla</v-card-text>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'

@Component
export default class StartPrintDialogAfc extends Mixins(BaseMixin) {
    @Prop({ required: true }) readonly file!: FileStateGcodefile
}
</script>
