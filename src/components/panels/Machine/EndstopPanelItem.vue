<template>
    <v-row>
        <v-col class="py-1">
            <label class="mt-1 d-inline-block">
                <span v-if="item.type === 'endstop'" class="mr-2">{{ $t('Machine.EndstopPanel.Endstop') }}</span>
                <b>{{ name }}</b>
            </label>
            <v-chip small label class="float-right" :color="chipColor" text-color="white">{{ value }}</v-chip>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { EndstopItem } from '@/components/panels/Machine/EndstopPanel.vue'
import { camelize, capitalize } from '@/plugins/helpers'
@Component({
    components: { Panel },
})
export default class EndstopPanelItem extends Mixins(BaseMixin) {
    @Prop({ type: Object }) declare readonly item: EndstopItem

    get name() {
        if (this.item.type === 'endstop') return this.item.name.toUpperCase()

        return capitalize(camelize(this.item.name))
    }

    get chipColor() {
        return this.item.value === 'open' ? 'green' : 'red'
    }

    get value() {
        return this.item.value === 'open'
            ? this.$t('Machine.EndstopPanel.open')
            : this.$t('Machine.EndstopPanel.TRIGGERED')
    }
}
</script>
