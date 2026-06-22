import { ExternalTokenizer } from '@lezer/lr'
import { GcodeBody } from './klipperConfig.terms'

const NEWLINE = 10
const SPACE = 32
const TAB = 9
const CR = 13

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
