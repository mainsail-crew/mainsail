import { Decoration, EditorView, MatchDecorator, ViewPlugin } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { includePattern, resolveIncludePath } from './configIncludes'

export function KlipperIncludeLinks(
    open: (path: string) => void,
    title: string,
    directory: string,
    availableFiles: ReadonlySet<string>
) {
    const matcher = new MatchDecorator({
        regexp: includePattern,
        decorate: (add, from, _to, match) => {
            const path = match[1].trim()
            const resolvedPath = resolveIncludePath(directory, path)
            if (!resolvedPath || !availableFiles.has(resolvedPath)) return
            const start = from + match[0].indexOf(match[1]) + match[1].indexOf(path)
            add(
                start,
                start + path.length,
                Decoration.mark({
                    class: 'cm-include-link',
                    attributes: { 'data-include': path, title },
                })
            )
        },
    })
    const link = (event: Event) => (event.target as HTMLElement).closest<HTMLElement>('.cm-include-link')
    return [
        ViewPlugin.define(
            (view) => ({
                decorations: matcher.createDeco(view),
                update(update) {
                    this.decorations = matcher.updateDeco(update, this.decorations)
                },
            }),
            { decorations: (value) => value.decorations }
        ),
        Prec.highest(
            EditorView.domEventHandlers({
                mousedown(event) {
                    if (!link(event) || (!event.ctrlKey && !event.metaKey) || event.shiftKey || event.button !== 0)
                        return false
                    event.preventDefault()
                    return true
                },
                click(event) {
                    const target = link(event)
                    if (!target || (!event.ctrlKey && !event.metaKey) || event.shiftKey || event.button !== 0)
                        return false
                    event.preventDefault()
                    open(target.dataset.include!)
                    return true
                },
            })
        ),
        EditorView.baseTheme({ '.cm-include-link': { textDecoration: 'underline' } }),
    ]
}
