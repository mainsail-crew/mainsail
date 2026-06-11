<template>
    <v-card-text class="py-3 bt-1">
        <settings-row :title="$t('Dialogs.StartPrint.Timelapse')" :dense="true">
            <v-switch v-model="timelapseEnabled" hide-details class="mt-0" />
        </settings-row>
    </v-card-text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'

const store = useStore()
const socket = useSocket()

const timelapseEnabled = computed({
    get: () => store.state.server.timelapse?.settings?.enabled ?? false,
    set: (newVal) => {
        socket.emit(
            'machine.timelapse.post_settings',
            { enabled: newVal },
            { action: 'server/timelapse/initSettings' }
        )
    },
})
</script>
