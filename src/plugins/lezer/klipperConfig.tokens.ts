import { ExternalTokenizer } from '@lezer/lr'
import { GcodeBody, PropertyName } from './klipperConfig.terms'

const NEWLINE = 10
const SPACE = 32
const TAB = 9
const CR = 13
const COLON = 58

// Klipper keys are only valid at column 0. A word followed by ":" anywhere
// else (e.g. the value "EBBCan:PD0") is not a key, so PropertyName can't be
// a regular grammar token (lezer tokens can't anchor to line starts).
const KEY_STOP = new Set([...' \t\r\n:#;[],'].map((c) => c.charCodeAt(0)))

export const propertyName = new ExternalTokenizer((input) => {
    if (input.pos > 0 && input.peek(-1) != NEWLINE) return
    let name = ''
    while (input.next != -1 && !KEY_STOP.has(input.next)) {
        name += String.fromCharCode(input.next)
        input.advance()
    }
    if (name.length == 0 || input.next != COLON) return
    // *_gcode: / enable: belong to the built-in GcodeKey token
    if (/^(?:[A-Za-z]*_?gcode|enable)$/.test(name)) return
    input.advance()
    input.acceptToken(PropertyName)
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
