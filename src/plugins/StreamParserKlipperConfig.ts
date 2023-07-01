import { StreamParser, StringStream } from '@codemirror/language'
import { gcode } from '@/plugins/StreamParserGcode'

export const klipper_config: StreamParser<any> = {
    token: function (stream: StringStream, state: StreamParserKlipperConfigState): string | null {
        /* see https://tedboy.github.io/jinja2/off_doc.templates.html */
        const operators = [
            '\\+',
            '-',
            '\\/\\/',
            '\\/',
            '%',
            '\\*\\*',
            '\\*',
            '\\(',
            '\\)',
            '==',
            '!=',
            '>=',
            '>',
            '<=',
            '<',
            '=',
            '\\|',
            '~',
            ',',
        ]
        const reOperator = new RegExp('^' + operators.join('|'))

        const keywords = [
            'elif',
            'else',
            'endif',
            'if',
            'endfor',
            'for',
            'loop\\.index',
            'loop\\.revindex',
            'loop\\.first',
            'loop\\.last',
            'loop\\.length',
            'loop\\.cycle',
            'loop\\.depth',
            'and',
            'or',
            'not',
            'in',
            'is',
            'endmacro',
            'macro',
            'endcall',
            'call',
            'endfilter',
            'filter',
            'endset',
            'set',
            'extends',
            'block',
            'endblock',
            'include',
            'import',
            'do',
        ]
        const filters = [
            'abs',
            'attr',
            'batch',
            'capitalize',
            'center',
            'default',
            'dictsort',
            'escape',
            'filesizeformat',
            'first',
            'float',
            'forceescape',
            'format',
            'groupby',
            'indent',
            'int',
            'join',
            'last',
            'length',
            'list',
            'lower',
            'map',
            'max',
            'min',
            'pprint',
            'random',
            'reject',
            'rejectattr',
            'replace',
            'reverse',
            'round',
            'tojson',
            'safe',
            'select',
            'selectattr',
            'slice',
            'sort',
            'string',
            'striptags',
            'sum',
            'title',
            'trim',
            'truncate',
            'unique',
            'upper',
            'urlencode',
            'urlize',
            'wordcount',
            'wordwrap',
            'xmlattr',
        ]
        const tests = [
            'callable',
            'defined',
            'divisibleby',
            'equalto',
            'escaped',
            'even',
            'iterable',
            'lower',
            'mapping',
            'none',
            'number',
            'odd',
            'sameas',
            'sequence',
            'string',
            'undefined',
            'upper',
        ]
        const globalFns = ['range', 'lipsum', 'dict', 'cycler', 'joiner']
        const cyclerMethods = ['\\.reset\\(\\)', '\\.next\\(\\)']
        const reKeyword = new RegExp('^' + keywords.join('\\s+|') + '|' + cyclerMethods.join('|') + '\\s+')
        const reUpdateOps = new RegExp(
            '^' + filters.join('|') + '|' + tests.join('|') + '|' + globalFns.join('|') + '\\s+'
        )

        function jinja2Element(stream: StringStream): string {
            const pctMatch: any = stream.match(/^%}/)
            const braceMatch: any = stream.match(/^}/)
            function notJinja(): boolean {
                return state.klipperMacroJinjaBraceStack.length === 0 && state.klipperMacroJinjaPctStack.length === 0
            }

            if (pctMatch || braceMatch) {
                if (pctMatch) {
                    state.klipperMacroJinjaPctStack.pop()
                    if (notJinja()) {
                        state.klipperMacroJinja = false
                    }
                } else {
                    // brace match
                    state.klipperMacroJinjaBraceStack.pop()
                    if (notJinja()) {
                        state.klipperMacroJinja = false
                    }
                }
                stream.eatSpace()
                state.gcodeZeroPos = stream.pos
                return 'tag'
            }
            // https://www.metaltoad.com/blog/regex-quoted-string-escapable-quotes
            if (stream.match(/^((?<![\\])['"])((?:.(?!(?<![\\])\1))*.?)\1/)) {
                state.klipperMacroJinjaHighlightNext = true
                return 'string'
            }
            if (stream.eol() && stream.match(/^"/)) {
                state.klipperMacroJinjaHighlightNext = false
                return 'string'
            }
            if (state.klipperMacroJinjaHighlightNext) {
                if (stream.match(reKeyword)) {
                    state.klipperMacroJinjaHighlightNext = false
                    return 'keyword'
                }
            }
            if (state.klipperMacroJinjaHighlightNext) {
                if (stream.match(reUpdateOps)) {
                    // check character after "updateOp" element -- might not be a "("
                    if (['(', '}', ',', '|', ' '].includes(stream.peek() ?? '')) {
                        state.klipperMacroJinjaHighlightNext = false
                        return 'updateOperator'
                    }
                }
            }
            if (stream.match(reOperator)) {
                state.klipperMacroJinjaHighlightNext = true
                return 'number'
            }
            if (stream.match(/^true\s|false\s/i)) {
                state.klipperMacroJinjaHighlightNext = false
                return 'atom'
            }
            if (stream.match(/^[-+]?[0-9]*\.?[0-9]+/)) {
                state.klipperMacroJinjaHighlightNext = false
                return 'number'
            }
            if (stream.eatSpace()) {
                state.klipperMacroJinjaHighlightNext = true
                return 'propertyName'
            }
            stream.next()

            state.klipperMacroJinjaHighlightNext = false
            return 'propertyName'
        }

        const ch = stream.peek()
        /* comments */
        if (
            stream.match(/^\s+[#;]/) ||
            ([';', '#'].includes(ch ?? '') && (stream.pos === 0 || /\s/.test(stream.string.charAt(stream.pos - 1))))
        ) {
            stream.skipToEnd()
            state.block = false
            state.pair = false
            return 'comment'
        }

        if (ch !== '[' && stream.indentation() === 0 && stream.sol() && stream.match(/^[^:]+$/i)) {
            stream.skipToEnd()
            return null
        }

        if (stream.indentation() === 0) {
            if (stream.pos === 0 && ch === '[') {
                state.block = true
                stream.next()
                return null
            }
            if (state.block) {
                if (!ch || ch === ']' || stream.eol()) {
                    stream.next()
                    state.block = false
                    return null
                }
                if (stream.match(/^\s[^\]]+/)) {
                    return 'className'
                }
                if (stream.match(/^[^ \]]+/)) {
                    return 'namespace'
                }
            }
            if (state.gcode) {
                if (stream.sol() || stream.eol()) {
                    state.gcode = false
                    state.gcodeZeroPos = null
                    return null
                }

                if (!state.gcodeZeroPos) {
                    stream.eatSpace()
                    state.gcodeZeroPos = stream.pos
                }
                if (stream.match(/^\s*{[%#]?/)) {
                    state.klipperMacroJinja = true
                    if (stream.string.includes('{%')) {
                        state.klipperMacroJinjaPctStack.push('{%')
                    } else {
                        state.klipperMacroJinjaBraceStack.push('{')
                    }
                    return 'tag'
                }
                if (state.klipperMacroJinja) {
                    return jinja2Element(stream)
                }
                return gcode.token(stream, state, state.gcodeZeroPos ?? 0)
            }
        } else {
            // stream.indentation > 0
            state.was = true
            if (state.gcode) {
                if (stream.sol()) {
                    stream.eatSpace()
                    state.gcodeZeroPos = stream.pos
                }
                if (stream.match(/^\s*{[%#]?/)) {
                    state.klipperMacroJinja = true
                    if (stream.string.includes('{%')) {
                        state.klipperMacroJinjaPctStack.push('{%')
                    } else {
                        state.klipperMacroJinjaBraceStack.push('{')
                    }
                    return 'tag'
                }
                if (state.klipperMacroJinja) {
                    return jinja2Element(stream)
                }
                return gcode.token(stream, state, state.gcodeZeroPos ?? stream.pos)
            } else if (state.pair) {
                stream.eatSpace()
                if (ch !== ',') {
                    if (stream.match(/^-?\d*\.?(?:\d+)?($|,)/)) {
                        return 'number'
                    }
                    if (stream.match(/^[^#]+/)) {
                        return 'string'
                    }
                }
                stream.next()
                return null
            }
        }
        if (state.was && stream.indentation() === 0) {
            state.pair = false
            state.gcode = false
            state.was = false
        }

        if (!state.pair && !state.gcode && stream.sol()) {
            if (stream.match(/^(?:[A-Za-z]*_?gcode|enable):/)) {
                state.gcode = true
            } else {
                stream.match(/^.+?:\s*/)
                state.pair = !stream.eol()
            }

            return 'atom'
        }

        if (state.pair) {
            if (ch === ':') {
                stream.next()
                stream.eatSpace()
                return null
            }

            if (!ch || stream.eol()) {
                state.pair = false
                return null
            }
            if (stream.match(/^(-?\d*\.?(?:\d+)?(,|$|\s))+/)) {
                state.pair = false
                return 'number'
            }
            if (stream.match(/^[^#]+/)) {
                state.pair = false
                return 'string'
            }
        }

        stream.next()
        return null
    },
    startState: function (): StreamParserKlipperConfigState {
        return {
            block: false,
            pair: false,
            was: false,
            gcode: false,
            klipperMacro: false,
            gcodeZeroPos: null,
            klipperMacroJinja: false,
            klipperMacroJinjaHighlightNext: false,
            klipperMacroJinjaBraceStack: [],
            klipperMacroJinjaPctStack: [],
        }
    },
    languageData: {
        commentTokens: { line: '#' },
    },
}

interface StreamParserKlipperConfigState {
    block: boolean
    pair: boolean
    was: boolean
    gcode: boolean
    gcodeZeroPos: number | null
    klipperMacro: boolean
    klipperMacroJinja: boolean
    klipperMacroJinjaHighlightNext: boolean // Highlight next element if no space follows curent keyword
    klipperMacroJinjaBraceStack: string[] // Should these two stacks be combined for overhead / aesthetics?
    klipperMacroJinjaPctStack: string[]
}
