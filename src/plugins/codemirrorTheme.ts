import {EditorView} from "@codemirror/view"
import {Extension} from "@codemirror/state"
import {HighlightStyle, tags as t} from "@codemirror/highlight"

// Using https://github.com/codemirror/CodeMirror/blob/master/theme/moxer.css as reference for the colors

const ui = {
    contrast: '#FFFFFF',
    accent: '#fff017',
    background: '#090A0F',
    foreground: '#8E95B4',
    borders: '#090A0F',
    shade1: '#212431',
    shade2: '#2C303F',
    shade3: '#35394B',
    shade4: '#3F445A',
    shade5: '#555B77',
    shade6: '#6B7394'
}

const base = {
    white: '#ffffff',
    black: '#000000',
    red: '#E75A5A',
    orange: '#E19235',
    yellow: '#FEE17C',
    green: '#A9EFA3',
    cyan: '#70E3EB',
    blue: '#4C71F6',
    paleblue: '#69A7D3',
    purple: '#5654BC',
    brown: '#AB633B',
    pink: '#E382BC',
    violet: '#A18EEF'
}

const chalky = "#e5c07b",
    coral = "#e06c75",
    cyan = "#56b6c2",
    invalid = "#ffffff",
    ivory = "#abb2bf",
    stone = "#7d8799", // Brightened compared to original to increase contrast
    malibu = "#61afef",
    sage = "#98c379",
    whiskey = "#d19a66",
    violet = "#c678dd",
    darkBackground = "#21252b",
    highlightBackground = "#2c313a",
    background = "#282c34",
    selection = "#3E4451",
    cursor = "#528bff"

/// The editor theme styles for moxor.
export const moxerTheme = EditorView.theme({
    "&": {
        color: ui.foreground,
        backgroundColor: ui.background
    },

    ".cm-gutters": {
        backgroundColor: ui.background,
        color: ui.shade3,
        border: "none"
    },

    ".cm-activeLine": {
        background: 'rgba(33, 36, 49, 0.5)'
    },

    ".cm-activeLineGutter": {
        color: base.yellow,
        backgroundColor: 'rgba(33, 36, 49, 0.5)'
    },

    ".cm-guttermarker, .cm-guttermarker-subtle, .cm-linenumber": {
        color: ui.shade3
    },

    ".cm-selectionMatch": {
        backgroundColor: ui.shade1,
        color: base.pink
    },

}, {dark: true})

/// The highlighting style for code in the moxer theme.
export const moxerHighlightStyle = HighlightStyle.define([
    {tag: t.keyword,
        color: base.red},
    {tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
        color: base.violet},
    {tag: [t.function(t.variableName), t.labelName],
        color: base.yellow},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: whiskey},
    {tag: [t.definition(t.name), t.separator],
        color: base.violet},
    {tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
        color: base.orange},
    {tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
        color: base.cyan},
    {tag: [t.meta, t.comment],
        color: ui.shade4},
    {tag: t.strong,
        fontWeight: "bold"},
    {tag: t.emphasis,
        fontStyle: "italic"},
    {tag: t.strikethrough,
        textDecoration: "line-through"},
    {tag: t.link,
        color: '#f00', //ui.shade4,
        textDecoration: "underline"},
    {tag: t.heading,
        fontWeight: "bold",
        color: base.red},
    {tag: [t.atom, t.bool, t.special(t.variableName)],
        color: base.pink },
    {tag: [t.processingInstruction, t.string, t.inserted],
        color: base.green},
    {tag: t.invalid,
        color: ui.foreground},
])

/// Extension to enable the Mox theme (both the editor theme and
/// the highlight style).
export const moxer: Extension = [moxerTheme, moxerHighlightStyle]