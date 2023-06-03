<template>
    <div class="vue-codemirror">
        <div ref="codemirror" v-observe-visibility="visibilityChanged"></div>
    </div>
</template>

<script lang="ts">
// Inspired by these repo: https://github.com/surmon-china/vue-codemirror

import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { StreamLanguage } from '@codemirror/language'
import { gcode } from '@/plugins/StreamParserGcode'
import { indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { klipperCfg } from '../../plugins/Codemirror/KlipperCfgLang/lang/klipperCfg'
import { parseErrorLint } from '../../plugins/Codemirror/parseErrorLint'
import { klipperCfgLint } from '../../plugins/Codemirror/KlipperCfgLang/lang/lint'
import { indentUnit } from '@codemirror/language'

// for lezer grammar debugging
/* import { logTree } from '../../plugins/Codemirror/printLezerTree'
import { syntaxTree } from '@codemirror/language'
import { parser } from '../../plugins/Codemirror/KlipperCfgLang/dist/klipperCfgParser.es.js' */

@Component
export default class Codemirror extends Mixins(BaseMixin) {
    private content = ''
    private codemirror: null | EditorView = null
    private cminstance: null | EditorView = null

    declare $refs: {
        codemirror: HTMLElement
    }

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
        // for lezer grammar debugging
       /*  const state = this.cminstance?.state ?? EditorState.create({})
        logTree(syntaxTree(state), state.doc.toString())
        const text = state.doc.toString()
        console.log(parser.parse(text) + '')  */
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
            parent: this.$refs.codemirror,
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
            EditorView.theme({}, { dark: true }),
            basicSetup,
            vscodeDark,
            indentUnit.of(' '.repeat(this.tabSize)),
            parseErrorLint,
            keymap.of([indentWithTab]),
            EditorView.updateListener.of((update) => {
                this.content = update.state?.doc.toString()
                if (this.$emit) {
                    this.$emit('input', this.content)
                }
            }),
        ]

        if ("printer.cfg" === this.name) extensions.push(klipperCfgLint)
        if (['cfg', 'conf'].includes(this.fileExtension)) extensions.push(klipperCfg())
        else if (['gcode'].includes(this.fileExtension)) extensions.push(StreamLanguage.define(gcode))
        else if (['json'].includes(this.fileExtension)) extensions.push(json())
        else if (['css', 'scss', 'sass'].includes(this.fileExtension)) extensions.push(css())

        return extensions
    }

    visibilityChanged(isVisible: boolean) {
        if (isVisible) this.cminstance?.focus()
    }

    get tabSize() {
        return this.$store.state.gui.editor.tabSize || 2
    }
}
</script>
