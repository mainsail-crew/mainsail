import {StringStream} from '@codemirror/stream-parser'

export const gcode = {
    token: function(stream: StringStream, state: StreamParserGcodeState, zeroPos = 0): string | null {
        const ch = stream.peek()

        if (stream.pos === zeroPos && state.klipperMacro) state.klipperMacro = false

        /* Klipper macro attributes */
        if (stream.pos > zeroPos && state.klipperMacro) {
            if (stream.match(/^\s*[A-Z_]+/))
                return 'propertyName'
            else if (stream.match(/^\s*[A-Za-z0-9_]+/))
                return 'number'
            else if (stream.match(/^{.*}/))
                return 'variable'
        }

        /* comments */
        if ([';', '#'].includes(ch ?? '')) {
            stream.skipToEnd()
            return 'comment'
        }

        /* Mxxx Gxxx commands */
        if (stream.pos == zeroPos && stream.match(/[GMgm][\d]+/)) {
            return 'namespace'
        }

        /* G0/1 movements */
        if (stream.pos > zeroPos && stream.match(/[XYZIJxyzij]-?([\d]*\.[\d]+|[\d]+)?/)) {
            return 'className'
        }

        /* G0/1 speeds */
        if (stream.pos > zeroPos && stream.match(/[Ff]-?([\d]*\.[\d]+|[\d]+)/)) {
            return 'string'
        }

        /* G0/1 extrusions */
        if (stream.pos > zeroPos && stream.match(/[TtSsEe]-?([\d]*\.[\d]+|[\d]+)/)) {
            return 'atom'
        }

        if (stream.pos > zeroPos && stream.match(/^{.*}/))
            return 'propertyName'

        /* Klipper macro names */
        if (stream.pos == zeroPos && stream.match(/^[A-Z_]+/)) {
            state.klipperMacro = true
            return 'name'
        }

        stream.next()
        return null
    },
    startState: function(): StreamParserGcodeState {
        return {
            klipperMacro: false,
        }
    },
    languageData: {
        commentTokens: {line: ';'}
    }
}

interface StreamParserGcodeState {
    klipperMacro: boolean
}
