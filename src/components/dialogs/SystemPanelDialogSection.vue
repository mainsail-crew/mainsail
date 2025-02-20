<template>
    <div>
        <v-row :class="marginTop ? 'mt-5' : ''">
            <v-col>
                <span class="headline">{{ name }}</span>
            </v-col>
        </v-row>
        <template v-for="(value, key, index) in entries">
            <v-divider v-if="index" :key="`divider_${key}`" class="my-3" />
            <SystemPanelDialogSectionEntry :key="`entry_${key}`" :name="key" :value="value" />
        </template>
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SystemPanelDialogSectionEntry from '@/components/dialogs/SystemPanelDialogSectionEntry.vue'

@Component({
    components: { SystemPanelDialogSectionEntry },
})
export default class SystemPanelDialogSection extends Mixins(BaseMixin) {
    @Prop({ required: true, type: String }) readonly name!: string
    @Prop({ required: true, type: Object }) readonly entries!: object
    @Prop({ type: Boolean, default: false }) readonly marginTop!: boolean
}
</script>
