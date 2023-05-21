import { parser } from '../parser/klipperConfigParser.js'
import {
    LRLanguage,
    LanguageSupport,
    StreamLanguage,
    foldNodeProp,
    continuedIndent,
    indentNodeProp,
} from '@codemirror/language'
import { parseMixed } from '@lezer/common'
import { klipper_config } from '../../../StreamParserKlipperConfig'
import { klipperConfigCompletionSource } from './complete.js'

const jinja2Parser = StreamLanguage.define(klipper_config).parser

export const klipperConfigLang = LRLanguage.define({
    parser: parser.configure({
        props: [
            indentNodeProp.add({
                GcodeKeyword: continuedIndent(),
                Jinja2: continuedIndent(),
                Parameter: () => null,
            }),
            foldNodeProp.add({
                ConfigBlock(tree) {
                    let node = tree.firstChild
                    if (node == null) return null
                    while (node.type.name != 'Body') {
                        node = node.nextSibling
                        if (node == null) return null
                    }
                    return { from: node.from - 1, to: tree.to - 2 }
                },
            }),
        ],
        wrap: parseMixed((node) => {
            return node.name == 'Jinja2' ? { parser: jinja2Parser } : null
        }),
    }),
    languageData: {
        commentTokens: { line: '#' },
        indentOnInput: /^\s*(gcode:)$/,
    },
})

export function klipperConfig() {
    return new LanguageSupport(klipperConfigLang, [
        klipperConfigLang.data.of({ autocomplete: klipperConfigCompletionSource }),
    ])
}

/* 
to generate the parser run:
npx @lezer/generator klipperConfig.grammar -o klipperConfigLang.js
 */
