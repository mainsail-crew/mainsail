<template>
    <v-menu :offset-y="true" :left="true" :close-on-content-click="false">
        <template #activator="{ on, attrs }">
            <v-btn icon tile v-bind="attrs" v-on="on">
                <v-icon small>{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item v-if="hasEncoder" class="minHeight36">
                <v-checkbox
                    v-model="showClogDetection"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.MmuPanel.ShowClogDetection')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox v-model="showTtgMap" class="mt-0" hide-details :label="$t('Panels.MmuPanel.ShowTtgMap')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showDetails"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.MmuPanel.ShowDetails')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="largeFilamentStatus"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.MmuPanel.LargeFilamentStatus')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showUnavailableSpoolColor"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.MmuPanel.ShowUnavailableSpoolColor')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox v-model="showLogos" class="mt-0" hide-details :label="$t('Panels.MmuPanel.ShowLogos')" />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import { mdiCog } from '@mdi/js'

@Component({})
export default class MmuPanelSettings extends Mixins(BaseMixin, MmuMixin) {
    mdiCog = mdiCog

    get showClogDetection(): boolean {
        return this.$store.state.gui.view.mmu.showClogDetection ?? true
    }

    set showClogDetection(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.showClogDetection', value: newVal })
    }

    get showTtgMap(): boolean {
        return this.$store.state.gui.view.mmu.showTtgMap ?? true
    }

    set showTtgMap(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.showTtgMap', value: newVal })
    }

    get showDetails(): boolean {
        return this.$store.state.gui.view.mmu.showDetails ?? true
    }

    set showDetails(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.showDetails', value: newVal })
    }

    get largeFilamentStatus(): boolean {
        return this.$store.state.gui.view.mmu.largeFilamentStatus ?? true
    }

    set largeFilamentStatus(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.largeFilamentStatus', value: newVal })
    }

    get showLogos(): boolean {
        return this.$store.state.gui.view.mmu.showLogos ?? false
    }

    set showLogos(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.showLogos', value: newVal })
    }

    get showUnavailableSpoolColor(): boolean {
        return this.$store.state.gui.view.mmu.showUnavailableSpoolColor ?? false
    }

    set showUnavailableSpoolColor(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.showUnavailableSpoolColor', value: newVal })
    }
}
</script>

<style scoped></style>
