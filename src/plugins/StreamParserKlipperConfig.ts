import {StringStream} from '@codemirror/stream-parser'
import {gcode} from '@/plugins/StreamParserGcode'

export const klipper_config = {
    token: function (stream: StringStream, state: StreamParserKlipperConfigState): string | null {
        const ch = stream.peek()


        /* comments */
        if (stream.match(/^\s+#/) || (
            ch === '#' && (stream.pos === 0 || /\s/.test(stream.string.charAt(stream.pos - 1)))
        )) {
            stream.skipToEnd()
            state.pair = false
            return 'comment'
        }

        if (state.gcode &&
            !state.klipperMacroJinja &&
            (ch === '[')
        ) {
            state.gcode = false
            state.gcodeZeroPos = null
        }

        if (state.gcode) {
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
        }

        if (stream.match(/^gcode:\s*/)) {
            stream.skipToEnd()
            state.gcode = true
            return 'atom'
        }

        if (state.pair) {
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
        }

        if (stream.match(/^[a-zA-Z0-9_]+\s?[:=]\s?/)) {
            state.pair = true
            return 'atom'
        }

        /*if (stream.match(/^\[include.*]$/)) {
            console.log(stream, state);
            return "macroName";
        }*/

        if (state.block) {
            if (stream.match(/^[a-z0-9-_]+/i)) {
                return 'namespace'
            }
            if (stream.match(/^\s[a-z0-9-_./*\s]+/i)) {
                return 'className'
            }
            stream.skipToEnd()
            state.block = false
            return null
        }

        if (stream.next() === '[') {
            state.block = true
            return null
        }

        if (stream.match(/^('([^']|\\.)*'?|"([^"]|\\.)*"?)/))
            return 'string'

        stream.next()
        return 'string'
    },
    startState: function (): StreamParserKlipperConfigState {
        return {
            block: false,
            pair: false,
            gcode: false,
            klipperMacro: false,
            gcodeZeroPos: null,
            klipperMacroJinja: false,
        }
    },
    languageData: {
        commentTokens: {line: '#'}
    }
}


interface StreamParserKlipperConfigState {
    block: boolean,
    pair: boolean,
    gcode: boolean,
    gcodeZeroPos: number | null,
    klipperMacro: boolean,
    klipperMacroJinja: boolean
}
