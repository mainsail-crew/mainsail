// Lezer-based languages for the CodeMirror editor (replaces the old
// StreamParser implementations).
//
//   klipperConfig()  ->  config structure; *_gcode:/enable: blocks are reparsed
//                        as jinja(base: gcode) via parseMixed
//   gcode()          ->  plain Klipper G-code (.gcode files)
//
// Grammars live in *.grammar and are precompiled to *.parser.ts by
// `npm run build:grammars` (scripts/build-grammars.mjs).
import { LRLanguage, LanguageSupport } from '@codemirror/language'
import { styleTags, tags as t } from '@lezer/highlight'
import { parseMixed } from '@lezer/common'
import { parser as gcodeParserRaw } from './gcode.parser'
import { parser as jinjaParserRaw } from './jinja.parser'
import { parser as klipperConfigParserRaw } from './klipperConfig.parser'

const gcodeParser = gcodeParserRaw.configure({
    props: [
        styleTags({
            Command: t.keyword,
            Message: t.string,
            AxisWord: t.className,
            FeedWord: t.string,
            ParamWord: t.atom,
            Number: t.number,
            String: t.string,
            MacroName: t.variableName,
            Operator: t.operator,
            LineComment: t.lineComment,
        }),
    ],
})

const jinjaParser = jinjaParserRaw.configure({
    props: [
        styleTags({
            Keyword: t.controlKeyword,
            FilterName: t.function(t.variableName),
            Pipe: t.operator,
            Boolean: t.bool,
            StringLiteral: t.string,
            Number: t.number,
            VariableName: t.propertyName,
            Operator: t.operator,
            Comment: t.blockComment,
            LineComment: t.lineComment,
            'InterpolationStart InterpolationEnd StatementStart StatementEnd': t.tagName,
        }),
    ],
    // overlay the gcode parser on the literal Text fragments between jinja tags
    wrap: parseMixed((node) => (node.type.isTop ? { parser: gcodeParser, overlay: (n) => n.name === 'Text' } : null)),
})

const klipperConfigParser = klipperConfigParserRaw.configure({
    props: [
        styleTags({
            SectionType: t.namespace,
            SectionName: t.className,
            PropertyName: t.propertyName,
            GcodeKey: t.propertyName,
            Number: t.number,
            StringValue: t.string,
            Operator: t.operator,
            Comment: t.lineComment,
            '[ ]': t.squareBracket,
        }),
    ],
    // reparse *_gcode:/enable: bodies as jinja(base: gcode)
    wrap: parseMixed((node) => (node.name === 'GcodeBody' ? { parser: jinjaParser } : null)),
})

export const gcodeLanguage = LRLanguage.define({
    name: 'gcode',
    parser: gcodeParser,
    languageData: { commentTokens: { line: ';' } },
})

export const klipperConfigLanguage = LRLanguage.define({
    name: 'klipper-config',
    parser: klipperConfigParser,
    languageData: { commentTokens: { line: '#' } },
})

export function gcode() {
    return new LanguageSupport(gcodeLanguage)
}

export function klipperConfig() {
    return new LanguageSupport(klipperConfigLanguage)
}
