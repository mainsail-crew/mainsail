import { describe, expect, it } from 'vitest'
import { highlightTree, classHighlighter } from '@lezer/highlight'
import { klipperConfigLanguage, gcodeLanguage } from '@/plugins/lezer'

// returns [text, cls] pairs for every highlighted token
function highlight(lang: typeof klipperConfigLanguage, code: string): [string, string][] {
    const tree = lang.parser.parse(code)
    const out: [string, string][] = []
    highlightTree(tree, classHighlighter, (from, to, cls) => out.push([code.slice(from, to), cls]))
    return out
}

const find = (tokens: [string, string][], text: string) => tokens.find(([t]) => t === text)?.[1]

// returns the innermost syntax-tree node name covering the first match of `text`
function nodeNameOf(lang: typeof klipperConfigLanguage, code: string, text: string): string {
    const at = code.indexOf(text)
    return lang.parser.parse(code).resolveInner(at + 1, 1).name
}

describe('lezer klipper-config grammar', () => {
    it('highlights config structure', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `[stepper_x]
step_pin: PA1
position_endstop: -0.5
# a comment`
        )
        expect(find(tokens, 'stepper_x')).toContain('namespace')
        expect(find(tokens, 'step_pin:')).toContain('propertyName')
        expect(find(tokens, 'PA1')).toContain('string')
        expect(find(tokens, '-0.5')).toContain('number')
        expect(find(tokens, '# a comment')).toContain('comment')
    })

    it('splits section type and name', () => {
        const tokens = highlight(klipperConfigLanguage, `[gcode_macro PARK]`)
        expect(find(tokens, 'gcode_macro')).toContain('namespace')
        expect(find(tokens, 'PARK')).toContain('className')
    })

    it('embeds jinja and gcode inside a gcode block', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `[gcode_macro PARK]
gcode:
    {% set z = 10 %}
    G1 Z{z} F600
    M117 parked`
        )
        // jinja
        expect(find(tokens, 'set')).toContain('keyword')
        expect(find(tokens, '{%')).toBeDefined()
        // gcode overlay on the literal text between jinja tags
        expect(find(tokens, 'G1')).toContain('keyword')
        expect(find(tokens, 'F600')).toContain('string')
        expect(find(tokens, 'M117 parked')).toContain('string')
    })

    it('treats # and ; as comments inside gcode blocks and {% %} statements', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `[gcode_macro RESUME]
gcode:
    ##### a heading #####
    {% set runout = True   # inline comment inside a statement
        else False %}
    M109 S200 ; trailing gcode comment`
        )
        expect(find(tokens, '##### a heading #####')).toContain('comment')
        expect(find(tokens, '# inline comment inside a statement')).toContain('comment')
        expect(find(tokens, '; trailing gcode comment')).toContain('comment')
    })

    it('does not let a quote wrapping a jinja interpolation swallow following lines', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `[gcode_macro RESUME]
gcode:
    RESPOND TYPE=echo MSG='{"Restoring %s" % (a, b) }'
    M109 S200
    G28`
        )
        // the gcode commands after the MSG='{...}' line must stay commands, not
        // get eaten by the unclosed single quote
        expect(find(tokens, 'M109')).toContain('keyword')
        expect(find(tokens, 'G28')).toContain('keyword')
    })

    it('parses member access after a subscript across multiple lines', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `[gcode_macro A]
gcode:
    {% set x = True if printer[sensor].enabled  # c1
        else printer[sensor].filament_detected %}`
        )
        // the .enabled / .filament_detected must not break the parse, so the
        // trailing else / %} stay highlighted
        expect(find(tokens, 'else')).toContain('keyword')
        expect(find(tokens, '%}')).toBeDefined()
        expect(find(tokens, 'filament_detected')).toContain('propertyName')
    })

    it('treats a builtin name as a variable outside filter position', () => {
        const code = `[gcode_macro A]
gcode:
    {% set max = printer.toolhead.axis_maximum %}
    {% set cone = z|default(max) %}`
        // `max` as an assignment target / argument is a variable, not a function
        expect(nodeNameOf(klipperConfigLanguage, code, 'max =')).toBe('VariableName')
        // `default` after a | pipe is a filter name
        expect(nodeNameOf(klipperConfigLanguage, code, 'default')).toBe('FilterName')
    })

    it('resumes config parsing after an indented gcode block', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `[gcode_macro A]
gcode:
    G28
[bed_mesh]
mesh_min: 10, 10`
        )
        // bed_mesh must still be recognised as a section, not swallowed by the block
        expect(find(tokens, 'bed_mesh')).toContain('namespace')
        expect(find(tokens, 'mesh_min:')).toContain('propertyName')
    })
})

describe('lezer gcode grammar', () => {
    it('highlights commands, axis words and comments', () => {
        const tokens = highlight(
            gcodeLanguage,
            `G1 X10 Y-5 F3000 S200
M117 hello
; comment`
        )
        expect(find(tokens, 'G1')).toContain('keyword')
        expect(find(tokens, 'X10')).toContain('className')
        expect(find(tokens, 'F3000')).toContain('string')
        expect(find(tokens, 'S200')).toContain('atom')
        expect(find(tokens, 'M117 hello')).toContain('string')
        expect(find(tokens, '; comment')).toContain('comment')
    })
})
