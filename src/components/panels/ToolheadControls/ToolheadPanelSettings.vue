<template>
    <v-menu :offset-y="true" :left="true" :close-on-content-click="false">
        <template #activator="{ on, attrs }">
            <v-btn icon tile v-bind="attrs" v-on="on">
                <v-icon small>{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showPosition"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.PositionOutput')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showCoordinates"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.CoordinateFields')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showControl"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.ControlButtons')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showZOffset"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.ZOffset')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showSpeedFactor"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.SpeedFactor')" />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCog } from '@mdi/js'

@Component
export default class ToolheadPanelSettings extends Mixins(BaseMixin) {
    mdiCog = mdiCog

    get showPosition(): boolean {
        return this.$store.state.gui.view.toolhead.showPosition ?? true
    }

    set showPosition(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.toolhead.showPosition', value: newVal })
    }

    get showCoordinates(): boolean {
        return this.$store.state.gui.view.toolhead.showCoordinates ?? true
    }

    set showCoordinates(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.toolhead.showCoordinates', value: newVal })
    }

    get showControl(): boolean {
        return this.$store.state.gui.view.toolhead.showControl ?? true
    }

    set showControl(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.toolhead.showControl', value: newVal })
    }

    get showZOffset(): boolean {
        return this.$store.state.gui.view.toolhead.showZOffset ?? true
    }

    set showZOffset(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.toolhead.showZOffset', value: newVal })
    }

    get showSpeedFactor(): boolean {
        return this.$store.state.gui.view.toolhead.showSpeedFactor ?? true
    }

    set showSpeedFactor(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.toolhead.showSpeedFactor', value: newVal })
    }
}
</script>
