import { syntaxTree } from '@codemirror/language'
import type { EditorState, Extension, Range } from '@codemirror/state'
import { RangeSet, StateField } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { Decoration, EditorView, WidgetType } from '@codemirror/view'

class LinkWidget extends WidgetType {
    readonly linkName
    readonly url

    constructor(linkName: string, url: string) {
        super()
        this.linkName = linkName
        this.url = url
    }

    eq(LinkWidget: LinkWidget) {
        return LinkWidget.url === this.url
    }
    toDOM() {
        let container = document.createElement('a')
        container.innerHTML = this.linkName
        container.setAttribute('href', this.url)
        container.setAttribute('target', '_blank')
        container.setAttribute('rel', 'noopener noreferrer')
        container.setAttribute('style', 'color:Tomato;text-decoration: none;')
        return container
    }
}

export const linkWidgets = (): Extension => {
    const linkWidgetDecoration = (linkName: string, url: string) =>
        Decoration.widget({
            widget: new LinkWidget(linkName, url),
            side: -1,
            block: true,
        })

    const decorate = (state: EditorState) => {
        const widgets: Range<Decoration>[] = []
        widgets.push(
            linkWidgetDecoration(
                "View 'mcu' documentation",
                'https://www.klipper3d.org/Config_Reference.html#mcu'
            ).range(state.doc.lineAt(245).from)
        )
        widgets.push(
            linkWidgetDecoration(
                "View 'printer' documentation",
                'https://www.klipper3d.org/Config_Reference.html#printer'
            ).range(state.doc.lineAt(300).from)
        )
        return widgets.length > 0 ? RangeSet.of(widgets) : Decoration.none
    }

    const linkWidgetsField = StateField.define<DecorationSet>({
        create(state) {
            return decorate(state)
        },
        update(images, transaction) {
            if (transaction.docChanged) return decorate(transaction.state)
            return images.map(transaction.changes)
        },
        provide(field) {
            return EditorView.decorations.from(field)
        },
    })

    return [linkWidgetsField]
}