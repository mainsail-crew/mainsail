<template>
    <v-card flat>
        <v-card-text v-if="showGeneral">
            <h3 class="text-h5 mb-3">{{ $t('Settings.MacrosTab.General') }}</h3>
            <settings-row :title="$t('Settings.MacrosTab.Management')">
                <v-select v-model="mode" :items="modes" outlined dense hide-details attach></v-select>
            </settings-row>
            <v-divider class="my-2"></v-divider>
        </v-card-text>
        <template v-if="mode === 'expert'">
            <settings-macros-tab-expert
                @update:showGeneral="updateShowGeneral"
                @scrollToTop="scrollToTop"></settings-macros-tab-expert>
        </template>
        <template v-else>
            <settings-macros-tab-simple></settings-macros-tab-simple>
        </template>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import SettingsMacrosTabSimple from '@/components/settings/SettingsMacrosTabSimple.vue'
import SettingsMacrosTabExpert from '@/components/settings/SettingsMacrosTabExpert.vue'
@Component({
    components: { SettingsMacrosTabExpert, SettingsMacrosTabSimple, SettingsRow },
})
export default class SettingsMacrosTab extends Mixins(BaseMixin) {
    private showGeneral = true

    get modes() {
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

    get mode() {
        return this.$store.state.gui?.macros?.mode ?? 'simple'
    }

    set mode(newVal) {
        this.$store.dispatch('gui/macros/saveSetting', { name: 'mode', value: newVal })
    }

    updateShowGeneral(newVal: boolean) {
        this.showGeneral = newVal
    }

    scrollToTop() {
        this.$emit('scrollToTop')
    }
}
</script>
