<template>
    <v-row :class="entryStyle">
        <v-col class="v-col-auto pr-0 text-disabled console-time">{{ entryFormatTime }}</v-col>
        <v-col
            v-if="!rawOutput"
            :class="messageClass"
            style="min-width: 0"
            @click.capture="commandClick"
            v-html="event.formatMessage" />
        <v-col v-else :class="messageClass" style="min-width: 0" @click.capture="commandClick" v-text="event.message" />
    </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import type { ServerStateEvent } from '@/store/server/types'

const props = defineProps<{
    event: ServerStateEvent
}>()

const emit = defineEmits<{
    (e: 'command-click', command: string): void
}>()

const store = useStore()
const { formatTime } = useBase()

const entryStyle = computed(() => {
    const classes = ['ma-0', 'flex-nowrap']
    classes.push(store.state.gui.console.entryStyle ?? 'default')
    if (['action', 'debug'].includes(props.event.type)) classes.push('text-disabled')

    return classes
})

const entryFormatTime = computed(() => formatTime(props.event.date.getTime(), true))

const messageClass = computed(() => {
    const classes = ['console-message']

    if (['action', 'debug'].includes(props.event.type)) classes.push('text-disabled')
    else if (props.event.message.startsWith('!! ')) classes.push('text-error')
    else classes.push('text-primary')

    return classes
})

const rawOutput = computed(() => store.state.gui.console.rawOutput ?? false)

function commandClick(event: Event) {
    const eventTarget = event.target as Element
    if (eventTarget.localName === 'a' && eventTarget.className.indexOf('command') !== -1) {
        const command = eventTarget.innerHTML.replace(/<br>/g, '\n')

        emit('command-click', command)
    }
}
</script>

<style scoped>
.console-time {
    flex: 0 0 auto;
    width: auto;
    white-space: nowrap;
}

.consoleTableRow {
    font-family: 'Roboto Mono', monospace;
    font-size: 0.95em;
    white-space: pre-wrap;

    &.default {
        .v-col {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
        }

        & + .consoleTableRow .v-col {
            border-top: 1px solid rgba(255, 255, 255, 0.12);
        }
    }

    &.compact {
        .v-col {
            padding-top: 2px !important;
            padding-bottom: 2px !important;
        }
    }
}

html.theme--light .consoleTableRow.default + .consoleTableRow .v-col {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
