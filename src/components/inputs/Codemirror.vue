<template>
    <div class="vue-codemirror">
        <div ref="editor" v-observe-visibility="visibilityChanged"></div>
    </div>
</template>

<script setup lang="ts">
// Inspired by this repo: https://github.com/surmon-china/vue-codemirror

import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useTheme } from '@/composables/useTheme'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { StreamLanguage } from '@codemirror/language'
import { klipper_config } from '@/plugins/StreamParserKlipperConfig'
import { gcode } from '@/plugins/StreamParserGcode'
import { insertTab, indentLess } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { indentUnit } from '@codemirror/language'

const props = defineProps<{
    code?: string
    value?: string
    name?: string
    fileExtension?: string
}>()

const emit = defineEmits<{
    (e: 'ready', cm: EditorView): void
    (e: 'lineChange', line: number): void
    (e: 'input', content: string): void
}>()

const store = useStore()
useBase()
const { themeMode } = useTheme()

const editor = ref<HTMLElement | null>(null)

let content = ''
let codemirror: null | EditorView = null
let cminstance: null | EditorView = null

watch(() => props.value, (newVal) => {
    const cm_value = cminstance?.state?.doc.toString()
    if (newVal !== cm_value) {
        setCmValue(newVal ?? '')
    }
})

onMounted(() => {
    initialize()
})

onBeforeUnmount(() => {
    destroy()
})

function destroy() {
    cminstance?.destroy()
}

function initialize() {
    codemirror = new EditorView({
        parent: editor.value!,
    })
    cminstance = codemirror

    nextTick(() => {
        setCmValue(props.code || props.value || content || '')

        emit('ready', codemirror)
    })
}

function setCmValue(content: string) {
    cminstance?.setState(EditorState.create({ doc: content, extensions: cmExtensions }))
}

const cmExtensions = computed(() => {
    const extensions = [
        EditorView.theme({}, { dark: themeMode.value === 'dark' }),
        basicSetup,
        vscodeTheme.value,
        indentUnit.of(' '.repeat(tabSize.value)),
        keymap.of([
            { key: 'Tab', run: insertTab },
            { key: 'Shift-Tab', run: indentLess },
        ]),
        EditorView.updateListener.of((update) => {
            if (update.selectionSet) {
                const line = cminstance?.state?.doc.lineAt(cminstance?.state?.selection.main.head).number ?? 0
                emit('lineChange', line)
            }
            content = update.state?.doc.toString()
            if (content) {
                emit('input', content)
            }
        }),
    ]

    const ext = props.fileExtension ?? ''
    if (['cfg', 'conf'].includes(ext)) extensions.push(StreamLanguage.define(klipper_config))
    else if (['gcode'].includes(ext)) extensions.push(StreamLanguage.define(gcode))
    else if (['json'].includes(ext)) extensions.push(json())
    else if (['css', 'scss', 'sass'].includes(ext)) extensions.push(css())

    return extensions
})

function visibilityChanged(isVisible: boolean) {
    if (isVisible) cminstance?.focus()
}

const tabSize = computed(() => store.state.gui.editor?.tabSize || 2)

const vscodeTheme = computed(() => (themeMode.value === 'dark' ? vscodeDark : vscodeLight))

function gotoLine(line: number) {
    const l = cminstance?.state?.doc.line(line)
    if (!l) return

    cminstance?.dispatch({
        selection: { head: l.from, anchor: l.to },
        scrollIntoView: true,
    })
}
</script>
