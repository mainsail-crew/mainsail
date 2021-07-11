import {StringStream} from "@codemirror/stream-parser";

export const gcode = {
    token: function(stream: StringStream, state: StreamParserGcodeState) {
        const ch = stream.peek();

        if (stream.pos === 0) state.klipperMacro = false

        /* comments */
        if (ch == ";" && (stream.pos == 0 || /\s/.test(stream.string.charAt(stream.pos - 1)))) {
            stream.skipToEnd();
            return "comment";
        }

        /* Mxxx Gxxx commands */
        if (stream.pos == 0 && stream.match(/[GMgm][\d]+/)) {
            return 'namespace'
        }

        /* G0/1 movements */
        if (stream.pos > 0 && stream.match(/[XYZIJxyzij]-?([\d]*\.[\d]+|[\d]+)/)) {
            return 'className'
        }

        /* G0/1 speeds */
        if (stream.pos > 0 && stream.match(/[Ff]-?([\d]*\.[\d]+|[\d]+)/)) {
            return 'string'
        }

        /* G0/1 extrusions */
        if (stream.pos > 0 && stream.match(/[Ee]-?([\d]*\.[\d]+|[\d]+)/)) {
            return 'atom'
        }

        /* Klipper macro names */
        if (stream.pos == 0 && stream.match(/^[A-Z_]+/)) {
            state.klipperMacro = true
            return 'name'
        }

        /* Klipper macro attributes */
        if (stream.pos > 0 && state.klipperMacro) {

            if (stream.match(/(\s[A-Z_]+)/))
                return 'propertyName'
            else if (stream.match(/([A-Za-z0-9_]+)/))
                return 'number'
        }

        stream.next();
        return null;
    },
    startState: function(): StreamParserGcodeState {
        return {
            klipperMacro: false,
        };
    },
    languageData: {
        commentTokens: {line: ";"}
    }
};

interface StreamParserGcodeState {
    klipperMacro: boolean
}