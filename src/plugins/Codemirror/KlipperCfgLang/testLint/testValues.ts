import { LintTest, createEditorView } from '../../mochaFileTests.js'

export const valueTests: LintTest[] = []

valueTests.push({
    name: 'very simple config with no errors',
    input: createEditorView(`
        [mcu]
        Serial: /dev/ttyAMA0`),
    expected: [],
})
