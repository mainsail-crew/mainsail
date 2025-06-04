<template>
    <div>
        <v-row>
            <v-col class="pb-0">
                <h3 class="text-h6">
                    <v-icon v-if="modulIcon" left>{{ modulIcon }}</v-icon>
                    {{ unitNameOutput }}
                </h3>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="d-flex flex-row flex-wrap afc-unit-container">
                <afc-panel-unit-lane v-for="lane in lanes" :key="lane" :name="lane" />
            </v-col>
        </v-row>
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { afcIconBoxTurtle, afcIconHtlf, afcIconNightOwl } from '@/plugins/afcIcons'
import { convertName } from '@/plugins/helpers'

@Component
export default class AfcPanelUnit extends Mixins(BaseMixin, AfcMixin) {
    @Prop({ type: String, required: true }) readonly name!: string

    get unitName() {
        return this.name.substring(this.name.indexOf(' ') + 1)
    }

    get unitNameOutput() {
        return convertName(this.unitName)
    }

    get unit() {
        const printer = this.$store.state.printer ?? {}
        const moduleName = this.name.substring(0, this.name.indexOf(' ')).replaceAll('_', '')
        const key = `AFC_${moduleName} ${this.unitName}`

        return printer[key] ?? {}
    }

    get lanes() {
        return this.unit.lanes ?? []
    }

    get type() {
        const moduleName = this.name.substring(0, this.name.indexOf(' ')).replaceAll('_', '')

        return moduleName.toLowerCase()
    }

    get modulIcon() {
        switch (this.type) {
            case 'boxturtle':
                return afcIconBoxTurtle
            case 'htlf':
                return afcIconHtlf
            case 'nightowl':
                return afcIconNightOwl
            default:
                return null
        }
    }
}
</script>

<style scoped>
.afc-unit-container {
    gap: 16px;
}
</style>
