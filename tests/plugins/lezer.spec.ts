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
        expect(find(tokens, 'G1')).toContain('variableName')
        expect(find(tokens, 'F600')).toContain('number')
        // M117 keeps the command color, only its text is a string
        expect(find(tokens, 'M117')).toContain('variableName')
        expect(find(tokens, ' parked')).toContain('string')
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
        expect(find(tokens, 'M109')).toContain('variableName')
        expect(find(tokens, 'G28')).toContain('variableName')
    })

    it('colors a param letter without a number like a param', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `[gcode_macro PARK]
gcode:
    G0 X{printer.toolhead.axis_maximum.x-1} F6000
    G28 X Y
    BED_MESH_CALIBRATE PROFILE=default`
        )
        expect(find(tokens, 'X')).toContain('number')
        expect(find(tokens, 'Y')).toContain('number')
        // a macro name must not be shredded into single letters
        expect(find(tokens, 'BED_MESH_CALIBRATE')).toContain('variableName')
    })

    it('parses a closed string literal spanning multiple lines', () => {
        const code = `[gcode_macro HYPERLAPSE]
gcode:
    {action_raise_error("No valid input parameter
                         Use:
                         - HYPERLAPSE ACTION=STOP")}
    G28`
        const tokens = highlight(klipperConfigLanguage, code)
        // whole message is one string, and the parse recovers afterwards
        expect(nodeNameOf(klipperConfigLanguage, code, '"No valid')).toBe('StringLiteral')
        expect(nodeNameOf(klipperConfigLanguage, code, 'ACTION=STOP")')).toBe('StringLiteral')
        expect(find(tokens, 'G28')).toContain('variableName')
    })

    it('does not pair a quote around an interpolation with a later quote', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `[gcode_macro TIMELAPSE_TAKE_FRAME]
gcode:
    SET_GCODE_VARIABLE MACRO=TL VARIABLE=park VALUE="{tl.park}"
    {% if params.TRAVEL_SPEED %}
        {action_raise_error("TRAVEL_SPEED=%s must be larger than 0" % params.TRAVEL_SPEED)}
    {% endif %}`
        )
        // the trailing quote of VALUE="{...}" must not swallow the lines below
        expect(find(tokens, 'if')).toContain('keyword')
        expect(find(tokens, 'endif')).toContain('keyword')
        expect(find(tokens, 'params.TRAVEL_SPEED')).toContain('propertyName')
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

    it('keeps board_pins aliases as string values despite an inline comment', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `[board_pins]
aliases:
    # EXP1 header
    EXP1_1=P2.8, EXP1_9=<GND>, EXP1_10=<5V>`
        )
        expect(find(tokens, '# EXP1 header')).toContain('comment')
        expect(find(tokens, 'EXP1_1')).toContain('string')
        expect(find(tokens, '5V')).toContain('string')
        // a directly attached "," is a separator, not part of the value
        expect(find(tokens, 'P2.8')).toContain('string')
        expect(find(tokens, 'GND')).toContain('string')
        expect(find(tokens, '=')).toContain('operator')
        expect(find(tokens, '<')).toContain('operator')
    })

    it('keeps mcu-prefixed pins and ratios as single string values', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `[extruder]
step_pin: EBBCan:PD0
enable_pin: !EBBCan:PD2
gear_ratio: 50:10`
        )
        expect(find(tokens, 'step_pin:')).toContain('propertyName')
        expect(find(tokens, 'EBBCan:PD0')).toContain('string')
        expect(find(tokens, '!EBBCan:PD2')).toContain('string')
        expect(find(tokens, '50:10')).toContain('string')
    })

    it('treats a comma as a separator, except inside a quoted string', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `description: Extrudes, if the extruder is hot enough
mesh_min: 25,25
colors = ['1e1e1e,', 'red']`
        )
        expect(find(tokens, 'Extrudes')).toContain('string')
        // only a quoted value keeps its comma
        expect(find(tokens, "'1e1e1e,'")).toContain('string')
        // list separators are punctuation, like the brackets around them
        expect(find(tokens, '25')).toContain('number')
        expect(find(tokens, ',')).toContain('punctuation')
    })

    it('highlights booleans', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `a: true
b: False
c: true_x
d = [True, false]`
        )
        expect(find(tokens, 'true')).toContain('number')
        expect(find(tokens, 'False')).toContain('number')
        expect(find(tokens, 'True')).toContain('number')
        expect(find(tokens, 'true_x')).toContain('string')
    })

    it('keeps double-dash cli flags as one string', () => {
        const tokens = highlight(klipperConfigLanguage, `custom_flags: --http-listen=0.0.0.0`)
        expect(find(tokens, '--http-listen')).toContain('string')
    })

    it('handles "=" keys and python literal values (save_variables)', () => {
        const code = `[Variables]
mmu_state_gate_status = [1, 1, 0]
mmu_statistics = {'count': 170, 'quality': -1.0, 'warning': ''}`
        const tokens = highlight(klipperConfigLanguage, code)
        expect(find(tokens, 'mmu_state_gate_status =')).toContain('propertyName')
        expect(find(tokens, 'mmu_statistics =')).toContain('propertyName')
        expect(find(tokens, '-1.0')).toContain('number')
        expect(find(tokens, "'count'")).toContain('string')
        expect(find(tokens, ',')).toContain('punctuation')
        // brackets/braces mid-line are punctuation, not a new section header
        const tree = klipperConfigLanguage.parser.parse(code).toString()
        expect(tree).not.toContain('⚠')
        expect(tree).not.toContain('SectionHeader,SectionHeader')
        expect(tree).toContain('ValuePunctuation')
    })

    it('styles unquoted macro param values as values, not commands', () => {
        const tokens = highlight(
            klipperConfigLanguage,
            `[gcode_macro X]
gcode:
    SET_GCODE_VARIABLE MACRO=TIMELAPSE VARIABLE=v VALUE={tl.macro}
    SET_PIN PIN=my_led VALUE=0.5`
        )
        expect(find(tokens, 'SET_GCODE_VARIABLE')).toContain('variableName')
        expect(find(tokens, 'MACRO')).toContain('variableName')
        expect(find(tokens, 'TIMELAPSE')).toContain('string')
        expect(find(tokens, 'my_led')).toContain('string')
        expect(find(tokens, '0.5')).toContain('number')
        // a jinja value ends the gcode fragment: the next command must not
        // become the value of "VALUE="
        expect(find(tokens, 'tl.macro')).toContain('propertyName')
        expect(find(tokens, 'SET_PIN')).toContain('variableName')
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
    it('highlights commands, params and comments', () => {
        const tokens = highlight(
            gcodeLanguage,
            `G1 X10 Y-5 F3000 S200
M117 hello ; msg comment
; comment`
        )
        expect(find(tokens, 'G1')).toContain('variableName')
        // all letter+number words are parameters (no separate axis color)
        expect(find(tokens, 'X10')).toContain('number')
        expect(find(tokens, 'F3000')).toContain('number')
        expect(find(tokens, 'S200')).toContain('number')
        expect(find(tokens, 'M117')).toContain('variableName')
        expect(find(tokens, ' hello ')).toContain('string')
        // klipper strips ';' comments inside an M117 message too
        expect(find(tokens, '; msg comment')).toContain('comment')
        expect(find(tokens, '; comment')).toContain('comment')
    })
})
