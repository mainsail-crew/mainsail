import { EditorView, hoverTooltip } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import i18n from '@/plugins/i18n'

const klipperDocsBaseTheme = EditorView.baseTheme({
    // reset the hover host wrapper so only our card is visible
    '.cm-tooltip:has(.cm-tooltip-klipper-docs)': {
        border: 'none',
        backgroundColor: 'transparent',
    },
    '.cm-tooltip-klipper-docs': {
        padding: '5px 12px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        lineHeight: '1.4',
        whiteSpace: 'nowrap',
        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.3)',
    },
    '&light .cm-tooltip-klipper-docs': {
        backgroundColor: '#ffffff',
        color: '#1e1e1e',
    },
    '&dark .cm-tooltip-klipper-docs': {
        backgroundColor: '#2b2b2f',
        color: '#e6e6e6',
    },
    '.cm-tooltip-klipper-docs a': {
        color: 'var(--v-primary-base, #1976d2)',
        textDecoration: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    '.cm-tooltip-klipper-docs a:hover': {
        textDecoration: 'underline',
    },
    // recolor the arrow to match the card (instead of the default tooltip border)
    '.cm-tooltip:has(.cm-tooltip-klipper-docs) .cm-tooltip-arrow:before': {
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    '&light .cm-tooltip:has(.cm-tooltip-klipper-docs) .cm-tooltip-arrow:after': {
        borderTopColor: '#ffffff',
    },
    '&dark .cm-tooltip:has(.cm-tooltip-klipper-docs) .cm-tooltip-arrow:after': {
        borderTopColor: '#2b2b2f',
    },
})

/**
 * @link https://codemirror.net/examples/tooltip/
 */
export function KlipperDocsTooltip(baseUrl: string) {
    const klipperDocsHoverTooltip = hoverTooltip((view, pos) => {
        const { from, to, text } = view.state.doc.lineAt(pos)

        let start = pos,
            end = pos

        while (start > from && text[start - from - 1] !== '[') start--
        while (end < to && text[end - from] !== ']') end++

        if (text[start - from - 1] !== '[' || text[end - from] !== ']') return null

        const content: string = text.slice(start - from, end - from).trim()
        // we need only the first word in [] because this is the Klipper module
        const word = content.match(/^\S+/)?.[0] ?? ''
        if (!word) return null
        const wordStart = text.indexOf(word, start - from) + from
        const wordEnd = wordStart + word.length

        // only show the tooltip when hovering over the first word (the Klipper module)
        if (pos < wordStart || pos > wordEnd) return null

        return {
            pos: wordStart,
            end: wordEnd,
            above: true,
            arrow: true,
            create() {
                const escapedWord = word
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                const url = `${baseUrl}#${escapedWord}`
                const div = document.createElement('div')
                div.className = 'cm-tooltip-klipper-docs'

                div.innerHTML = i18n
                    .t('Editor.ViewModuleDocumentation', {
                        module: `<a href="${url}" rel="noopener" target="_blank">${escapedWord}</a>`,
                    })
                    .toString()

                return { dom: div }
            },
        }
    })

    return [klipperDocsHoverTooltip, Prec.highest(klipperDocsBaseTheme)]
}
