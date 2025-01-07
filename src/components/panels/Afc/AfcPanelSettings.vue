<template>
    <v-menu :offset-y="true" :left="true" :close-on-content-click="false">
        <template #activator="{ on, attrs }">
            <v-btn icon tile v-bind="attrs" v-on="on">
                <v-icon small>{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item v-if="existsSpoolName" class="minHeight36">
                <v-checkbox
                    v-model="showSpoolName"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.AfcPanel.ShowSpoolName')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showInfiniteSpool"
                    class="mt-0"
                    hide-details
                    :disabled="infiniteSpoolActive"
                    :label="$t('Panels.AfcPanel.ShowInfiniteSpool')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showUnitIcons"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.AfcPanel.ShowUnitIcons')" />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCog } from '@mdi/js'
import { Unit } from '@/store/server/afc/types'
import ControlMixin from '@/components/mixins/control'
@Component
export default class AFCPanelSettings extends Mixins(BaseMixin, ControlMixin) {
    @Prop({ type: Array, required: true }) readonly units!: Unit[]
    mdiCog = mdiCog

    get existsSpoolName(): boolean {
        return !!this.$store.state.server.config.config?.spoolman?.server
    }

    get showSpoolName(): boolean {
        if (!this.existsSpoolName) return false

        return this.$store.state.gui.view.afc.showSpoolName ?? true
    }

    set showSpoolName(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.afc.showSpoolName', value: newVal })
    }

    get infiniteSpoolActive(): boolean {
        return this.units.some((unit) => unit.lanes.some((lane) => lane.runout_lane !== 'NONE'))
    }

    get showInfiniteSpool(): boolean {
        return this.$store.state.gui.view.afc.infiniteSpool ?? true
    }

    set showInfiniteSpool(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.afc.infiniteSpool', value: newVal })
    }

    get showUnitIcons(): boolean {
        return this.$store.state.gui.view.afc.showUnitIcons ?? true
    }

    set showUnitIcons(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.afc.showUnitIcons', value: newVal })
    }
}
</script>
