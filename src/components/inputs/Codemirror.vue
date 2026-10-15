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
import { Compartment, EditorState, Prec } from '@codemirror/state'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { indentUnit, syntaxHighlighting } from '@codemirror/language'
import { klipperConfig, gcode } from '@/plugins/codemirror/lezer'
import { KlipperIncludeLinks } from '@/plugins/codemirror/KlipperIncludeLinks'
import { KlipperDocsTooltip } from '@/plugins/codemirror/KlipperDocsTooltip'
import { indentLess } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { yaml } from '@codemirror/lang-yaml'
import { insertSmartTab } from '@/plugins/codemirror/insertSmartTab'
import {
    klipperConfigDarkHighlightStyle,
    klipperConfigLightHighlightStyle,
    yamlDarkHighlightStyle,
    yamlLightHighlightStyle,
} from '@/plugins/codemirror/highlightStyles'

@Component
export default class Codemirror extends Mixins(BaseMixin, ThemeMixin) {
    private content = ''
    private codemirror: null | EditorView = null
    private cminstance: null | EditorView = null
    private cmExtensionsInitialized = false

    @Ref('editor') editor!: HTMLElement

    @Prop({ required: false, default: '' })
    declare readonly code: string

    @Prop({ required: false, default: '' })
    declare value: string

    @Prop({ required: false, default: 'codemirror' })
    declare readonly name: string

    @Prop({ required: false, default: '' })
    declare readonly fileExtension: string

    @Prop({ type: Boolean, default: false })
    declare readonly includeNavigation: boolean

    @Prop({ type: String, default: '' })
    declare readonly includeDirectory: string

    @Prop({ type: Array, default: () => [] })
    declare readonly includeFiles: string[]

    @Prop({ type: Boolean, default: false })
    declare readonly readOnly: boolean

    private editability = new Compartment()
    private includeLinks = new Compartment()

    @Watch('readOnly')
    readOnlyChanged() {
        this.cminstance?.dispatch({ effects: this.editability.reconfigure(this.editabilityExtensions) })
    }

    get editabilityExtensions() {
        return [EditorState.readOnly.of(this.readOnly), EditorView.editable.of(!this.readOnly)]
    }

    get includeLinkExtensions() {
        if (!this.includeNavigation) return []
        return KlipperIncludeLinks(
            (path) => this.$emit('openInclude', path),
            this.$t('Editor.OpenInclude').toString(),
            this.includeDirectory,
            new Set(this.includeFiles)
        )
    }

    @Watch('includeFiles')
    @Watch('includeDirectory')
    @Watch('includeNavigation')
    includeLinksChanged() {
        if (!this.cmExtensionsInitialized) return
        this.cminstance?.dispatch({ effects: this.includeLinks.reconfigure(this.includeLinkExtensions) })
    }

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
            this.cmExtensionsInitialized = true

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
            this.editability.of(this.editabilityExtensions),
            this.includeLinks.of(this.includeLinkExtensions),
            this.vscodeTheme,
            indentUnit.of(' '.repeat(this.tabSize)),
            keymap.of([
                { key: 'Tab', run: insertSmartTab },
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

        if (['cfg', 'conf'].includes(this.fileExtension))
            extensions.push(
                klipperConfig(),
                Prec.highest(syntaxHighlighting(klipperConfigDarkHighlightStyle)),
                Prec.highest(syntaxHighlighting(klipperConfigLightHighlightStyle))
            )
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
