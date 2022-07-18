/*
import {StringStream} from "@codemirror/stream-parser";
let keywords = ["and", "as", "block", "endblock", "by", "cycle", "debug", "else", "elif",
        "extends", "filter", "endfilter", "firstof", "for",
        "endfor", "if", "endif", "ifchanged", "endifchanged",
        "ifequal", "endifequal", "ifnotequal",
        "endifnotequal", "in", "include", "load", "not", "now", "or",
        "parsed", "regroup", "reversed", "spaceless",
        "endspaceless", "ssi", "templatetag", "openblock",
        "closeblock", "openvariable", "closevariable",
        "openbrace", "closebrace", "opencomment",
        "closecomment", "widthratio", "url", "with", "endwith",
        "get_current_language", "trans", "endtrans", "noop", "blocktrans",
        "endblocktrans", "get_available_languages",
        "get_current_language_bidi", "plural"];
const operator = /^[+\-*&%=<>!?|~^]/;
const sign = /^[:[({]/;
let atom = ["true", "false"];
const number = /^(\d[+\-*!/])?\d+(\.\d+)?/;

keywords = new RegExp("((" + keywords.join(")|(") + "))\\b");
atom = new RegExp("((" + atom.join(")|(") + "))\\b");

export const jinja2 = {
    token: function(stream: StringStream, state: StreamParserJinja2State): string {
        let ch: string | void = stream.peek();

        //Comment
        if (state.incomment) {
            if(!stream.skipTo("#}")) {
                stream.skipToEnd();
            } else {
                stream.eatWhile(/[#}]/);
                state.incomment = false;
            }
            return "comment";
            //Tag
        } else if (state.intag) {
            //After operator
            if(state.operator) {
                state.operator = false;
                if(stream.match(atom)) {
                    return "atom";
                }
                if(stream.match(number)) {
                    return "number";
                }
            }
            //After sign
            if(state.sign) {
                state.sign = false;
                if(stream.match(atom)) {
                    return "atom";
                }
                if(stream.match(number)) {
                    return "number";
                }
            }

            if(state.instring) {
                if(ch == state.instring) {
                    state.instring = false;
                }
                stream.next();
                return "string";
            } else if(ch == "'" || ch == '"') {
                state.instring = ch;
                stream.next();
                return "string";
            } else if(stream.match(state.intag + "}") || stream.eat("-") && stream.match(state.intag + "}")) {
                state.intag = false;
                return "tag";
            } else if(stream.match(operator)) {
                state.operator = true;
                return "operator";
            } else if(stream.match(sign)) {
                state.sign = true;
            } else {
                if(stream.eat(" ") || stream.sol()) {
                    if(stream.match(keywords)) {
                        return "keyword";
                    }
                    if(stream.match(atom)) {
                        return "atom";
                    }
                    if(stream.match(number)) {
                        return "number";
                    }
                    if(stream.sol()) {
                        stream.next();
                    }
                } else {
                    stream.next();
                }

            }
            return "variable";
        } else if (stream.eat("{")) {
            if (stream.eat("#")) {
                state.incomment = true;
                if(!stream.skipTo("#}")) {
                    stream.skipToEnd();
                } else {
                    stream.eatWhile(/[#}]/);
                    state.incomment = false;
                }
                return "comment";
                //Open tag
                // eslint-disable-next-line no-cond-assign
            } else if (ch = stream.eat(/[{%]/)) {
                //Cache close tag
                state.intag = ch;
                if(ch == "{") {
                    state.intag = "}";
                }
                stream.eat("-");
                return "tag";
            }
        }
        stream.next();
    },
    startState: function(): StreamParserJinja2State {
        return {
            incomment: false,
            intag: false,
            operator: false,
            sign: false,
            instring: false
        };
    },
    languageData: {
        blockCommentStart: "{#",
        blockCommentEnd: "#}"
    }
}

export interface StreamParserJinja2State {
    incomment: boolean,
    intag: string | boolean,
    operator: boolean,
    sign: boolean,
    instring: boolean | string,
}
*/
