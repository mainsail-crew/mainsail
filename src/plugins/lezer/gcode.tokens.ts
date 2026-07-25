import { ExternalTokenizer } from '@lezer/lr'
import { ParamValue } from './gcode.terms'

const EQUALS = 61

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
