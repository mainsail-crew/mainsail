import { parser } from '../parser/klipperConfigParser.js'
import { LRLanguage, LanguageSupport, StreamLanguage, foldNodeProp } from '@codemirror/language'
import { parseMixed } from '@lezer/common'
import { klipper_config } from '../../../StreamParserKlipperConfig'
import { klipperConfigCompletionSource } from './complete.js'

const jinja2Parser = StreamLanguage.define(klipper_config).parser

export const klipperConfigLang = LRLanguage.define({
    parser: parser.configure({
        props: [
            foldNodeProp.add({
                ConfigBlock(tree) {
                    let body = tree.lastChild
                    if (body == null) return null
                    let lastOption = body.lastChild
                    if (lastOption == null) return null
                    while (lastOption.name == 'Comment') {
                        lastOption = lastOption.prevSibling
                        if (lastOption == null) return null
                    }
                    return { from: body.from - 1, to: lastOption.to - 1 }
                },
            }),
        ],
        wrap: parseMixed((node) => {
            return node.name == 'Jinja2' ? { parser: jinja2Parser } : null
        }),
    }),
    languageData: {
        commentTokens: { line: '#' },
    },
})

export function klipperConfig() {
    return new LanguageSupport(klipperConfigLang, [
        klipperConfigLang.data.of({ autocomplete: klipperConfigCompletionSource }),
    ])
}

/* 
to generate the parser run:
npx @lezer/generator klipperConfig.grammar -o klipperConfigParser.js
 */
