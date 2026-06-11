<template>
    <div>
        <v-btn color="error" small @click="openDialog">
            {{ $t('Settings.GeneralTab.FactoryReset') }}
        </v-btn>
        <v-dialog v-model="showDialog" persistent :width="360">
            <panel
                :title="$t('Settings.GeneralTab.FactoryReset')"
                card-class="mainsail-reset-dialog"
                :margin-bottom="false"
                :icon="mdiHelpCircle">
                <template #buttons>
                    <v-btn icon tile @click="closeDialog">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <p class="mb-0">{{ $t('Settings.GeneralTab.FactoryDialog') }}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <checkbox-list
                            :options="resetableNamespaces"
                            select-all
                            @update:selectedCheckboxes="onSelectResetCheckboxes" />
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                color="red"
                                :loading="loadings.includes('resetMainsail')"
                                @click="resetMainsailAction">
                                {{ $t('Settings.GeneralTab.Reset') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useSettingsDatabase } from '@/composables/useSettingsDatabase'
import { useI18n } from 'vue-i18n'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiHelpCircle } from '@mdi/js'
import CheckboxList from '@/components/inputs/CheckboxList.vue'
import { TranslateResult } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()
const { loadings, loadBackupableNamespaces, moonrakerComponents } = useSettingsDatabase()

const showDialog = ref(false)
const resetableNamespaces = ref<{ value: string; label: string | TranslateResult }[]>([])
const resetCheckboxes = ref<string[]>([])

onMounted(async () => {
    await loadResetableNamespaces()
})

function onSelectResetCheckboxes(selected: string[]) {
    resetCheckboxes.value = selected
}

function resetMainsailAction() {
    store.dispatch('socket/addLoading', 'resetMainsail')
    store.dispatch('gui/resetMoonrakerDB', resetCheckboxes.value)
}

async function openDialog() {
    await loadResetableNamespaces()
    showDialog.value = true
}

async function loadResetableNamespaces() {
    resetableNamespaces.value = await loadBackupableNamespaces()

    if (!moonrakerComponents.value.includes('history')) return

    resetableNamespaces.value.push({
        value: 'history_jobs',
        label: t('Settings.GeneralTab.DbHistoryJobs'),
    })

    resetableNamespaces.value.push({
        value: 'history_totals',
        label: t('Settings.GeneralTab.DbHistoryTotals'),
    })
}

function closeDialog() {
    showDialog.value = false
}
</script>
