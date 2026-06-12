<template>
    <v-dialog :value="showDialog" width="400" persistent :fullscreen="isMobile">
        <panel
            :title="headline"
            :icon="mdiInformation"
            card-class="macro_prompt-dialog"
            :margin-bottom="false"
            style="overflow: hidden"
            :height="isMobile ? 0 : 548">
            <template #buttons>
                <v-btn :icon="mdiCloseThick" rounded="0" @click="closePrompt" />
            </template>
            <v-card-text>
                <template v-for="(event, index) in activePromptContent" :key="'prompt_' + index">
                    <macro-prompt-text v-if="event.type === 'text'" :event="event" />
                    <macro-prompt-button-group
                        v-if="event.type === 'button_group'"
                        :group-index="index"
                        :children="event.children ?? []" />
                    <macro-prompt-button-group
                        v-if="event.type === 'button'"
                        :group-index="index"
                        :children="[event]" />
                </template>
            </v-card-text>
            <v-card-actions v-if="footerButtons.length">
                <v-spacer />
                <macro-prompt-footer-button
                    v-for="(button, index) in footerButtons"
                    :key="'prompt_footer_' + index"
                    :event="button" />
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useSocket } from '@/composables/useSocket'
import Panel from '@/components/ui/Panel.vue'

import { mdiCloseThick, mdiInformation } from '@mdi/js'
import type { ServerStateEvent, ServerStateEventPrompt } from '@/store/server/types'
import MacroPromptFooterButton from '@/components/dialogs/MacroPromptFooterButton.vue'
import MacroPromptText from '@/components/dialogs/MacroPromptText.vue'
import MacroPromptButtonGroup from '@/components/dialogs/MacroPromptButtonGroup.vue'

const store = useStore()
const { isMobile } = useBase()
const socket = useSocket()

const internalCloseCommand = ref<number | null>(null)
let checkpointEvent: ServerStateEvent | null = null
let currentPrompt: ServerStateEventPrompt[] = []
const promptMessageExp = /^\/\/ action:prompt_(?<type>[^\s]+) *(?<msg>.*)$/

function processEvents() {
    const events = store.state.server.events
    const promptEvents: ServerStateEventPrompt[] = []

    for (let i = events.length - 1; i >= 0; i--) {
        const event = events[i]
        if (event === checkpointEvent) {
            break
        }

        if (event.type !== 'action' || !event.message?.startsWith('// action:prompt_')) {
            continue
        }

        const match = event.message.match(promptMessageExp)
        const type = match?.groups?.type ?? ''

        if (type === 'end') {
            currentPrompt = []
            break
        }

        const message = (match?.groups?.msg || '').trim()

        promptEvents.unshift({
            date: event.date,
            type,
            message,
        })

        if (type === 'begin') {
            currentPrompt = []
            break
        }
    }

    checkpointEvent = events[events.length - 1]

    if (promptEvents.length > 0) {
        currentPrompt = [...currentPrompt, ...promptEvents]
    }
}

watch(() => store.state.server.events, processEvents, { immediate: true, deep: true })

const macroPromptEvents = computed(() => currentPrompt)

const lastPromptShowPos = computed(() =>
    macroPromptEvents.value.findLastIndex((event: ServerStateEventPrompt) => event.type === 'show')
)

const lastPromptClosePos = computed(() =>
    macroPromptEvents.value.findLastIndex((event: ServerStateEventPrompt) => event.type === 'end')
)

const lastPromptBeginPos = computed(() => {
    if (lastPromptShowPos.value === -1) return -1

    return macroPromptEvents.value.findLastIndex(
        (event: ServerStateEventPrompt) => event.type === 'begin',
        lastPromptShowPos.value
    )
})

const showDialog = computed(() => {
    if (lastPromptBeginPos.value === -1) return false

    const lastBeginEvent = macroPromptEvents.value[lastPromptBeginPos.value] ?? null
    if (
        internalCloseCommand.value !== null &&
        internalCloseCommand.value == (lastBeginEvent?.date?.getTime() ?? null)
    )
        return false

    return lastPromptBeginPos.value > lastPromptClosePos.value && activePromptContent.value.length > 0
})

const activePrompt = computed(() => {
    if (lastPromptShowPos.value === -1) return []

    return macroPromptEvents.value.slice(lastPromptBeginPos.value, lastPromptShowPos.value)
})

const activePromptContent = computed(() => {
    const allowedTypes = ['button', 'text', 'button_group_start', 'button_group_end']

    const output = activePrompt.value.filter((event: ServerStateEventPrompt) => allowedTypes.includes(event.type))

    while (
        output.findIndex((event: ServerStateEventPrompt) => event.type === 'button_group_start') !== -1 &&
        output.findIndex((event: ServerStateEventPrompt) => event.type === 'button_group_end') !== -1
    ) {
        const start = output.findIndex((event: ServerStateEventPrompt) => event.type === 'button_group_start')
        const end = output.findIndex((event: ServerStateEventPrompt) => event.type === 'button_group_end')

        const buttons = output.slice(start + 1, end)

        output[start] = {
            date: buttons[0].date,
            type: 'button_group',
            message: '',
            children: buttons.filter((event: ServerStateEventPrompt) => event.type === 'button'),
        }

        output.splice(start + 1, buttons.length + 1)
    }

    return output
})

const headline = computed(() => {
    if (!showDialog.value || lastPromptBeginPos.value === -1) return ''

    return macroPromptEvents.value[lastPromptBeginPos.value]?.message ?? ''
})

const footerButtons = computed(() => {
    if (!showDialog.value || lastPromptBeginPos.value === -1) return []

    return activePrompt.value.filter((event: ServerStateEventPrompt) => event.type === 'footer_button')
})

function closePrompt() {
    internalCloseCommand.value = macroPromptEvents.value[lastPromptBeginPos.value]?.date?.getTime() ?? null

    const gcode = `RESPOND type="command" msg="action:prompt_end"`
    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode })
}
</script>

<style scoped></style>
