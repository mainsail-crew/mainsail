import {StreamParser, StringStream} from '@codemirror/stream-parser'
import {gcode} from '@/plugins/StreamParserGcode'

export const klipper_config: StreamParser<any> = {
    token: function (stream: StringStream, state: StreamParserKlipperConfigState): string | null {
        const ch = stream.peek()

        /* comments */
        if (stream.match(/^\s+[#;]/) || (
            [';','#'].includes(ch ?? '') && (stream.pos === 0 || /\s/.test(stream.string.charAt(stream.pos - 1)))
        )) {
            stream.skipToEnd()
            state.block = false
            state.pair = false
            return 'comment'
        }

        if (ch === '[') {
            state.block = true
            stream.next()
            return null
        }

        if (state.block) {
            if (!ch || ch === ']') {
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

        if (stream.indentation() > 0) {
            state.was = true
            if (state.gcode) {
                if (stream.sol()) {
                    stream.eatSpace()
                    state.gcodeZeroPos = stream.pos
                }
                if (state.klipperMacroJinja) {
                    let reg = /^}/
                    if (state.klipperMacroJinjaPercent) {
                        reg = /^%}/
                    }
                    if (stream.match(reg)) {
                        state.klipperMacroJinja = false
                        state.klipperMacroJinjaPercent = false
                        stream.eatSpace()
                        state.gcodeZeroPos = stream.pos
                        return null
                    }
                    if (stream.eatWhile(ch => !['%', '}'].includes(ch))) {
                        console.log(stream.current())
                        return 'string'
                    }
                }

                if (stream.match(/^{[%{]?/)) {
                    state.klipperMacroJinjaPercent = stream.current().includes('%')
                    state.klipperMacroJinja = true
                    return null
                }
                return gcode.token(stream, state, state.gcodeZeroPos ?? 0)
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
            if (stream.match(/^gcode/)) {
                state.gcode = true
                stream.skipToEnd()
            } else {
                stream.match(/^.+?:/)
                stream.backUp(1)
                state.pair = true
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

        /*if (state.gcode &&
            !state.klipperMacroJinja &&
            (ch === '[')
        ) {
            state.gcode = false
            state.gcodeZeroPos = null
        }*/

        /*if (state.gcode) {
            stream.eatSpace()
            if (state.gcodeZeroPos === null) {
                state.gcodeZeroPos = stream.pos
            }
            if (state.klipperMacroJinja) {
                if (stream.match(/^%?}/)) {
                    state.klipperMacroJinja = false
                    return null
                }
                if (stream.eat(/.(?!%})/)) {
                    return 'string'
                }
                if (stream.eat(/.(?!})/)) {
                    return 'string'
                }
                stream.match(/^.*$/)
                return 'string'
            }

            if (stream.match(/^{%?/)) {
                state.klipperMacroJinja = true
                return null
            }

            return gcode.token(stream, state, state.gcodeZeroPos)
        }*/

        /*if (stream.match(/^gcode:\s*!/)) {
            stream.skipToEnd()
            state.gcode = true
            return 'atom'
        }*/

        /*if (state.pair) {
            if (stream.match(/^[\^!]*[a-z_]+[0-9]*?:/i)) {
                stream.backUp(1)
                return 'macroName'
            } else if (
                stream.match(/^[\^!]*(?:(?:P[A-Z]?|A[A-Z]?|EXP|GPIOCHIP|GPIO)+[0-9.]+|z_virtual_endstop)(_[0-9]+)?/i) ||
                stream.match(/^\/gpio[0-9]+/i)) {
                if (stream.eol()) {
                    state.pair = false
                }
                return 'macroName'
            } else if (stream.match(/^\s*\[?(-?[0-9,.:]+)]?/)) {
                if (stream.eol()) {
                    state.pair = false
                }
                return 'number'
            } else if (stream.match(/^([a-zA-Z0-9~"'.,:_/\-\s]+)/)) {
                if (stream.eol()) {
                    state.pair = false
                }
                return 'string'
            } else if (stream.match(/^\s*#.*$/)) {
                stream.skipToEnd()
                state.pair = false
                return 'comment'
            }
            stream.next()
            return null
        }*/

        /*if (stream.match(/^[a-zA-Z0-9_]+\s?[:=]\s?/)) {
            state.pair = true
            return 'atom'
        }*/

        /*if (stream.match(/^\[include.*]$/)) {
            console.log(stream, state);
            return "macroName";
        }*/

        /*if (state.block) {
            if (stream.match(/^[a-z0-9-_]+/i)) {
                return 'namespace'
            }
            if (stream.match(/^\s[a-z0-9-_./!*\s]+/i)) {
                return 'className'
            }
            stream.skipToEnd()
            state.block = false
            return null
        }*/

        /*if (stream.next() === '[') {
            state.block = true
            return null
        }

        if (stream.match(/^('([^']|\\.)*'?|"([^"]|\\.)*"?)/))
            return 'string'*/

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
            klipperMacroJinjaPercent: false
        }
    },
    languageData: {
        commentTokens: {line: '#'}
    }
}


interface StreamParserKlipperConfigState {
    block: boolean,
    pair: boolean,
    was: boolean,
    gcode: boolean,
    gcodeZeroPos: number | null,
    klipperMacro: boolean,
    klipperMacroJinja: boolean,
    klipperMacroJinjaPercent: boolean,
}
