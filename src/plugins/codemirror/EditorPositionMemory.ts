import { EditorSelection, StateEffect } from '@codemirror/state'
import { EditorView, ViewPlugin } from '@codemirror/view'

interface EditorPosition {
    selection: EditorSelection
    scroll: ReturnType<EditorView['scrollSnapshot']>
}

export class EditorPositionMemory {
    private positions = new Map<string, EditorPosition>()

    restore(view: EditorView, key: string): void {
        const position = this.positions.get(key)
        const remember = () => {
            const scroll = view.scrollDOM.clientHeight
                ? view.scrollSnapshot()
                : (this.positions.get(key)?.scroll ?? view.scrollSnapshot())
            this.positions.set(key, { selection: view.state.selection, scroll })
        }

        view.dispatch({
            selection: position
                ? EditorSelection.create(
                      position.selection.ranges.map((range) =>
                          EditorSelection.range(
                              Math.min(range.anchor, view.state.doc.length),
                              Math.min(range.head, view.state.doc.length)
                          )
                      ),
                      position.selection.mainIndex
                  )
                : undefined,
            effects: [
                StateEffect.appendConfig.of(
                    ViewPlugin.define(() => ({ destroy: remember }), {
                        eventHandlers: {
                            scroll: () => {
                                view.requestMeasure({ read: remember })
                            },
                        },
                    })
                ),
                ...(position ? [position.scroll] : []),
            ],
        })
    }
}
