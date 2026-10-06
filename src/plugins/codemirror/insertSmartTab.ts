import { countColumn, EditorSelection, StateCommand } from '@codemirror/state'
import { indentMore } from '@codemirror/commands'
import { getIndentUnit, indentString } from '@codemirror/language'

export const insertSmartTab: StateCommand = ({ state, dispatch }) => {
    if (state.readOnly) return false

    // use indentMore to move the complete line when something is selected
    if (state.selection.ranges.some((range) => !range.empty)) {
        return indentMore({ state, dispatch })
    }

    // no selection: insert spaces up to the next tab stop at the cursor position
    const changes = state.changeByRange((range) => {
        const line = state.doc.lineAt(range.head)
        const col = countColumn(state.doc.sliceString(line.from, range.head), state.tabSize)
        const unit = getIndentUnit(state)
        const cols = unit - (col % unit)
        const insert = indentString(state, cols)

        return {
            changes: { from: range.head, insert },
            range: EditorSelection.cursor(range.head + insert.length),
        }
    })

    dispatch(
        state.update(changes, {
            scrollIntoView: true,
            userEvent: 'input',
        })
    )

    return true
}
