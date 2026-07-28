import { ExternalTokenizer } from '@lezer/lr'
import { BareParamWord, MessageText, ParamValue } from './gcode.terms'

const EQUALS = 61
const NEWLINE = 10
const RETURN = 13
const SPACE = 32
const TAB = 9
// klipper strips both as comments, even in an M117/M118 message
const isComment = (ch: number) => ch == 59 /* ; */ || ch == 35 /* # */
const isEnd = (ch: number) => ch < 0 || ch == NEWLINE || ch == RETURN || isComment(ch)

const isValueChar = (ch: number) =>
    (ch >= 48 && ch <= 57) || // 0-9
    (ch >= 65 && ch <= 90) || // A-Z
    (ch >= 97 && ch <= 122) || // a-z
    ch == 95 || // _
    ch == 46 || // .
    ch == 45 // -

// The unquoted value of a macro param (MACRO=TIMELAPSE_TAKE_FRAME). It must be
// attached to the "=", otherwise "VALUE=" at the end of a jinja-split fragment
// would swallow the command on the next line as its value.
export const paramValue = new ExternalTokenizer((input) => {
    if (input.peek(-1) != EQUALS) return
    // digits stay a Number (VALUE=0.5), so a value has to start with a letter
    const first = input.next
    if (!((first >= 65 && first <= 90) || (first >= 97 && first <= 122) || first == 95)) return
    while (isValueChar(input.next)) input.advance()
    input.acceptToken(ParamValue)
})

const isLetter = (ch: number) => (ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122)

// A single parameter letter: "G28 X Y Z" or "G0 X{...}" (there the gcode
// fragment ends right after the letter, the value is a jinja tag). Only a
// letter that nothing else is attached to, so macro names stay intact.
export const bareParamWord = new ExternalTokenizer((input) => {
    if (!isLetter(input.next) || input.peek(-1) == EQUALS) return
    const after = input.peek(1)
    if (after >= 0 && after != SPACE && after != TAB && after != NEWLINE && after != RETURN) return
    input.advance()
    input.acceptToken(BareParamWord)
})

// The rest of the line after M117/M118, up to a comment. canShift() keeps it
// to that position, the backwards scan keeps it on the command's own line (the
// skipped whitespace between the two includes newlines).
export const messageText = new ExternalTokenizer((input, stack) => {
    if (!stack.canShift(MessageText) || isEnd(input.next)) return
    for (let back = -1; ; back--) {
        const ch = input.peek(back)
        if (ch == NEWLINE || ch == RETURN) return
        if (ch != 32 && ch != 9) break
    }
    while (!isEnd(input.next)) input.advance()
    input.acceptToken(MessageText)
})
