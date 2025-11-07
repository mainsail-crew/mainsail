<template>
    <responsive
        :breakpoints="{
            small: (el) => el.width <= 350,
            medium: (el) => el.width > 350 && el.width <= 500,
        }">
        <template #default="{ el }">
            <v-container>
                <v-row>
                    <v-col
                        v-if="extruders.length > 1"
                        :class="{ 'col-12': el.is.small || el.is.medium, 'col-4': !el.is.small && !el.is.medium }">
                        <div class="d-flex align-center">
                            <v-btn v-if="selectedExtruder !== activeExtruder" icon plain @click="resetToActiveExtruder">
                                <v-icon>{{ mdiRestart }}</v-icon>
                            </v-btn>
                            <v-select
                                v-model="selectedExtruder"
                                :label="$t('Panels.ExtruderControlPanel.PressureAdvanceSettings.Extruder')"
                                :items="extruders"
                                hide-details
                                outlined
                                dense />
                        </div>
                    </v-col>
                    <v-col>
                        <pressure-advance-settings :extruder="selectedExtruder" :is-small="el.is.small" />
                    </v-col>
                </v-row>
            </v-container>
        </template>
    </responsive>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Responsive from '@/components/ui/Responsive.vue'
import { mdiRestart } from '@mdi/js'

@Component({
    components: { Responsive },
})
export default class ExtruderPressureAdvanceSettings extends Mixins(BaseMixin) {
    mdiRestart = mdiRestart

    selectedExtruder = ''

    get extruders() {
        return Object.keys(this.$store.state.printer)
            .filter((e) => e.startsWith('extruder'))
            .sort((a, b) => a.localeCompare(b))
    }

    get activeExtruder() {
        return this.$store.state.printer.toolhead?.extruder ?? 'extruder'
    }

    resetToActiveExtruder(): void {
        this.selectedExtruder = this.$store.state.printer.toolhead?.extruder
    }

    @Watch('activeExtruder', { immediate: true })
    onActiveExtruderChanged(newVal: string): void {
        this.selectedExtruder = newVal
    }
}
</script>
