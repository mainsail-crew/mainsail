<template>
    <div>
        <settings-miscellaneous-tab-light-groups
            v-if="editLightGroupObject"
            :light="editLightGroupObject"
            @close="editLightGroupObject = null" />
        <settings-miscellaneous-tab-light-presets
            v-else-if="editLightPresetObject"
            :light="editLightPresetObject"
            @close="editLightPresetObject = null" />
        <v-card-text v-else>
            <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.Miscellaneous') }}</h3>
            <template v-if="filteredLights.length">
                <div v-for="(light, index) in filteredLights" :key="index">
                    <v-divider v-if="index" class="my-2"></v-divider>
                    <settings-row :title="convertName(light.name)" :dynamic-slot-width="true">
                        <v-btn
                            v-if="light.chainCount > 1"
                            small
                            outlined
                            class="ml-3"
                            @click="editLightGroupObject = light">
                            <v-icon left small>{{ mdiPencil }}</v-icon>
                            {{ $t('Settings.MiscellaneousTab.Groups') }}
                        </v-btn>
                        <v-btn small outlined class="ml-3" @click="editLightPresetObject = light">
                            <v-icon left small>{{ mdiPalette }}</v-icon>
                            {{ $t('Settings.MiscellaneousTab.Presets') }}
                        </v-btn>
                    </settings-row>
                </div>
            </template>
            <template v-else>
                <v-row>
                    <v-col>
                        <p class="mb-0 text-center font-italic">{{ $t('Settings.MiscellaneousTab.NoDevicesFound') }}</p>
                    </v-col>
                </v-row>
            </template>
        </v-card-text>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPalette, mdiPencil } from '@mdi/js'
import { convertName } from '@/plugins/helpers'
import SettingsMiscellaneousTabLightGroups from '@/components/settings/SettingsMiscellaneousTabLightGroups.vue'
import SettingsMiscellaneousTabLightPresets from '@/components/settings/SettingsMiscellaneousTabLightPresets.vue'
import { PrinterStateLight } from '@/store/printer/types'

@Component({
    components: {
        SettingsRow,
        SettingsMiscellaneousTabLightGroups,
        SettingsMiscellaneousTabLightPresets,
    },
})
export default class SettingsMiscellaneousTab extends Mixins(BaseMixin) {
    mdiDelete = mdiDelete
    mdiPalette = mdiPalette
    mdiPencil = mdiPencil

    convertName = convertName

    editLightGroupObject: PrinterStateLight | null = null
    editLightPresetObject: PrinterStateLight | null = null

    get lights() {
        return this.$store.getters['printer/getLights'] ?? []
    }

    get filteredLights() {
        return this.lights.filter((light: PrinterStateLight) => light.colorOrder.length > 1)
    }
}
</script>

<style scoped></style>
