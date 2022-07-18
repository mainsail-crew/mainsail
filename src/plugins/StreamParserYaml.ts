import { StringStream } from '@codemirror/stream-parser'

const cons = ['true', 'false', 'on', 'off', 'yes', 'no']
const keywordRegex = new RegExp('\\b((' + cons.join(')|(') + '))$', 'i')

export const yaml = {
    token: function (stream: StringStream, state: StreamParserYamlState): string | null {
        const ch = stream.peek()
        const esc = state.escaped

        state.escaped = false
        /* comments */
        if (ch == '#' && (stream.pos == 0 || /\s/.test(stream.string.charAt(stream.pos - 1)))) {
            stream.skipToEnd()
            return 'comment'
        }

        if (stream.match(/^('([^']|\\.)*'?|"([^"]|\\.)*"?)/)) return 'string'

        if (state.literal && stream.indentation() > state.keyCol) {
            stream.skipToEnd()
            return 'string'
        } else if (state.literal) {
            state.literal = false
        }
        if (stream.sol()) {
            state.keyCol = 0
            state.pair = false
            state.pairStart = false
            /* document start */
            if (stream.match('---')) {
                return 'def'
            }
            /* document end */
            if (stream.match('...')) {
                return 'def'
            }
            /* array list item */
            if (stream.match(/^\s*-\s+/)) {
                return 'meta'
            }
        }

        if (stream.match(/^\[[a-zA-Z]\s/)) {
            window.console.log('keys', stream)
            return 'number'
        }

        /* inline pairs/lists */
        if (stream.match(/^(\{|\}|\[|\])/)) {
            if (ch == '{') state.inlinePairs++
            else if (ch == '}') state.inlinePairs--
            else if (ch == '[') state.inlineList++
            else state.inlineList--
            return 'meta'
        }

        /* list separator */
        if (state.inlineList > 0 && !esc && ch == ',') {
            stream.next()
            return 'meta'
        }
        /* pairs separator */
        if (state.inlinePairs > 0 && !esc && ch == ',') {
            state.keyCol = 0
            state.pair = false
            state.pairStart = false
            stream.next()
            return 'meta'
        }

        /* start of value of a pair */
        if (state.pairStart) {
            /* block literals */
            if (stream.match(/^\s*(\||>)\s*/)) {
                state.literal = true
                return 'meta'
            }
            /* references */
            if (stream.match(/^\s*(&|\*)[a-z0-9._-]+\b/i)) {
                return 'variable'
            }
            /* numbers */
            if (state.inlinePairs == 0 && stream.match(/^\s*-?[0-9.,]+\s?$/)) {
                return 'number'
            }
            if (state.inlinePairs > 0 && stream.match(/^\s*-?[0-9.,]+\s?(?=(,|}))/)) {
                return 'number'
            }
            /* keywords */
            if (stream.match(keywordRegex)) {
                return 'keyword'
            }
        }

        /* pairs (associative arrays) -> key */
        if (
            !state.pair &&
            stream.match(/^\s*(?:[,[\]{}&*!|>'"%@`][^\s'":]|[^,[\]{}#&*!|>'"%@`])[^#]*?(?=\s*:($|\s))/)
        ) {
            state.pair = true
            state.keyCol = stream.indentation()
            return 'atom'
        }
        if (state.pair && stream.match(/^:\s*/)) {
            state.pairStart = true
            return 'meta'
        }

        /* nothing found, continue */
        state.pairStart = false
        state.escaped = ch == '\\'
        stream.next()
        return null
    },
    startState: function (): StreamParserYamlState {
        return {
            pair: false,
            pairStart: false,
            keyCol: 0,
            inlinePairs: 0,
            inlineList: 0,
            literal: false,
            escaped: false,
        }
    },
    languageData: {
        commentTokens: { line: '#' },
    },
}

interface StreamParserYamlState {
    pair: boolean
    pairStart: boolean
    keyCol: number
    inlinePairs: number
    inlineList: number
    literal: boolean
    escaped: boolean
}
