<style>
    .vue-codemirror .cm-editor {

    }
</style>

<template>
    <div class="vue-codemirror">
        <div ref="codemirror" v-observe-visibility="visibilityChanged"></div>
    </div>
</template>

<script lang="ts">
// Inspired by these repo: https://github.com/surmon-china/vue-codemirror

import {Component, Mixins, Prop, Watch} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import {basicSetup, EditorState} from '@codemirror/basic-setup'
import {mainsailTheme} from '@/plugins/codemirrorTheme'
import {StreamLanguage} from '@codemirror/stream-parser'
import { klipper_config } from '@/plugins/StreamParserKlipperConfig'
import { gcode } from '@/plugins/StreamParserGcode'
import {EditorView, keymap} from '@codemirror/view'
import {indentWithTab} from '@codemirror/commands'
import {json} from '@codemirror/lang-json'

@Component
export default class Codemirror extends Mixins(BaseMixin) {
    private content = ''
    private codemirror: null | EditorView = null
    private cminstance: null | EditorView = null

    $refs!: {
        codemirror: HTMLElement
    }

    @Prop({ required: false, default: '' })
    readonly code!: string

    @Prop({ required: false, default: '' })
    value!: string

    @Prop({ required: false, default: 'codemirror' })
    readonly name!: string

    @Prop({ required: false, default: '' })
    readonly fileExtension!: string

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
            basicSetup,
            mainsailTheme,
            keymap.of([indentWithTab]),
            EditorView.updateListener.of(update => {
                this.content = update.state?.doc.toString()
                if (this.$emit) {
                    this.$emit('input', this.content)
                }
            }),
        ]

        if (['cfg', 'conf'].includes(this.fileExtension))
            extensions.push(StreamLanguage.define(klipper_config))
        else if (['gcode'].includes(this.fileExtension))
            extensions.push(StreamLanguage.define(gcode))
        else if (['json'].includes(this.fileExtension))
            extensions.push(json())

        return extensions
    }

    visibilityChanged(isVisible: boolean) {
        if (isVisible) this.cminstance?.focus()
    }
}
</script>
