<style scoped>

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
            <panel card-class="editor-dialog" :icon="(isWriteable ? ' mdi-file-document-edit-outline' : 'mdi-file-document-outline')" :title="(filepath ? filepath.slice(1)+'/': '')+filename+' '+(isWriteable ? changed : '('+$t('Editor.FileReadOnly')+')')">
                <template v-slot:buttons>
                    <v-btn text tile href="https://www.klipper3d.org/Config_Reference.html" v-if="restartServiceName === 'klipper'" target="_blank" class="d-none d-md-flex"><v-icon small class="mr-1">mdi-help</v-icon>{{ $t('Editor.ConfigReference') }}</v-btn>
                    <v-btn v-if="isWriteable" text tile :color="restartServiceName === null ? 'primary' : ''" @click="save(null)" ><v-icon small class="mr-1">mdi-content-save</v-icon><span class="d-none d-sm-inline">{{ $t('Editor.SaveClose') }}</span></v-btn>
                    <v-btn v-if="restartServiceName !== null" color="primary" text tile  @click="save(restartServiceName)" class="d-none d-sm-flex"><v-icon small class="mr-1">mdi-restart</v-icon>{{ $t('Editor.SaveRestart') }}</v-btn>
                    <v-btn icon tile @click="close"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text class="pa-0">
                    <overlay-scrollbars style="height: calc(var(--app-height) - 48px)" :options="{  }">
                        <codemirror ref="editor" v-model="sourcecode" :name="filename" v-bind:file-extension="fileExtension"></codemirror>
                    </overlay-scrollbars>
                </v-card-text>
            </panel>
        </v-dialog>
        <v-snackbar v-model="loaderBool" :timeout="-1" :value="true" fixed right bottom dark>
            <div>
                {{ snackbarHeadline }}<br />
                <strong>{{ filename }}</strong>
            </div>
            <template v-if="loaderProgress.total > 0">
                <span class="mr-1">({{ formatFilesize(loaderProgress.loaded) }}/{{ formatFilesize(loaderProgress.total) }})</span>
                {{ Math.round(100 * loaderProgress.loaded / loaderProgress.total) }} % @ {{ loaderProgress.speed }}/s<br />
                <v-progress-linear class="mt-2" :value="100 * loaderProgress.loaded / loaderProgress.total"></v-progress-linear>
            </template>
            <template v-else>
                <v-progress-linear class="mt-2" indeterminate></v-progress-linear>
            </template>
            <template v-slot:action="{ attrs }">
                <v-btn
                    color="red"
                    text
                    v-bind="attrs"
                    @click="cancelDownload"
                    style="min-width: auto;"
                    tile
                >
                    <v-icon class="0">mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
        <v-dialog v-model="dialogConfirmChange" persistent :width="600">
            <panel card-class="editor-confirm-change-dialog" icon="mdi-help-circle" :title="$t('Editor.UnsavedChanges')" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogConfirmChange = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text class="pt-3">
                    <v-row>
                        <v-col>
                            <p class="body-1 mb-2">{{ $t('Editor.UnsavedChangesMessage', {filename: filename}) }}</p>
                            <p class="body-2">{{ $t('Editor.UnsavedChangesSubMessage') }}</p>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="discardChanges">
                        {{ $t('Editor.DontSave') }}
                    </v-btn>
                    <v-btn text color="primary" @click="save">
                        {{ $t('Editor.SaveClose') }}
                    </v-btn>
                    <template v-if="restartServiceName != null">
                        <v-btn text color="primary" @click="save(restartServiceName)">
                            {{ $t('Editor.SaveRestart') }}
                        </v-btn>
                    </template>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {formatFilesize} from '@/plugins/helpers'
import Codemirror from '@/components/inputs/Codemirror.vue'
import Panel from '@/components/ui/Panel.vue'

@Component({
    components: {Panel, Codemirror}
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

    get permissions(): string {
        return this.$store.state.editor.permissions ?? 'r'
    }

    get isWriteable() {
        return this.permissions.includes('w')
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
        else if (this.filename === 'webcam.conf')
            return 'webcamd'
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
        if (!this.$store.state.editor.changed || !this.isWriteable)
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
