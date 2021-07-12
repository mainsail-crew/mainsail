import {StringStream} from "@codemirror/stream-parser";

const cons = ['include'];
const keywordRegex = new RegExp("\\b(("+cons.join(")|(")+"))$", 'i');

export const klipper_config = {
    token: function (stream: StringStream, state: StreamParserKlipperConfigState): string | null {
        const ch = stream.peek();

        /* comments */
        if (ch === "#" && (stream.pos === 0 || /\s/.test(stream.string.charAt(stream.pos - 1)))) {
            stream.skipToEnd();
            state.pair = false;
            return "comment";
        }

        if (state.gcode && (ch === '[' || stream.indentation() === 0)) {
            state.gcode = false;
        }

        if (state.gcode) {
            stream.skipToEnd();
            return null;
        }

        if (stream.match(/^gcode:\s*/)) {
            stream.skipToEnd();
            state.gcode = true;
            return "macroName";
        }

        if (state.pair) {
            if (stream.match(/^[a-zA-Z_]+?:/)) {
                stream.backUp(1);
                return "className";
            }
            if (stream.match(/^[\^!]*[A-Z]+[0-9.]+(:?_[0-9]+)?/)) {
                if (stream.eol()) {
                    state.pair = false;
                }
                return "macroName";
            }
            if (stream.match(/^(-?[0-9.]+)/)) {
                if (stream.eol()) {
                    state.pair = false;
                }
                return "number";
            }
            if (stream.match(/^([a-zA-Z0-9~,:_/\-\s]+)/)) {
                if (stream.eol()) {
                    state.pair = false;
                }
                return "string";
            }
            if (stream.match(/^\s*#.*$/)) {
                stream.skipToEnd();
                state.pair = false;
                return "comment";
            }
            console.log("skipped", stream.string);
            stream.skipToEnd();
            state.pair = false;
            return null;
        }

        if (stream.match(/^[a-zA-Z0-9_]+:\s?/)) {
            state.pair = true;
            return "atom";
        }

        /*if (stream.match(/^\[include.*]$/)) {
            console.log(stream, state);
            return "macroName";
        }*/

        if (state.block) {
            if (stream.match(/^[a-zA-Z0-9-_]+/)) {
                return "namespace"
            }
            if (stream.match(/^\s[a-zA-Z0-9-_.]+/)) {
                return "className";
            }
            stream.skipToEnd();
            state.block = false;
            return null;
        }

        if (stream.next() === '[') {
            state.block = true;
            return null;
        }

        if (stream.match(/^('([^']|\\.)*'?|"([^"]|\\.)*"?)/))
            return "string";

        stream.next();
        return "string";
    },
    startState: function (): StreamParserKlipperConfigState {
        return {
            block: false,
            pair: false,
            gcode: false
        };
    },
    languageData: {
        commentTokens: {line: "#"}
    }
}


interface StreamParserKlipperConfigState {
    block: boolean,
    pair: boolean,
    gcode: boolean
}
