<template>
    <v-menu :offset-y="true" :left="true" :close-on-content-click="false">
        <template #activator="{ on, attrs }">
            <v-btn icon tile v-bind="attrs" v-on="on">
                <v-icon small>{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item v-if="toolchangeMacros.length" class="minHeight36">
                <v-checkbox
                    v-model="showTools"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ExtruderControlPanel.Tools')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showExtrusionFactor"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ExtruderControlPanel.ExtrusionFactor')" />
            </v-list-item>
            <v-list-item v-if="existsPressureAdvance" class="minHeight36">
                <v-checkbox
                    v-model="showPressureAdvance"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ExtruderControlPanel.PressureAdvance')" />
            </v-list-item>
            <v-list-item v-if="existsFirmwareRetraction" class="minHeight36">
                <v-checkbox
                    v-model="showFirmwareRetraction"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ExtruderControlPanel.FirmwareRetraction')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showExtruderControl"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ExtruderControlPanel.ExtruderControl')" />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCog } from '@mdi/js'
import ControlMixin from '@/components/mixins/control'
@Component
export default class ExtruderPanelSettings extends Mixins(BaseMixin, ControlMixin) {
    mdiCog = mdiCog

    get showTools(): boolean {
        return this.$store.state.gui.view.extruder.showTools ?? true
    }

    set showTools(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.extruder.showTools', value: newVal })
    }

    get showExtrusionFactor(): boolean {
        return this.$store.state.gui.view.extruder.showExtrusionFactor ?? true
    }

    set showExtrusionFactor(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.extruder.showExtrusionFactor', value: newVal })
    }

    get existsPressureAdvance(): boolean {
        return !(this.$store.getters['printer/getExtruderSteppers'].length > 0)
    }

    get showPressureAdvance(): boolean {
        return this.$store.state.gui.view.extruder.showPressureAdvance ?? true
    }

    set showPressureAdvance(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.extruder.showPressureAdvance', value: newVal })
    }

    get showFirmwareRetraction(): boolean {
        return this.$store.state.gui.view.extruder.showFirmwareRetraction ?? true
    }

    set showFirmwareRetraction(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.extruder.showFirmwareRetraction', value: newVal })
    }

    get showExtruderControl(): boolean {
        return this.$store.state.gui.view.extruder.showExtruderControl ?? true
    }

    set showExtruderControl(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.extruder.showExtruderControl', value: newVal })
    }
}
</script>
