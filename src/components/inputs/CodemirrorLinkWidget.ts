import {ViewUpdate, ViewPlugin, DecorationSet} from "@codemirror/view"
import { Decoration, EditorView, WidgetType } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'


class LinkWidget extends WidgetType {
    constructor(readonly linkName: string, readonly url: string) { super() }
    eq(other: LinkWidget) { return false }
    toDOM() {
        let wrap = document.createElement("a")
        wrap.innerHTML = this.linkName
        wrap.setAttribute("href", this.url)
        return wrap
    }
    ignoreEvent() { return false }
}

function CreateLinkWidgetDecoration(view: EditorView) {
    const LinkBlockWidget = (linkName: string, url: string) => Decoration.widget({
        widget: new LinkWidget(linkName, url),
        side: -1,
        block: false,
    })

    let widgets = []
    let deco = LinkBlockWidget("test", "https://google.com")
    let pos = view.state.doc.lineAt(23).from

    /* console.log(pos)
    const co = syntaxTree(view.state).resolve(pos);
    console.log(co)
    console.log(view.state.sliceDoc(co.from, co.to))
    console.log(view.state.getTokenAt(pos)) */


    widgets.push(deco.range(pos))
    return Decoration.set(widgets)
}

export const LingWidgetPlugin = ViewPlugin.fromClass(class {
        decorations: DecorationSet
        constructor(view: EditorView) {
            this.decorations = CreateLinkWidgetDecoration(view)
        }
        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged)
            this.decorations = CreateLinkWidgetDecoration(update.view)
        }
    }, {
        decorations: v => v.decorations,
    }
)

