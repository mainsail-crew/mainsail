<template>
    <div>
        <v-row class="pt-3">
            <v-col class="text-center">
 <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    :disabled="['printing', 'paused'].includes(printer_state)"
                    @click="clickUpdate">
                    <v-icon start>{{ mdiProgressUpload }}</v-icon>
                    {{ $t('Machine.UpdatePanel.UpdateAll') }}
                </v-btn>
            </v-col>
        </v-row>
        <update-hint-all v-model="boolShowDialog" @update-all="updateAll" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import { useBase } from '@/composables/useBase'
import { mdiProgressUpload } from '@mdi/js'
import UpdateHintAll from '@/components/panels/Machine/UpdatePanel/UpdateHintAll.vue'

const { printer_state } = useBase()
const store = useStore()
const socket = useSocket()

const boolShowDialog = ref(false)

const hideUpdateWarning = ref(store.state.gui.uiSettings.hideUpdateWarnings ?? false)

function clickUpdate() {
    if (hideUpdateWarning.value) {
        updateAll()
        return
    }
    boolShowDialog.value = true
}

function updateAll() {
    socket.emit('machine.update.full', {})
}
</script>

<style scoped></style>
