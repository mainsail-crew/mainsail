<template>
    <div class="vue-codemirror">
        <div ref="editor" v-observe-visibility="visibilityChanged"></div>
    </div>
</template>

<script lang="ts">
// Inspired by this repo: https://github.com/surmon-china/vue-codemirror

import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ThemeMixin from '@/components/mixins/theme'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState, Prec } from '@codemirror/state'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { HighlightStyle, indentUnit, syntaxHighlighting } from '@codemirror/language'
import { klipperConfig, gcode } from '@/plugins/lezer'
import { KlipperDocsTooltip } from '@/plugins/KlipperDocsTooltip'
import { insertTab, indentLess } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { yaml, yamlLanguage } from '@codemirror/lang-yaml'
import { tags } from '@lezer/highlight'

const yamlDarkHighlightStyle = HighlightStyle.define(
    [
        {
            tag: tags.definition(tags.propertyName),
            color: '#dcdcaa',
        },
    ],
    { scope: yamlLanguage, themeType: 'dark' }
)

const yamlLightHighlightStyle = HighlightStyle.define(
    [
        {
            tag: tags.definition(tags.propertyName),
            color: '#795e26',
        },
    ],
    { scope: yamlLanguage, themeType: 'light' }
)

@Component
export default class Codemirror extends Mixins(BaseMixin, ThemeMixin) {
    private content = ''
    private codemirror: null | EditorView = null
    private cminstance: null | EditorView = null

    @Ref('editor') editor!: HTMLElement

    @Prop({ required: false, default: '' })
    declare readonly code: string

    @Prop({ required: false, default: '' })
    declare value: string

    @Prop({ required: false, default: 'codemirror' })
    declare readonly name: string

    @Prop({ required: false, default: '' })
    declare readonly fileExtension: string

    @Watch('value')
    valueChanged(newVal: string) {
        const cm_value = this.cminstance?.state?.doc.toString()
        if (newVal !== cm_value) {
            this.setCmValue(newVal)
        }
    }

    mounted(): void {
        this.initialize()
    }

    beforeDestroy() {
        this.destroy()
    }

    destroy() {
        this.cminstance?.destroy()
    }

    initialize() {
        this.codemirror = new EditorView({
            parent: this.editor,
        })
        this.cminstance = this.codemirror

        this.$nextTick(() => {
            this.setCmValue(this.code || this.value || this.content)

            this.$emit('ready', this.codemirror)
        })
    }

    setCmValue(content: string) {
        this.cminstance?.setState(EditorState.create({ doc: content, extensions: this.cmExtensions }))
    }

    get cmExtensions() {
        const extensions = [
            EditorView.theme({}, { dark: this.themeMode === 'dark' }),
            basicSetup,
            this.vscodeTheme,
            indentUnit.of(' '.repeat(this.tabSize)),
            keymap.of([
                { key: 'Tab', run: insertTab },
                { key: 'Shift-Tab', run: indentLess },
            ]),
            EditorView.updateListener.of((update) => {
                if (update.selectionSet) {
                    const line = this.cminstance?.state?.doc.lineAt(this.cminstance?.state?.selection.main.head).number
                    this.$emit('lineChange', line)
                }
                this.content = update.state?.doc.toString()
                if (this.$emit) {
                    this.$emit('input', this.content)
                }
            }),
        ]

        if (this.klipperDocsTooltips && this.fileExtension === 'cfg') {
            extensions.push(KlipperDocsTooltip(this.klipperConfigReference))
        }

        if (['cfg', 'conf'].includes(this.fileExtension)) extensions.push(klipperConfig())
        else if (['gcode'].includes(this.fileExtension)) extensions.push(gcode())
        else if (['json'].includes(this.fileExtension)) extensions.push(json())
        else if (['yaml', 'yml'].includes(this.fileExtension)) {
            extensions.push(
                yaml(),
                Prec.highest(syntaxHighlighting(yamlDarkHighlightStyle)),
                Prec.highest(syntaxHighlighting(yamlLightHighlightStyle))
            )
        } else if (['css', 'scss', 'sass'].includes(this.fileExtension)) extensions.push(css())

        return extensions
    }

    visibilityChanged(isVisible: boolean) {
        if (isVisible) this.cminstance?.focus()
    }

    get tabSize() {
        return this.$store.state.gui.editor.tabSize || 2
    }

    get vscodeTheme() {
        return this.themeMode === 'dark' ? vscodeDark : vscodeLight
    }

    gotoLine(line: number) {
        const l = this.cminstance?.state?.doc.line(line)
        if (!l) return

        this.cminstance?.dispatch({
            selection: { head: l.from, anchor: l.to },
            scrollIntoView: true,
        })
    }

    get klipperDocsTooltips() {
        return this.$store.state.gui.editor.klipperDocsTooltips ?? true
    }
}
</script>
