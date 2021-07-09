<style scoped>
    .editor-content-container {
        height: calc(100vh - 64px);
    }
</style>

<template>
    <div>
        <v-dialog v-model="show"
                  fullscreen
                  hide-overlay
                  transition="dialog-bottom-transition"
                  @close="close">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="close">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>{{ filename }}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn dark text @click="save">
                            <v-icon small class="mr-1">mdi-content-save</v-icon>
                            <span class="d-none d-sm-inline">{{ $t('Editor.SaveClose') }}</span>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-card-text class="pa-0">
                    <perfect-scrollbar class="editor-content-container">
                        <div ref="editor" id="editor"></div>
                    </perfect-scrollbar>
                </v-card-text>
<!--                class="mainsail-editor"-->
            </v-card>
        </v-dialog>
        <v-snackbar
            :timeout="-1"
            :value="true"
            fixed
            right
            bottom
            dark
            v-model="loaderBool"
        >
            <div>
                {{ $t('Editor.Downloading') }}<br />
                <strong>{{ filename }}</strong>
            </div>
            <span v-if="loaderProgress.total > 1" class="mr-1">({{ formatFilesize(loaderProgress.loaded) }}/{{ formatFilesize(loaderProgress.total) }})</span>
            {{ Math.round(100 * loaderProgress.loaded / loaderProgress.total) }} % @ {{ loaderProgress.speed }}/s<br />
            <v-progress-linear class="mt-2" :value="100 * loaderProgress.loaded / loaderProgress.total"></v-progress-linear>
            <template v-slot:action="{ attrs }">
                <v-btn
                    color="red"
                    text
                    v-bind="attrs"
                    @click="cancelDownload"
                    style="min-width: auto;"
                >
                    <v-icon class="0">mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script lang="ts">
import {Component, Mixins, Watch} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base"
import {formatFilesize} from "@/plugins/helpers";

import {StreamLanguage} from "@codemirror/stream-parser"
import {yaml} from "@codemirror/legacy-modes/mode/yaml"
import {moxer} from "@/plugins/codemirrorTheme"
import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';

@Component
export default class TheEditor extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize

    $refs!: {
        editor: HTMLElement
    }

    get show() {
        return this.$store.state.editor.bool ?? false
    }

    get filename() {
        return this.$store.state.editor.filename ?? ""
    }

    get sourcecode() {
        return this.$store.state.editor.sourcecode ?? ""
    }

    get loaderBool() {
        return this.$store.state.editor.loaderBool ?? false
    }

    get loaderProgress() {
        return this.$store.state.editor.loaderProgress
    }

    cancelDownload() {
        this.$store.dispatch("editor/cancelLoad")
    }

    close() {
        this.$store.dispatch("editor/close")
    }

    save() {
        window.console.log("closeEditor")
    }

    @Watch('sourcecode')
    sourcecodeChanged(newVal: string) {
        window.console.log("watch sourcecode")
        if (newVal !== "") {
            setTimeout(() => {

                const initialState = EditorState.create({
                    doc: newVal,
                    extensions: [
                        basicSetup,
                        moxer,
                        StreamLanguage.define(yaml)
                    ],
                })

                const view = new EditorView({
                    parent: this.$refs.editor,
                    state: initialState,
                })
            }, 200)
        }
    }
}
</script>