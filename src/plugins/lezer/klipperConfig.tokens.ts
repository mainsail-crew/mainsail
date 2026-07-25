import { ExternalTokenizer } from '@lezer/lr'
import { GcodeBody, PropertyName, ValuePunctuation } from './klipperConfig.terms'

const NEWLINE = 10
const SPACE = 32
const TAB = 9
const CR = 13
const COLON = 58
const EQUALS = 61

// Klipper keys are only valid at column 0. A word followed by ":" anywhere
// else (e.g. the value "EBBCan:PD0") is not a key, so PropertyName can't be
// a regular grammar token (lezer tokens can't anchor to line starts).
const KEY_STOP = new Set([...' \t\r\n:=#;[],'].map((c) => c.charCodeAt(0)))

// "[" / "{" only start a section header at column 0; inside a value they are
// plain punctuation of a python literal (save_variables files: "x = [1, 2]").
const VALUE_PUNCTUATION = new Set([...'[]{}'].map((c) => c.charCodeAt(0)))

export const propertyName = new ExternalTokenizer((input) => {
    if (input.pos > 0 && input.peek(-1) != NEWLINE) return
    let name = ''
    while (input.next != -1 && !KEY_STOP.has(input.next)) {
        name += String.fromCharCode(input.next)
        input.advance()
    }
    if (name.length == 0) return
    // configparser allows spaces before the delimiter ("blobifier = 2096")
    while (input.next == SPACE || input.next == TAB) input.advance()
    // "=" is a key delimiter too (save_variables / [Variables] files)
    if (input.next != COLON && input.next != EQUALS) return
    // *_gcode: / enable: belong to the built-in GcodeKey token
    if (/^(?:[A-Za-z]*_?gcode|enable)$/.test(name)) return
    input.advance()
    input.acceptToken(PropertyName)
})

export const valuePunctuation = new ExternalTokenizer((input) => {
    if (input.pos == 0 || input.peek(-1) == NEWLINE) return
    if (!VALUE_PUNCTUATION.has(input.next)) return
    input.acceptToken(ValuePunctuation, 1)
})

// Consumes a *_gcode: / enable: body: the rest of the key line plus every
// following line that is blank or indented, stopping before the next
// column-0 (non-indented) line. Emitted as one GcodeBody token, which
// parseMixed then re-parses as jinja(base: gcode).
export const gcodeBody = new ExternalTokenizer((input) => {
    const start = input.pos
    let end: number

    const consumeLine = () => {
        while (input.next != -1 && input.next != NEWLINE) input.advance()
        if (input.next == NEWLINE) input.advance()
    }

    // rest of the key line
    consumeLine()
    end = input.pos

    // following blank or indented lines
    for (;;) {
        const c = input.next
        if (c == -1) {
            end = input.pos
            break
        }
        if (c == SPACE || c == TAB || c == CR) {
            consumeLine()
            end = input.pos
        } else if (c == NEWLINE) {
            input.advance()
            end = input.pos
        } else {
            // column-0 non-blank line -> next item
            break
        }
    }

    if (end > start) input.acceptToken(GcodeBody)
})
