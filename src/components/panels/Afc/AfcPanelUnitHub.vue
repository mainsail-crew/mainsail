<template>
    <div class="ml-3">
        <v-tooltip top>
            <template #activator="{ on, attr }">
                <span
                    v-bind="attr"
                    class="sensor-status rounded-circle d-inline-block mr-2"
                    :class="sensorClass"
                    v-on="on" />
            </template>
            <span>{{ sensorOutput }}</span>
        </v-tooltip>
        <span class="text-body-1">{{ $t('Panels.AfcPanel.Hub') }}</span>
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

@Component
export default class AfcPanelUnitHub extends Mixins(BaseMixin, AfcMixin) {
    @Prop({ type: String, required: true }) readonly name!: string

    get hub() {
        const printer = this.$store.state.printer ?? {}
        const key = `AFC_hub ${this.name}`

        return printer[key] ?? {}
    }

    get sensorStatus() {
        return this.hub.state ?? false
    }

    get sensorOutput() {
        const status = this.sensorStatus ? this.$t('Panels.AfcPanel.Detected') : this.$t('Panels.AfcPanel.Empty')

        return `${this.name} ${this.$t('Panels.AfcPanel.HubLoad')} - ${status}`
    }

    get sensorClass() {
        return {
            success: this.sensorStatus,
            error: !this.sensorStatus,
        }
    }
}
</script>

<style scoped>
.sensor-status {
    width: 10px;
    height: 10px;
}
</style>
