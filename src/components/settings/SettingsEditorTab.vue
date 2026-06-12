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
                    <v-select v-model="tabSize" :items="tabSizes" item-title="text" item-value="value" hide-details outlined dense attached />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.EditorTab.KlipperRestartMethod')"
                    :sub-title="$t('Settings.EditorTab.KlipperRestartMethodDescription')">
                    <v-select
                        v-model="klipperRestartMethod"
                        :items="klipperRestartMethods"
                        item-title="text"
                        item-value="value"
                        hide-details
                        outlined
                        dense
                        attached />
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import SettingsRow from '@/components/settings/SettingsRow.vue'

const store = useStore()
const { t } = useI18n()

const klipperRestartMethods = [
    {
        text: 'FIRMWARE_RESTART',
        value: 'FIRMWARE_RESTART',
    },
    {
        text: 'RESTART',
        value: 'RESTART',
    },
]

const tabSizes = computed(() => {
    const spaces = [2, 4, 6, 8]
    return spaces.map((space) => ({
        text: t('Settings.EditorTab.Spaces', { count: space }),
        value: space,
    }))
})

const escToClose = computed({
    get: () => store.state.gui.editor.escToClose,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'editor.escToClose', value: newVal })
    },
})

const confirmUnsavedChanges = computed({
    get: () => store.state.gui.editor.confirmUnsavedChanges,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'editor.confirmUnsavedChanges', value: newVal })
    },
})

const tabSize = computed({
    get: () => store.state.gui.editor.tabSize || 2,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'editor.tabSize', value: newVal })
    },
})

const klipperRestartMethod = computed({
    get: () => store.state.gui.editor.klipperRestartMethod,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'editor.klipperRestartMethod', value: newVal })
    },
})
</script>
