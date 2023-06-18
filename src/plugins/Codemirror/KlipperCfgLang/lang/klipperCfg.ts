import { parser } from '../parser/klipperCfgParser.js'
import { LRLanguage, LanguageSupport, StreamLanguage, foldNodeProp } from '@codemirror/language'
import { parseMixed } from '@lezer/common'
import { klipper_config } from '../../../StreamParserKlipperConfig.js'

const jinja2Parser = StreamLanguage.define(klipper_config).parser

export const klipperCfgLang = LRLanguage.define({
    parser: parser.configure({
        props: [
            foldNodeProp.add({
                ConfigBlock(tree) {
                    const body = tree.lastChild
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

export function klipperCfg() {
    return new LanguageSupport(klipperCfgLang)
}

/* 
to generate the parser run:
npx @lezer/generator klipperCfg.grammar -o klipperCfgParser.js
 */
