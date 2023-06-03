import { lintSource } from '../lang/lint.js'
import { valueTests } from './testValues.js'

describe('Variable Types', () => {
    for (let test of valueTests) {
        console.log( lintSource(test.input))
        it(test.name, () => lintSource(test.input) === test.output)
    }
})
