<template>
    <v-list-item class="minHeight36 text-no-wrap">
        <v-checkbox v-model="value" class="mt-0" hide-details :label="label" />
    </v-list-item>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

@Component
export default class AfcPanelSettingsExtruder extends Mixins(BaseMixin, AfcMixin) {
    @Prop({ type: String, required: true }) readonly name!: string

    value = true

    get label() {
        return this.$t(`Panels.AfcPanel.ShowTool`, { name: this.name }) as string
    }

    mounted() {
        this.value = !this.afcHiddenExtruders.includes(this.name)
    }

    @Watch('value')
    onValueChange(newValue: boolean) {
        if (newValue) {
            this.removeFromHiddenExtruders(this.name)
            return
        }

        this.addToHiddenExtruders(this.name)
    }

    private removeFromHiddenExtruders(name: string) {
        const hiddenExtruders = [...this.afcHiddenExtruders]
        const index = hiddenExtruders.indexOf(name)
        if (index > -1) hiddenExtruders.splice(index, 1)

        this.$store.dispatch('gui/saveSetting', { name: 'view.afc.hiddenExtruders', value: hiddenExtruders })
    }

    private addToHiddenExtruders(name: string) {
        const hiddenExtruders = [...this.afcHiddenExtruders]
        if (!hiddenExtruders.includes(name)) hiddenExtruders.push(name)

        this.$store.dispatch('gui/saveSetting', { name: 'view.afc.hiddenExtruders', value: hiddenExtruders })
    }
}
</script>
