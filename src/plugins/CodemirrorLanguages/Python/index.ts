import { parser } from './testPython.js'
import { LRLanguage, LanguageSupport } from '@codemirror/language'

export const testPython = LRLanguage.define({
    parser: parser,
    languageData: {
        commentTokens: { line: '#' },
    },
})

export function python() {
    return new LanguageSupport(testPython)
}

/* 
to generate the parser run:
npx @lezer/generator testPython.grammar -o testPython.js
 */
