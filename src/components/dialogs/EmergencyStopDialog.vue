<template>
    <v-dialog v-model="showDialog" width="400" persistent>
        <panel
            :title="$t('EmergencyStopDialog.EmergencyStop')"
            toolbar-color="error"
            card-class="emergency-stop-dialog"
            :icon="mdiAlertOctagonOutline"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>{{ $t('EmergencyStopDialog.AreYouSure') }}</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closePrompt">{{ $t('Buttons.No') }}</v-btn>
                <v-btn color="error" variant="text" @click="emergencyStop">{{ $t('Buttons.Yes') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSocket } from '@/composables/useSocket'
import Panel from '@/components/ui/Panel.vue'

import { mdiAlertOctagonOutline, mdiCloseThick } from '@mdi/js'

const socket = useSocket()

const props = defineProps({
    modelValue: { type: Boolean },
})
const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

function emergencyStop() {
    socket.emit('printer.emergency_stop', {}, { loading: 'topbarEmergencyStop' })

    closePrompt()
}

function closePrompt() {
    showDialog.value = false
}
</script>

<style scoped></style>
