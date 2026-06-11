<template>
    <div :class="'consoleTable ' + (isMini ? 'mini' : '')">
        <v-row v-if="events.length === 0" class="pa-0 ma-0">
            <v-col class="text-center py-3">{{ $t('Console.Empty') }}</v-col>
        </v-row>
        <template v-else>
            <console-table-entry
                v-for="(event, index) of events"
                :key="index"
                class="consoleTableRow"
                :event="event"
                @command-click="commandClick" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import type { ServerStateEvent } from '@/store/server/types'
import ConsoleTableEntry from '@/components/console/ConsoleTableEntry.vue'

const props = defineProps<{
    events: ServerStateEvent[]
    isMini?: boolean
}>()

const emit = defineEmits<{
    (e: 'command-click', msg: string): void
}>()

function commandClick(msg: string) {
    emit('command-click', msg)
}
</script>
