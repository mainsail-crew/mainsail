<template>
    <v-textarea
        ref="gcodeCommandField"
        v-model="gcode"
        :items="items"
        :label="$t('Panels.MiniconsolePanel.SendCode')"
        solo
        class="gcode-command-field"
        autocomplete="off"
        no-resize
        auto-grow
        :rows="rows"
        hide-details
        outlined
        dense
        :prepend-icon="isTouchDevice ? mdiChevronDoubleRight : ''"
        :append-icon="mdiSend"
        @keydown.enter.prevent.stop="doSend"
        @keydown.up="onKeyUp"
        @keydown.down="onKeyDown"
        @keydown.tab="onAutocomplete"
        @click:prepend="onAutocomplete"
        @click:append="doSend" />
</template>
<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useConsole } from '@/composables/useConsole'
import { useSocket } from '@/composables/useSocket'
import { mdiSend, mdiChevronDoubleRight } from '@mdi/js'
import { VTextareaType } from '@/store/printer/types'
import { strLongestEqual } from '@/plugins/helpers'

const store = useStore()
const socket = useSocket()
const { isTouchDevice } = useBase()
const { helplist, lastCommands } = useConsole()

const gcodeCommandField = ref<VTextareaType | null>(null)

const gcode = ref('')
const lastCommandNumber = ref<number | null>(null)
const items = ref([])

const rows = computed(() => gcode.value?.split('\n').length ?? 1)

function getCurrentLine(): number {
    const textarea = gcodeCommandField.value!.$refs.input as HTMLTextAreaElement
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart)
    return textBeforeCursor.split('\n').length
}

function setGcode(gcodeVal: string): void {
    gcode.value = gcodeVal

    nextTick(() => {
        gcodeCommandField.value?.focus()
    })
}

function onKeyUp(event: KeyboardEvent): void {
    const currentLine = getCurrentLine()
    if (rows.value > 1 && currentLine > 1) return

    event.preventDefault()
    if (lastCommandNumber.value === null && lastCommands.value.length) {
        lastCommandNumber.value = lastCommands.value.length - 1
        gcode.value = lastCommands.value[lastCommandNumber.value]
    } else if (lastCommandNumber.value && lastCommandNumber.value > 0) {
        lastCommandNumber.value--
        gcode.value = lastCommands.value[lastCommandNumber.value]
    }
}

function onKeyDown(event: KeyboardEvent): void {
    const currentLine = getCurrentLine()
    if (rows.value > currentLine) return

    event.preventDefault()

    if (lastCommandNumber.value === null) return

    if (lastCommandNumber.value < lastCommands.value.length - 1) {
        lastCommandNumber.value++
        gcode.value = lastCommands.value[lastCommandNumber.value]
    } else if (lastCommandNumber.value === lastCommands.value.length - 1) {
        lastCommandNumber.value = null
        gcode.value = ''
    }
}

function doSend(cmd: KeyboardEvent) {
    if (cmd.shiftKey) {
        gcode.value += '\n'
        return
    }

    if (gcode.value === '') return

    store.dispatch('printer/sendGcode', gcode.value)
    store.dispatch('gui/gcodehistory/addToHistory', gcode.value)
    gcode.value = ''
    lastCommandNumber.value = null
}

function onAutocomplete(e: Event): void {
    e.preventDefault()

    if (!gcode.value.length) return

    const textarea = gcodeCommandField.value!.$refs.input as HTMLTextAreaElement
    const currentPosition = textarea.selectionStart
    const beforeCursor = gcode.value.substring(0, currentPosition)
    const lastNewlineIndex = beforeCursor.lastIndexOf('\n')
    const currentLine = beforeCursor.substring(lastNewlineIndex + 1)

    const currentLineUpperCase = currentLine.toUpperCase()
    const commands = helplist.value.filter((element) => element.command.startsWith(currentLineUpperCase))

    if (commands.length === 0) return

    if (commands?.length === 1) {
        updateGcode(commands[0].command, lastNewlineIndex, currentPosition)
        return
    }

    const longestCommon = commands.reduce((acc, val) => {
        return strLongestEqual(acc, val.command)
    }, commands[0].command)

    let output = ''
    commands.forEach(
        (command) => (output += `<a class="command font-weight-bold">${command.command}</a>: ${command.help}<br />`)
    )

    store.dispatch('server/addEvent', { message: output, type: 'autocomplete' })

    updateGcode(longestCommon, lastNewlineIndex, currentPosition)
}

function updateGcode(text: string, start: number, end: number) {
    gcode.value = gcode.value.substring(0, start + 1) + text + gcode.value.substring(end)
}
</script>

<style scoped>
.gcode-command-field {
    font-family: 'Roboto Mono', monospace;
}
</style>
