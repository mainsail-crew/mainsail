<template>
    <v-dialog v-model="showDialog" persistent width="400" :fullscreen="isMobile">
        <panel
            :title="$t('Machine.LogfilesPanel.Rollover')"
            card-class="machine_rollover_logfiles-dialog"
            :icon="mdiFileSyncOutline"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <p class="mb-0">{{ $t('Machine.LogfilesPanel.RolloverDescription') }}</p>
                    </v-col>
                </v-row>
                <v-row class="mt-0">
                    <v-col>
                        <v-checkbox
                            v-for="log in rolloverLogfiles"
                            :key="log"
                            :model-value="selectedRolloverLogs"
                            @update:model-value="setSelectedRolloverLogs"
                            :label="capitalize(log)"
                            :value="log"
                            hide-details
                            class="mt-0" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">
                    {{ $t('Buttons.Cancel') }}
                </v-btn>
                <v-btn color="primary" variant="text" @click="btnRolloverLogs">
                    {{ $t('Machine.LogfilesPanel.Accept') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSocket } from '@/composables/useSocket'
import { useBase } from '@/composables/useBase'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiFileSyncOutline } from '@mdi/js'
import { rolloverLogfiles } from '@/store/variables'
import { capitalize } from '@/plugins/helpers'

const emit = defineEmits<{
    'update:model-value': [value: boolean]
}>()

const props = defineProps<{
    'model-value': boolean
}>()

const { isMobile, loadings } = useBase()
const socket = useSocket()

const showDialog = ref(props['model-value'])
const selectedRolloverLogs = ref<string[]>([])

watch(() => props['model-value'], (val) => {
    showDialog.value = val
})

watch(showDialog, (val) => {
    emit('update:model-value', val)
})

function setSelectedRolloverLogs(val: string[]) {
    selectedRolloverLogs.value = val
}

const loadingRolloverLogs = ref(false)

const checkLoadingRolloverLogs = () => {
    loadingRolloverLogs.value = loadings.value.filter((log: string) => log?.startsWith('rolloverLog_')).length > 0
}

watch(loadings, () => {
    checkLoadingRolloverLogs()
}, { immediate: true })

watch(loadingRolloverLogs, (newVal) => {
    if (newVal) closeDialog()
})

function btnRolloverLogs() {
    if (selectedRolloverLogs.value.length === 0) return
    selectedRolloverLogs.value.forEach((name) => {
        socket.emit(
            'server.logs.rollover',
            { application: name },
            { loading: 'rolloverLog_' + name, action: 'files/rolloverLog' }
        )
    })
    selectedRolloverLogs.value = []
}

function closeDialog() {
    showDialog.value = false
}
</script>
