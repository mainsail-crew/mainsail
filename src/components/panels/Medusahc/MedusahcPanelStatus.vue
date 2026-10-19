<template>
    <div>
        <div class="rounded-lg grey border-1" :class="containerClasses">
            <v-row>
                <v-col class="pl-6 py-4 text-no-wrap">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <span
                                v-bind="attrs"
                                class="sensor-status rounded-circle d-inline-block mr-2"
                                :class="headSensorClasses"
                                v-on="on" />
                        </template>
                        <span>{{ headSensorOutput }}</span>
                    </v-tooltip>
                    <span>{{ $t('Panels.MedusahcPanel.Toolhead') }}</span>
                </v-col>
                <v-col class="py-4 text-center">{{ operationOutput }}</v-col>
                <v-col class="py-4 pr-6 text-right text-no-wrap">
                    {{ $t('Panels.MedusahcPanel.Mounted') }}:
                    <span :class="mountedClasses">{{ mountedOutput }}</span>
                </v-col>
            </v-row>
        </div>
        <v-alert v-if="medusahcLastError" :icon="mdiAlert" type="error" class="mt-3 mb-0" dense text>
            {{ medusahcLastError }}
        </v-alert>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MedusahcMixin, { MEDUSAHC_NO_TOOL, MEDUSAHC_SENSOR_ERROR } from '@/components/mixins/medusahc'
import { mdiAlert } from '@mdi/js'

@Component
export default class MedusahcPanelStatus extends Mixins(BaseMixin, MedusahcMixin) {
    mdiAlert = mdiAlert

    get hasError(): boolean {
        return this.medusahcCurrentTool === MEDUSAHC_SENSOR_ERROR || this.medusahcLastError !== ''
    }

    get containerClasses() {
        return {
            'border-primary': this.medusahcCurrentTool >= 0 && !this.hasError,
            'border-error': this.hasError,
            'darken-3': this.$vuetify.theme.dark,
            'lighten-2': !this.$vuetify.theme.dark,
        }
    }

    // Toolhead hall sensor; only present when pin_watch has a pin_e configured.
    get headSensor(): number | null {
        return this.medusahcSensors.e ?? null
    }

    get headSensorClasses() {
        return {
            success: this.headSensor === 1,
            'grey lighten-1': this.headSensor !== 1,
        }
    }

    get headSensorOutput(): string {
        if (this.headSensor === null) return this.$t('Panels.MedusahcPanel.NoHeadSensor').toString()

        const status =
            this.headSensor === 1 ? this.$t('Panels.MedusahcPanel.Detected') : this.$t('Panels.MedusahcPanel.Empty')

        return `${this.$t('Panels.MedusahcPanel.HeadSensor')} - ${status}`
    }

    get operationOutput(): string {
        const key = `Panels.MedusahcPanel.Operations.${this.medusahcOperation}`

        return this.$te(key) ? this.$t(key).toString() : this.medusahcOperation
    }

    get mountedOutput(): string {
        if (this.medusahcCurrentTool === MEDUSAHC_SENSOR_ERROR)
            return this.$t('Panels.MedusahcPanel.Unknown').toString()
        if (this.medusahcCurrentTool === MEDUSAHC_NO_TOOL) return this.$t('Panels.MedusahcPanel.None').toString()

        return `T${this.medusahcCurrentTool}`
    }

    get mountedClasses() {
        return {
            'primary--text': this.medusahcCurrentTool >= 0,
            'error--text': this.medusahcCurrentTool === MEDUSAHC_SENSOR_ERROR,
        }
    }
}
</script>

<style scoped>
.sensor-status {
    width: 12px;
    height: 12px;
    vertical-align: middle;
}

.v-application .border-error {
    border-color: var(--v-error-base) !important;
}

.v-application .border-primary {
    border-color: var(--v-primary-base) !important;
}
</style>
