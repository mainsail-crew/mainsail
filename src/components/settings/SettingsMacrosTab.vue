
<template>
    <v-card flat>
        <v-card-text>
            <h3 class="text-h5 mb-3">{{ $t('Settings.MacrosTab.General') }}</h3>
            <settings-row :title="$t('Settings.MacrosTab.Management')" :dynamicSlotWidth="true">
                <v-select v-model="macroManagement" :items="macroManagements" outlined dense hide-details></v-select>
            </settings-row>
            <template v-if="macroManagement === 'expert'">

            </template>
            <template v-else>
                <settings-macros-tab-simple></settings-macros-tab-simple>
            </template>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import SettingsMacrosTabSimple from '@/components/settings/SettingsMacrosTabSimple.vue'
@Component({
    components: {SettingsMacrosTabSimple, SettingsRow}
})
export default class SettingsMacrosTab extends Mixins(BaseMixin) {

    get macroManagements() {
        return [
            {
                text: this.$t('Settings.MacrosTab.Simple'),
                value: 'simple',
            },
            {
                text: this.$t('Settings.MacrosTab.Expert'),
                value: 'expert',
            },
        ]
    }

    get macroManagement() {
        return this.$store.state.gui?.dashboard?.macroManagement ?? 'simple'
    }

    set macroManagement(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.macroManagement', value: newVal })
    }
}
</script>