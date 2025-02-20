<template>
    <v-row>
        <v-col>{{ name }}</v-col>
        <v-col class="text-right">
            <SystemPanelDialogSectionEntryValue v-for="(value, key) in value" :key="key" :name="key" :value="value" />
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SystemPanelDialogSectionEntryValue from '@/components/dialogs/SystemPanelDialogSectionEntryValue.vue'

@Component({
    components: { SystemPanelDialogSectionEntryValue },
})
export default class SystemPanelDialogSectionEntry extends Mixins(BaseMixin) {
    @Prop({ required: true, type: String }) readonly name!: string
    @Prop({ required: true, type: Object }) readonly value!: object
}
</script>
