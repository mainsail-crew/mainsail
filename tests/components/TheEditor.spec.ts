// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import Vue from 'vue'

vi.mock('@/components/mixins/base', () => ({ default: Vue }))
vi.mock('@/components/dialogs/DevicesDialog.vue', () => ({ default: Vue }))
vi.mock('@/components/ui/Panel.vue', () => ({ default: Vue }))
vi.mock('@/components/inputs/CodemirrorAsync', () => ({ default: Vue }))

import TheEditor from '@/components/TheEditor.vue'

type EditorInstance = {
    markdownEditing: boolean
    readonly isMarkdown: boolean
    readonly markdownPreview: boolean
    readonly sourceUrl: string
    readonly restartServiceName: string | null
    sourcecode: string
    save: () => void
}

function isEditorInstance(value: object): value is EditorInstance {
    return (
        'markdownEditing' in value &&
        typeof value.markdownEditing === 'boolean' &&
        'isMarkdown' in value &&
        typeof value.isMarkdown === 'boolean' &&
        'markdownPreview' in value &&
        typeof value.markdownPreview === 'boolean' &&
        'sourceUrl' in value &&
        typeof value.sourceUrl === 'string' &&
        'restartServiceName' in value &&
        (value.restartServiceName === null || typeof value.restartServiceName === 'string') &&
        'sourcecode' in value &&
        typeof value.sourcecode === 'string' &&
        'save' in value &&
        typeof value.save === 'function'
    )
}

function createEditor(filename = 'notes.md', permissions = 'rw') {
    const dispatch = vi.fn()
    const state = Vue.observable({
        editor: { filename, permissions, fileroot: 'config', filepath: '', sourcecode: '# Notes', bool: true },
        gui: { editor: {} },
        server: {},
    })
    const editor: object = new TheEditor({
        beforeCreate() {
            Object.defineProperty(this, '$store', {
                value: { state, getters: { 'socket/getUrl': 'http://printer.local' }, dispatch },
            })
        },
    })
    if (!isEditorInstance(editor)) throw new Error('Unexpected editor component instance')
    return { editor, state, dispatch }
}

describe('TheEditor Markdown modes', () => {
    it('opens Markdown in preview mode, including uppercase extensions', () => {
        const { editor } = createEditor('NOTES.MD')
        expect(editor.isMarkdown).toBe(true)
        expect(editor.markdownPreview).toBe(true)
        expect(editor.markdownEditing).toBe(false)
    })

    it('switches to editing and back without changing the source', () => {
        const { editor, dispatch } = createEditor()
        editor.markdownEditing = true
        expect(editor.markdownPreview).toBe(false)
        editor.sourcecode = '# Updated'
        expect(dispatch).toHaveBeenCalledWith('editor/updateSourcecode', '# Updated')
        dispatch.mockClear()
        editor.markdownEditing = false
        expect(editor.markdownPreview).toBe(true)
        expect(dispatch).not.toHaveBeenCalled()
    })

    it('resets to preview when reopening a file or changing files', async () => {
        const { editor, state } = createEditor()
        editor.markdownEditing = true
        state.editor.bool = false
        await Vue.nextTick()
        expect(editor.markdownPreview).toBe(true)
        state.editor.bool = true
        await Vue.nextTick()
        editor.markdownEditing = true
        state.editor.filename = 'more-notes.md'
        await Vue.nextTick()
        expect(editor.markdownPreview).toBe(true)
    })

    it('keeps non-Markdown files in the existing editor', () => {
        const { editor } = createEditor('printer.cfg')
        expect(editor.isMarkdown).toBe(false)
        expect(editor.markdownPreview).toBe(false)
        expect(editor.restartServiceName).toBe('klipper')
    })

    it('keeps read-only Markdown in preview and does not allow saving', () => {
        const { editor, dispatch } = createEditor('notes.md', 'r')
        editor.markdownEditing = true
        expect(editor.markdownPreview).toBe(true)
        editor.save()
        expect(dispatch).not.toHaveBeenCalled()
    })

    it('saves Markdown using the existing file upload without restarting a service', () => {
        const { editor, dispatch } = createEditor()
        expect(editor.restartServiceName).toBeNull()
        editor.save()
        expect(dispatch).toHaveBeenCalledWith('editor/saveFile', {
            content: '# Notes',
            restartServiceName: null,
        })
    })

    it('escapes paths used to resolve preview links', () => {
        const { editor, state } = createEditor('printer notes.md')
        state.editor.filepath = 'my notes'
        expect(editor.sourceUrl).toBe('http://printer.local/server/files/config/my%20notes/printer%20notes.md')
    })
})
