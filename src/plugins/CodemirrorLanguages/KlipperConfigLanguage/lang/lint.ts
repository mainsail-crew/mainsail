import { syntaxTree } from '@codemirror/language'
import { linter, Diagnostic } from '@codemirror/lint'

export const klipperConfigLint = linter((view) => {
    const diagnostics: Diagnostic[] = []
    syntaxTree(view.state)
        .cursor()
        .iterate((node) => {
            if (node.type.isError) {
                diagnostics.push({
                    from: node.from,
                    to: node.to,
                    severity: 'error',
                    message: 'Parse error: ' + JSON.stringify(view.state.sliceDoc(node.from, node.to)),
                })
            }
        })
    return diagnostics
})
