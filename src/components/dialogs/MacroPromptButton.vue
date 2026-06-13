<template>
 <v-btn :color="color" class="ma-2" @click="sendCommand">{{ variant="text" }}</v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import type { ServerStateEventPrompt } from '@/store/server/types'

const store = useStore()
const socket = useSocket()

const props = defineProps({
    event: { type: Object as () => ServerStateEventPrompt, required: true },
})

const splits = computed(() => props.event.message.split('|'))

const text = computed(() => splits.value[0])

const command = computed(() => splits.value[1] ?? text.value)

const color = computed(() => splits.value[2] ?? '')

function sendCommand() {
    store.dispatch('server/addEvent', { message: command.value, type: 'command' })
    socket.emit('printer.gcode.script', { script: command.value })
}
</script>
