<style scoped>
    .editor-content-container {
        height: calc(100vh - 64px);
    }
</style>

<template>
    <div>
        <v-dialog persistent v-model="show"
            fullscreen
            hide-overlay
            :transition="false"
            @close="close"
            @keydown.esc="escClose"
        >
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="close">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>{{ filepath ? filepath.slice(1)+"/" : "" }}{{ filename }} {{changed}}</v-toolbar-title>
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
                    <codemirror ref="editor" v-model="sourcecode" :name="filename" v-bind:file-extension="fileExtension"></codemirror>
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
        <v-dialog v-model="dialogConfirmChange" persistent :width="600">
            <v-card dark>
                <v-toolbar flat dense color="primary">
                    <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-help-circle" left></v-icon> {{ $t('Editor.UnsavedChanges') }}
                    </span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" @click="dialogConfirmChange = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-3">
                    <v-container class="pb-0">

                        <v-row>
                            <v-col>
                                <p class="body-1 mb-2">{{ $t('Editor.UnsavedChangesMessage', {filename: filename}) }}</p>
                                <p class="body-2">{{ $t('Editor.UnsavedChangesSubMessage') }}</p>
                            </v-col>
                        </v-row>
                        <v-divider></v-divider>
                        <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn @click="dialogConfirmChange = false">
                                    {{ $t('Editor.Cancel') }}
                                </v-btn>
                                <v-btn @click="discardChanges">
                                    {{ $t('Editor.DontSave') }}
                                </v-btn>
                                <template v-if="restartServiceName != null">
                                    <v-btn @click="save(restartServiceName)">
                                        {{ $t('Editor.SaveRestart') }}
                                    </v-btn>
                                </template>
                                <v-btn color="primary" @click="save">
                                    {{ $t('Editor.SaveClose') }}
                                </v-btn>
                        </v-card-actions>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {formatFilesize} from '@/plugins/helpers'
import Codemirror from '@/components/inputs/Codemirror.vue'

@Component({
    components: {Codemirror}
})
export default class TheEditor extends Mixins(BaseMixin) {
    private dialogConfirmChange = false

    formatFilesize = formatFilesize

    refs!: {
        editor: any
    }

    get changed() {
        return this.$store.state.editor.changed ? '*' : ''
    }

    get show() {
        return this.$store.state.editor.bool ?? false
    }

    get filepath(): string {
        return this.$store.state.editor.filepath ?? ''
    }

    get filename(): string {
        return this.$store.state.editor.filename ?? ''
    }

    get fileExtension() {
        if (this.filename.lastIndexOf('.')) return this.filename.slice(this.filename.lastIndexOf('.') + 1)

        return ''
    }

    get fileroot() {
        return this.$store.state.editor.fileroot ?? 'gcodes'
    }

    get isWriteable() {
        return ['config', 'gcodes'].includes(this.fileroot)
    }

    get sourcecode() {
        return this.$store.state.editor.sourcecode ?? ''
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
        let directionUppercase = this.$t('Files.Downloading')
        if (this.loaderProgress.direction) {
            directionUppercase = this.loaderProgress.direction?.charAt(0).toUpperCase() + this.loaderProgress.direction?.slice(1)
        }

        return this.$t('Editor.'+directionUppercase)
    }

    get restartServiceName() {
        if (!this.isWriteable) return null
        if (['printing', 'paused'].includes(this.printer_state)) return null

        if (this.filename === 'moonraker.conf')
            return 'moonraker'
        else if (this.filename.startsWith('webcam') && this.filename.endsWith('.txt'))
            return 'webcamd'
        else if (this.filename.startsWith('mooncord') && this.filename.endsWith('.json'))
            return 'mooncord'
        else if (this.filename.endsWith('.cfg'))
            return 'klipper'

        return null
    }

    cancelDownload() {
        this.$store.dispatch('editor/cancelLoad')
    }

    escClose() {
        if (this.$store.state.gui.editor.escToClose)
            this.close()
    }

    close() {
        if (this.$store.state.gui.editor.confirmUnsavedChanges)
            this.promptUnsavedChanges()
        else
            this.$store.dispatch('editor/close')
    }

    discardChanges() {
        this.dialogConfirmChange = false
        this.$store.dispatch('editor/close')
    }

    promptUnsavedChanges() {
        if (!this.$store.state.editor.changed)
            this.$store.dispatch('editor/close')
        else
            this.dialogConfirmChange = true
    }

    save(restartServiceName: string | null = null) {
        this.dialogConfirmChange = false

        this.$store.dispatch('editor/saveFile', {
            content: this.sourcecode,
            restartServiceName: restartServiceName
        })
    }
}
</script>
