<template>
    <div>
        <settings-miscellaneous-tab-light-groups
            v-if="editLightGroupObject"
            :light="editLightGroupObject"
            @close="editLightGroupObject = null" />
        <v-card-text v-else>
            <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.Miscellaneous') }}</h3>
            <template v-if="lights.length">
                <div v-for="(light, index) in lights" :key="index">
                    <v-divider v-if="index" class="my-2"></v-divider>
                    <settings-row :title="convertName(light.name)" :dynamic-slot-width="true">
                        <v-btn small outlined class="ml-3">
                            <v-icon left small>{{ mdiPalette }}</v-icon>
                            {{ $t('Settings.MiscellaneousTab.Presets') }}
                        </v-btn>
                        <v-btn
                            v-if="light.chainCount > 1"
                            small
                            outlined
                            class="ml-3"
                            @click="editLightGroupObject = light">
                            <v-icon left small>{{ mdiPencil }}</v-icon>
                            {{ $t('Settings.MiscellaneousTab.Groups') }}
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
import { PrinterStateLight } from '@/store/printer/types'

@Component({
    components: {
        SettingsRow,
        SettingsMiscellaneousTabLightGroups,
    },
})
export default class SettingsMiscellaneousTab extends Mixins(BaseMixin) {
    mdiDelete = mdiDelete
    mdiPalette = mdiPalette
    mdiPencil = mdiPencil

    convertName = convertName

    editLightGroupObject: PrinterStateLight | null = null

    get lights() {
        return this.$store.getters['printer/getLights'] ?? []
    }
}
</script>

<style lang="scss" scoped></style>
