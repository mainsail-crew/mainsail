<template>
    <v-row>
        <v-col class="py-1">
            <v-checkbox v-model="value" :label="label" hide-details class="mt-0" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { capitalize } from '@/plugins/helpers'

@Component
export default class TemperaturePanelListItemEditChartSerie extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) readonly objectName!: string
    @Prop({ type: String, required: true }) readonly serieName!: string

    get value() {
        return this.$store.getters['gui/getDatasetValue']({ name: this.objectName, type: this.serieName })
    }

    get label() {
        return this.$t('Panels.TemperaturePanel.ShowNameInChart', {
            name: this.formatSerieName,
        })
    }

    set value(newVal) {
        this.$store.dispatch('gui/setChartDatasetStatus', {
            objectName: this.objectName,
            dataset: this.serieName,
            value: newVal,
        })
    }

    get formatSerieName() {
        return capitalize(this.serieName)
    }
}
</script>
