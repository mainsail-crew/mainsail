<template>
    <div>
        <v-btn :loading="loadings.includes('backupDbButton')" small @click="openDialog">
            {{ $t('Settings.GeneralTab.Backup') }}
        </v-btn>
        <v-dialog v-model="showDialog" persistent :width="360">
            <panel
                :title="$t('Settings.GeneralTab.Backup')"
                card-class="mainsail-backup-dialog"
                :margin-bottom="false"
                :icon="mdiHelpCircle">
                <template #buttons>
                    <v-btn :icon="mdiCloseThick" tile @click="closeDialog" />
                </template>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <p class="mb-0">{{ $t('Settings.GeneralTab.BackupDialog') }}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <checkbox-list
                            :options="backupableNamespaces"
                            select-all
                            @update:selectedCheckboxes="onSelectBackupCheckboxes" />
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn color="red" :loading="loadings.includes('backupMainsail')" @click="backupMainsail">
                                {{ $t('Settings.GeneralTab.Backup') }}
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
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiHelpCircle } from '@mdi/js'
import CheckboxList from '@/components/inputs/CheckboxList.vue'
import { TranslateResult } from 'vue-i18n'

const store = useStore()
const { loadings, loadBackupableNamespaces } = useSettingsDatabase()

const showDialog = ref(false)
const backupableNamespaces = ref<{ value: string; label: string | TranslateResult }[]>([])
const backupCheckboxes = ref<string[]>([])

onMounted(async () => {
    backupableNamespaces.value = await loadBackupableNamespaces()
})

function onSelectBackupCheckboxes(selected: string[]) {
    backupCheckboxes.value = selected
}

async function backupMainsail() {
    await store.dispatch('socket/addLoading', 'backupMainsail')
    await store.dispatch('gui/backupMoonrakerDB', backupCheckboxes.value)
    await store.dispatch('socket/removeLoading', 'backupMainsail')
    closeDialog()
}

async function openDialog() {
    backupableNamespaces.value = await loadBackupableNamespaces()
    showDialog.value = true
}

function closeDialog() {
    showDialog.value = false
}
</script>
