import {EditorView} from '@codemirror/view'
import {Extension} from '@codemirror/state'
import {HighlightStyle, tags as t} from '@codemirror/highlight'

const ui = {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
}

export const mainsailEditor = EditorView.theme({
    '&': {
        color: '#d4d4d4',
        backgroundColor: ui.background
    },

    '.cm-activeLine.cm-line': {
        caretColor: '#d4d4d4 !important'
    },

    '.cm-gutters': {
        backgroundColor: ui.background,
        color: '#858585',
        border: 'none'
    },

    '.cm-activeLine': {
        background: 'rgba(43,47,61,0.5)'
    },

    '.cm-activeLineGutter': {
        color: '#c6c6c6',
        backgroundColor: 'rgba(33, 36, 49, 0.5)'
    },

    '.cm-selectionMatch': {
        backgroundColor: '#add6ff26',
    },

}, {dark: true})

export const mainsailHighlightStyle = HighlightStyle.define([
    {tag: t.number,
        color: '#b5cea8'},
    {tag: [t.meta],
        color: '#d4d4d4'},
    {tag: [t.comment],
        color: '#6a9955'},
    {tag: t.atom,
        color: '#9cdcfe' },
    {tag: t.string,
        color: '#4ec9b0' },
    {tag: t.namespace,
        color: '#569cd6', fontWeight: 'bold' },
    {tag: t.className,
        color: '#c586c0' },
    {tag: t.name,
        color: '#e40', fontWeight: 'bold' },
    {tag: t.propertyName,
        color: '#e56735' },
])

/// Extension to enable the Mox theme (both the editor theme and
/// the highlight style).
export const mainsailTheme: Extension = [mainsailEditor, mainsailHighlightStyle]