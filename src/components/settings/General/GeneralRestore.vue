<template>
    <div>
        <input ref="uploadBackupFile" type="file" :accept="['.json']" class="d-none" @change="uploadRestore" />
        <v-btn small :loading="loadings.includes('restoreUploadButton')" class="ml-3" @click="restoreDb">
            {{ $t('Settings.GeneralTab.Restore') }}
        </v-btn>
        <v-dialog :value="showDialog" persistent :width="360">
            <panel
                :title="$t('Settings.GeneralTab.Restore')"
                card-class="mainsail-restore-dialog"
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
                            <p class="mb-0">{{ $t('Settings.GeneralTab.RestoreDialog') }}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <checkbox-list
                            :options="restoreableNamespaces"
                            select-all
                            @update:selectedCheckboxes="onSelectRestoreCheckboxes" />
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn color="red" :loading="loadings.includes('restoreMainsail')" @click="restoreDbAction">
                                {{ $t('Settings.GeneralTab.Restore') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from 'vuex'
import { getCurrentInstance } from 'vue'
import { useSettingsDatabase } from '@/composables/useSettingsDatabase'
import { useI18n } from 'vue-i18n'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiHelpCircle } from '@mdi/js'
import CheckboxList from '@/components/inputs/CheckboxList.vue'
import { TranslateResult } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()
const { loadings, loadBackupableNamespaces, availableKeys, sortNamespaces } = useSettingsDatabase()
const { proxy } = getCurrentInstance()!

const uploadBackupFile = ref<HTMLInputElement | null>(null)
const showDialog = ref(false)
const restoreableNamespaces = ref<{ value: string; label: string | TranslateResult }[]>([])
const restoreCheckboxes = ref<string[]>([])
const restoreObjects = ref<Record<string, unknown>>({})

function onSelectRestoreCheckboxes(selected: string[]) {
    restoreCheckboxes.value = selected
}

function restoreDb() {
    uploadBackupFile.value?.click()
}

function uploadRestore() {
    const backup = uploadBackupFile.value?.files?.[0]
    if (!backup) {
        window.console.error('No json uploaded')
        return
    }

    const reader = new FileReader()
    reader.readAsText(backup, 'UTF-8')
    reader.onload = (evt) => {
        restoreableNamespaces.value = []
        try {
            restoreObjects.value = JSON.parse(evt?.target?.result + '')

            const keys = Object.keys(restoreObjects.value)
            restoreableNamespaces.value = keys.map((key) => {
                const namespace = availableKeys.value.find((ns) => ns.value === key)
                if (namespace) return namespace

                return { value: key, label: key }
            })

            restoreableNamespaces.value = restoreableNamespaces.value.sort(sortNamespaces)

            openDialog()
        } catch {
            proxy!.$toast.error(t('Settings.GeneralTab.CannotReadJson').toString())
        }
    }
    reader.onerror = (evt) => {
        window.console.error(evt)
    }

    if (uploadBackupFile.value) {
        uploadBackupFile.value.value = ''
    }
}

function openDialog() {
    showDialog.value = true
}

function closeDialog() {
    showDialog.value = false
}

function restoreDbAction() {
    store.dispatch('socket/addLoading', 'restoreDbAction')

    store.dispatch('gui/restoreMoonrakerDB', {
        dbCheckboxes: restoreCheckboxes.value,
        restoreObjects: restoreObjects.value,
    })
}
</script>
