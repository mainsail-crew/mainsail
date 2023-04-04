import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { tags as t } from '@lezer/highlight'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'

const ui = {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
}

const mainsailEditor = EditorView.theme(
    {
        '&': {
            color: '#d4d4d4',
            backgroundColor: ui.background,
        },
        '.cm-activeLine.cm-line': {
            caretColor: '#d4d4d4 !important',
        },

        '.cm-gutters': {
            backgroundColor: ui.background,
            color: '#858585',
            border: 'none',
        },

        '.cm-activeLine': {
            background: 'rgba(43,47,61,0.5)',
        },

        '.cm-activeLineGutter': {
            color: '#c6c6c6',
            backgroundColor: 'rgba(33, 36, 49, 0.5)',
        },

        '.cm-selectionMatch': {
            backgroundColor: '#add6ff26',
        },

        '.cm-button': {
            'font-family': 'Roboto,sans-serif',
            'font-weight': '500',
            'font-size': '.675rem',
            'letter-spacing': '0.0892857143em',
            'vertical-align': 'middle',
            padding: '0.3em 1em',
            'border-radius': '4px',
            'border-width': '0',
            color: 'var(--color-primary)',
            'background-color': 'var(--v-secondary-darken2)',
            'background-image': 'none!important',
            'text-transform': 'uppercase',
            'text-indent': '0.0892857143em',
            'text-aling': 'left',
        },

        '.cm-textfield:focus': {
            'border-color': 'var(--color-primary)!important',
        },

        '.cm-textfield:focus-visible': {
            'border-color': 'var(--color-primary)!important',
        },

        '.cm-textfield::placeholder': {
            'text-transform': 'uppercase',
        },
        '.cm-panel.cm-search label': {
            'font-weight': '500',
            'font-family': 'Roboto,sans-serif',
            'letter-spacing': '0.0892857143em',
            'text-transform': 'uppercase',
            'font-size': '12px',
            'white-space': 'pre',
            color: 'var(--v-primary-base)',
        },

        '.cm-panel.cm-search [name=close]': {
            'font-family': 'Roboto,sans-serif',
            'text-transform': 'uppercase',
            'font-size': '200%',
            'white-space': 'pre',
            color: 'var(--color-primary)',
            'padding-right': '5px',
            'padding-top': '5px',
        },

        '.cm-button:hover': {
            'background-color': 'var(--v-secondary-lighten1)',
            'background-image': 'none!important',
            'transition-duration': '0.5s',
            'transition-timing-function': 'cubic-bezier(1.2,0,.2,1)',
        },

        '.cm-textfield': {
            'font-family': 'Roboto,sans-serif',
            'vertical-align': 'middle',
            'font-size': '.675rem',
            border: '1px solid silver',
            backgroundColor: ui.background,
            padding: '.3em .1em',
            'padding-left': '0.6em',
            'border-radius': '0.2em',
        },

        '.cm-panels': {
            'background-color': 'var(--v-toolbar-base)',
        },
    },
    { dark: true }
)

const mainsailHighlightStyle = HighlightStyle.define([
    { tag: t.number, color: '#b5cea8' },
    { tag: [t.meta], color: '#d4d4d4' },
    { tag: [t.comment], color: '#6a9955' },
    { tag: t.atom, color: '#9cdcfe' },
    { tag: t.string, color: '#4ec9b0' },
    { tag: t.namespace, color: '#569cd6', fontWeight: 'bold' },
    { tag: t.className, color: '#c586c0' },
    { tag: t.name, color: '#e40', fontWeight: 'bold' },
    { tag: t.propertyName, color: '#e56735' },
    { tag: t.keyword, color: '#fcbe03' },
    { tag: t.updateOperator, color: '#b525d0' },
    { tag: t.operator, color: '#fc03fc' },
])

/// Extension to enable the Mox theme (both the editor theme and
/// the highlight style).
export const mainsailTheme: Extension = [mainsailEditor, syntaxHighlighting(mainsailHighlightStyle)]
