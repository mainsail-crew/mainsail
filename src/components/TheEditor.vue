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
            @close="close"
            @keydown.esc="close"
        >
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="close">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>{{ filename }}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn dark text href="https://www.klipper3d.org/Config_Reference.html" v-if="restartServiceName === 'klipper'" target="_blank" class="d-none d-md-flex"><v-icon small class="mr-1">mdi-help</v-icon>{{ $t('Editor.ConfigReference') }}</v-btn>
                        <template v-if="isWriteable">
                            <v-divider white vertical class="d-none d-md-flex" v-if="restartServiceName === 'klipper'"></v-divider>
                            <v-btn dark text @click="save(null)" ><v-icon small class="mr-1">mdi-content-save</v-icon><span class="d-none d-sm-inline">{{ $t('Editor.SaveClose') }}</span></v-btn>
                        </template>
                        <template v-if="restartServiceName != null">
                            <v-divider white vertical class="d-none d-sm-flex"></v-divider>
                            <v-btn dark text @click="save(restartServiceName)" class="d-none d-sm-flex"><v-icon small class="mr-1">mdi-restart</v-icon>{{ $t('Editor.SaveRestart') }}</v-btn>
                        </template>
                    </v-toolbar-items>
                </v-toolbar>
                <v-card-text class="pa-0">
                    <codemirror ref="editor" v-model="sourcecode" v-bind:file-extension="fileExtension"></codemirror>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-snackbar v-model="loaderBool" :timeout="-1" :value="true" fixed right bottom dark>
            <div>
                {{ snackbarHeadline }}<br />
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
import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base"
import {formatFilesize} from "@/plugins/helpers";
import Codemirror from "@/components/inputs/Codemirror.vue";
@Component({
    components: {Codemirror}
})
export default class TheEditor extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize

    refs!: {
        editor: any
    }

    get show() {
        return this.$store.state.editor.bool ?? false
    }

    get filename(): string {
        return this.$store.state.editor.filename ?? ""
    }

    get fileExtension() {
        if (this.filename.lastIndexOf('.')) return this.filename.slice(this.filename.lastIndexOf('.') + 1)

        return ''
    }

    get fileroot() {
        return this.$store.state.editor.fileroot ?? "gcodes"
    }

    get isWriteable() {
        return ['config', 'gcodes'].includes(this.fileroot)
    }

    get sourcecode() {
        return this.$store.state.editor.sourcecode ?? ""
    }

    set sourcecode(newVal) {
        this.$store.dispatch('editor/updateSourcecode', newVal)
    }

    get loaderBool() {
        return this.$store.state.editor.loaderBool ?? false
    }

    get loaderProgress() {
        return this.$store.state.editor.loaderProgress ?? {}
    }

    get snackbarHeadline() {
        let directionUppercase = "Downloading"
        if (this.loaderProgress.direction) {
            directionUppercase = this.loaderProgress.direction?.charAt(0).toUpperCase() + this.loaderProgress.direction?.slice(1)
        }

        return this.$t('Editor.'+directionUppercase)
    }

    get restartServiceName() {
        if (!this.isWriteable) return null
        if (['printing', 'paused'].includes(this.printer_state)) return null

        if (this.filename === "moonraker.conf")
            return "moonraker"
        else if (this.filename.startsWith("webcam") && this.filename.endsWith(".txt"))
            return "webcamd"
        else if (this.filename.startsWith("mooncord") && this.filename.endsWith(".json"))
            return "mooncord"
        else if (this.filename.endsWith(".cfg"))
            return "klipper"

        return null
    }

    cancelDownload() {
        this.$store.dispatch("editor/cancelLoad")
    }

    close() {
        this.$store.dispatch("editor/close")
    }

    save(restartServiceName: string | null = null) {
        this.$store.dispatch('editor/saveFile', {
            content: this.sourcecode,
            restartServiceName: restartServiceName
        })
    }
}
</script>