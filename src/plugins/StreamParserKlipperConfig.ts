import { StreamLanguage, StreamParser, StringStream } from '@codemirror/language'
import { gcode } from '@/plugins/StreamParserGcode'

export const klipper_config: StreamParser<any> = {
    token: function (stream: StringStream, state: StreamParserKlipperConfigState): string | null {
        const operators = [
            "\\+\\(", "-\\(", "\\/\\/\\(", "\\/\\(", "%\\(", "\\*\\*", "\\*", "\\(", "\\)",
            "==", "!=", ">=", ">", "<=", "<", "=", "\\|", "~"
        ]
        const reOperator = new RegExp("^" + operators.join("|"))
        const keywords = [
            "if", "elif", "else", "endif", "endfor", "for", "loop\\.index", "loop\\.revindex",
            "loop\\.first", "loop\\.last", "loop\\.length", "loop\\.cycle", "loop\\.depth",
            "and", "or", "not", "in", "is", "endmacro", "macro", "endcall", "call"
        ]
        const reKeyword = new RegExp("^" + keywords.join("\\s+|") + "\\s+")
        const filters = [
            "abs", "attr", "batch", "capitalize", "center", "default", "dictsort", "escape",
            "filesizeformat", "first", "float", "forceescape", "format", "groupby", "indent",
            "int", "join", "last", "length", "list", "lower", "map", "max", "min", "pprint",
            "random", "reject", "rejectattr", "replace", "reverse", "round", "tojson", "safe",
            "select", "selectattr", "slice", "sort", "string", "striptags", "sum", "title",
            "trim", "truncate", "unique", "upper", "urlencode", "urlize", "wordcount",
            "wordwrap", "xmlattr"
        ]
        // const reFilter = new RegExp("^" + filters.join("\\([^(]*\\)|") + "\\([^(]*\\)")
        const reFilter = new RegExp("^" + filters.join("|"))

        function jinja2Element(stream:StringStream): string {
            if (
                (state.klipperMacroJinjaPercent && stream.match(/^%}/)) ||
                (!state.klipperMacroJinjaPercent && stream.match(/^}/), false)
            ) {
                state.klipperMacroJinja = false
                state.klipperMacroJinjaPercent = false
                stream.eatSpace()
                state.gcodeZeroPos = stream.pos
                return 'tag'
            }
            /* string, operator, keyword, atom, number */
            if (stream.match(/^"[^"]+"/)) {
                return 'string'
            }
            if (stream.match(reKeyword)) {
                return 'keyword'
            }
            if (stream.match(reFilter)) {
                if (stream.peek() === "(") {
                    return 'updateOperator'
                }
            }
            if (stream.match(reOperator)) {
                return 'number'
            }
            if (stream.match(/^true\s|false\s/)) {
                return 'atom'
            }
            if (stream.match(/^\d+/)) {
                return 'number'
            }
            stream.next()
            stream.eatSpace()
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

                if (state.klipperMacroJinja) {
                    return jinja2Element(stream)
                }
                if (stream.match(/^\s*{[%#{]?/)) {
                    state.klipperMacroJinjaPercent = stream.string.includes('{%')
                    state.klipperMacroJinja = true
                    return 'tag'
                }
                return gcode.token(stream, state, state.gcodeZeroPos ?? 0)
            }
        } else {
            state.was = true
            if (state.gcode) {
                if (stream.sol()) {
                    stream.eatSpace()
                    state.gcodeZeroPos = stream.pos
                }
                if (state.klipperMacroJinja) {
                    return jinja2Element(stream)
                }
                if (stream.match(/^\s*{[%#{]?/)) {
                    state.klipperMacroJinjaPercent = stream.string.includes('{%')
                    state.klipperMacroJinja = true
                    return 'tag'
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
            klipperMacroJinjaPercent: false,
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
    klipperMacroJinjaPercent: boolean
}
