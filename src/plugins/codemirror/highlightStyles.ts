import { HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { klipperConfigLanguage } from '@/plugins/codemirror/lezer'
import { yamlLanguage } from '@codemirror/lang-yaml'

// config keys (description:, gcode:, ...) in the darker vscode keyword blue,
// so they differ from jinja variables which share the plain propertyName tag
export const klipperConfigDarkHighlightStyle = HighlightStyle.define(
    [
        {
            tag: tags.definition(tags.propertyName),
            color: '#569cd6',
        },
    ],
    { scope: klipperConfigLanguage, themeType: 'dark' }
)

export const klipperConfigLightHighlightStyle = HighlightStyle.define(
    [
        {
            tag: tags.definition(tags.propertyName),
            color: '#0000ff',
        },
    ],
    { scope: klipperConfigLanguage, themeType: 'light' }
)

export const yamlDarkHighlightStyle = HighlightStyle.define(
    [
        {
            tag: tags.definition(tags.propertyName),
            color: '#dcdcaa',
        },
    ],
    { scope: yamlLanguage, themeType: 'dark' }
)

export const yamlLightHighlightStyle = HighlightStyle.define(
    [
        {
            tag: tags.definition(tags.propertyName),
            color: '#795e26',
        },
    ],
    { scope: yamlLanguage, themeType: 'light' }
)
