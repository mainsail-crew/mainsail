import { StringStream } from '@codemirror/language'

export const gcode = {
    token: function (stream: StringStream, state: StreamParserGcodeState, zeroPos = 0): string | null {
        const ch = stream.peek()

        if (stream.pos === zeroPos && state.klipperMacro) state.klipperMacro = false

        /* Klipper macro attributes */
        if (stream.pos > zeroPos && state.klipperMacro) {
            stream.eatSpace()
            if (stream.match(/^{/)) {
                return 'tag'
            }
            // else if (stream.match(/^'|"/)) {
            else if (stream.match(/^"[^{]+"/) || stream.match(/^'[^{]+'/)) {
                return 'string'
            } else if (stream.match(/^[-+]?[0-9]*\.?[0-9]+/)) {
                return 'number'
            } else if (stream.match(/^[A-Za-z\d_]+/)) {
                return 'propertyName'
            } else if (zeroPos === 0 && stream.match(/^{[^%]+}/)) {
                return 'variable'
            }
        }

        /* comments */
        if ([';'].includes(ch ?? '')) {
            stream.skipToEnd()
            return 'comment'
        }

        const isZero = stream.pos == zeroPos

        /* Mxxx Gxxx commands */
        if (isZero && stream.match(/_?[GMgm][\d.]+/)) {
            return 'namespace'
        }

        if (stream.string.substring(zeroPos).toLowerCase().startsWith('m117')) {
            stream.skipToEnd()
            return 'string'
        }

        /* G0/1 movements */
        if (stream.pos > zeroPos && stream.match(/[EPXYZIJ]-?([\d]*\.[\d]+|[\d]+)?/i)) {
            return 'className'
        }

        /* G0/1 speeds */
        if (stream.pos > zeroPos && stream.match(/[Ff]-?([\d]*\.[\d]+|[\d]+)?/)) {
            return 'string'
        }

        /* G0/1 extrusions */
        if (stream.pos > zeroPos && stream.match(/[TtSs]-?([\d]*\.[\d]+|[\d]+)?/)) {
            return 'atom'
        }

        if (zeroPos === 0 && stream.pos > zeroPos && stream.match(/^{[^%]+}/)) return 'propertyName'

        /* Klipper macro names */
        if (isZero && stream.match(/^\s*[A-Z_\d]+/)) {
            state.klipperMacro = true
            return 'name'
        }

        stream.next()
        return null
    },
    startState: function (): StreamParserGcodeState {
        return {
            klipperMacro: false,
        }
    },
    languageData: {
        commentTokens: { line: ';' },
    },
}

interface StreamParserGcodeState {
    klipperMacro: boolean
}
