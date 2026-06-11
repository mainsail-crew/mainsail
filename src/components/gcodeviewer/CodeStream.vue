<template>
    <div ref="view" class="codeview" @mouseup="mouseUp" @keydown="keyPress"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'

const props = defineProps<{
    currentline?: number
    document?: string
    isSimulating?: boolean
    shown?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:currentline', value: number): void
    (e: 'got-focus'): void
}>()

const view = ref<HTMLElement | null>(null)

let editorView: EditorView | undefined = undefined

onMounted(() => {
    editorView = new EditorView({
        doc: props.document ?? '',
        extensions: [basicSetup, EditorState.readOnly.of(true)],
        parent: view.value!,
    })
})

function mouseUp() {
    if (editorView) {
        const line = editorView.state.doc.lineAt(editorView.state.selection.ranges[0].from)
        emit('update:currentline', line.to)
        editorView.contentDOM.blur()
        emit('got-focus')
    }
}

function keyPress() {
    if (editorView) {
        const line = editorView.state.doc.lineAt(editorView.state.selection.ranges[0].from)
        emit('update:currentline', line.to)
        emit('got-focus')
    }
}

watch(() => props.document, () => {
    if (editorView && props.shown) {
        editorView.dispatch({
            changes: {
                from: 0,
                to: editorView.state.doc.length,
                insert: props.document ?? '',
            },
        })
    }
})

watch(() => props.currentline, (to: number) => {
    if (editorView && props.shown) {
        const line = editorView.state.doc.lineAt(to)
        editorView.dispatch({
            selection: {
                anchor: line.from,
                head: line.from,
            },
            scrollIntoView: true,
        })
    }
})
</script>

<style scoped>
:deep(.cm-activeLine) {
    background-color: #333 !important;
}

.codeview {
    height: 100%;
    overflow: auto;
}
</style>
