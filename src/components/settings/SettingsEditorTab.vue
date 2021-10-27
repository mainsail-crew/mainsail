<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.EditorTab.UseEscToClose')" :sub-title="$t('Settings.EditorTab.UseEscToCloseDescription')" :dynamicSlotWidth="true">
                    <v-switch v-model="escToClose" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.EditorTab.ConfirmUnsavedChanges')" :sub-title="$t('Settings.EditorTab.ConfirmUnsavedChangesDescription')" :dynamicSlotWidth="true">
                    <v-switch v-model="confirmUnsavedChanges" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
@Component({
    components: {SettingsRow}
})
export default class SettingsEditorTab extends Mixins(BaseMixin) {

    get escToClose() {
        return this.$store.state.gui.editor.escToClose
    }

    set escToClose(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'editor.escToClose', value: newVal })
    }

    get confirmUnsavedChanges() {
        return this.$store.state.gui.editor.confirmUnsavedChanges
    }

    set confirmUnsavedChanges(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'editor.confirmUnsavedChanges', value: newVal })
    }
}
</script>