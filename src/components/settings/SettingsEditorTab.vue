<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row
                    :title="$t('Settings.EditorTab.UseEscToClose')"
                    :sub-title="$t('Settings.EditorTab.UseEscToCloseDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="escToClose" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.EditorTab.ConfirmUnsavedChanges')"
                    :sub-title="$t('Settings.EditorTab.ConfirmUnsavedChangesDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="confirmUnsavedChanges" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.EditorTab.TabSize')"
                    :sub-title="$t('Settings.EditorTab.TabSizeDescription')"
                    :dynamic-slot-width="true">
                    <v-select v-model="tabSize" :items="tabSizes" hide-details outlined dense attached />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.EditorTab.KlipperRestartMethod')"
                    :sub-title="$t('Settings.EditorTab.KlipperRestartMethodDescription')">
                    <v-select
                        v-model="klipperRestartMethod"
                        :items="klipperRestartMethods"
                        hide-details
                        outlined
                        dense
                        attached />
                </settings-row>
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
    components: { SettingsRow },
})
export default class SettingsEditorTab extends Mixins(BaseMixin) {
    private klipperRestartMethods = [
        {
            text: 'FIRMWARE_RESTART',
            value: 'FIRMWARE_RESTART',
        },
        {
            text: 'RESTART',
            value: 'RESTART',
        },
    ]

    get tabSizes() {
        const spaces = [2, 4, 6, 8]
        return spaces.map((space) => ({
            text: this.$t('Settings.EditorTab.Spaces', { count: space }),
            value: space,
        }))
    }

    get escToClose() {
        return this.$store.state.gui.editor.escToClose
    }

    set escToClose(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'editor.escToClose', value: newVal })
    }

    get confirmUnsavedChanges() {
        return this.$store.state.gui.editor.confirmUnsavedChanges
    }

    set confirmUnsavedChanges(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'editor.confirmUnsavedChanges', value: newVal })
    }

    get tabSize() {
        return this.$store.state.gui.editor.tabSize || 2
    }

    set tabSize(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'editor.tabSize', value: newVal })
    }

    get klipperRestartMethod() {
        return this.$store.state.gui.editor.klipperRestartMethod
    }

    set klipperRestartMethod(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'editor.klipperRestartMethod', value: newVal })
    }
}
</script>
