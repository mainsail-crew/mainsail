import { hoverTooltip } from '@codemirror/view'

const DOCUMENTATION_URL_BASE = 'https://www.klipper3d.org/Config_Reference.html'

/**
 * @link https://codemirror.net/examples/tooltip/
 */
export function KlipperDocsTooltipPlugin() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return hoverTooltip((view, pos, _side) => {
        const { from, to, text } = view.state.doc.lineAt(pos)

        let start = pos,
            end = pos

        while (start > from && text[start - from - 1] !== '[') start--
        while (end < to && text[end - from] !== ']') end++

        if (text[start - from - 1] !== '[' || text[end - from] !== ']') {
            return null
        }

        const content = text.slice(start - from, end - from).trim()
        const words = content.split(/\s+/)

        for (const word of words) {
            const wordStart = text.indexOf(word, start - from) + from
            const wordEnd = wordStart + word.length

            if (pos >= wordStart && pos <= wordEnd) {
                return {
                    pos: wordStart,
                    end: wordEnd,
                    above: true,
                    create() {
                        const div = document.createElement('div')

                        Object.assign(div.style, {
                            padding: '3px 10px',
                            borderRadius: '5px',
                            color: "#000",
                            backgroundColor: '#FFF',
                        })

                        div.innerHTML = `\
                        View<a style="text-decoration: none;" href="${DOCUMENTATION_URL_BASE}#${word}" rel="noopener" target="_blank">
                         <strong>${word}</strong>
                        </a>documentation`

                        return { dom: div }
                    },
                }
            }
        }

        return null
    })
}
