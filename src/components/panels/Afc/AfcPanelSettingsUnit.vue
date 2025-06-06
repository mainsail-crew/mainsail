<template>
    <v-list-item class="minHeight36">
        <v-checkbox v-model="value" class="mt-0" hide-details :label="label" />
    </v-list-item>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { convertName } from '@/plugins/helpers'

@Component
export default class AfcPanelSettingsUnit extends Mixins(BaseMixin, AfcMixin) {
    @Prop({ type: String, required: true }) readonly name!: string

    value = true

    get label() {
        const unitName = this.name.substring(this.name.indexOf(' ') + 1)

        return this.$t(`Panels.AfcPanel.ShowUnit`, { name: convertName(unitName) }) as string
    }

    mounted() {
        this.value = !this.afcHiddenUnits.includes(this.name)
    }

    @Watch('value')
    onValueChange(newValue: boolean) {
        if (newValue) {
            this.removeFromHiddenUnits(this.name)
            return
        }

        this.addToHiddenUnits(this.name)
    }

    private removeFromHiddenUnits(name: string) {
        const hiddenUnits = [...this.afcHiddenUnits]
        const index = hiddenUnits.indexOf(name)
        if (index > -1) hiddenUnits.splice(index, 1)

        this.$store.dispatch('gui/saveSetting', { name: 'view.afc.hiddenUnits', value: hiddenUnits })
    }

    private addToHiddenUnits(name: string) {
        const hiddenUnits = [...this.afcHiddenUnits]
        if (!hiddenUnits.includes(name)) hiddenUnits.push(name)

        this.$store.dispatch('gui/saveSetting', { name: 'view.afc.hiddenUnits', value: hiddenUnits })
    }
}
</script>
