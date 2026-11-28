<template>
    <v-dialog v-model="showDialog" width="400">
        <panel :title="title" card-class="files-name-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-text-field
                    ref="inputField"
                    v-model="name"
                    :label="$t('Files.Name')"
                    :suffix="extension"
                    required
                    :rules="nameRules"
                    @keydown.enter="submit" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn :disabled="!isValid" :loading="isLoading" color="primary" text @click="submit">
                    {{ actionText }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, VModel, Watch } from 'vue-property-decorator'
import type { FocusableRef } from '@/types/vuetify'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import { FileStateFile } from '@/store/files/types'
import { joinPath } from '@/store/files/helpers'
import { splitExtension } from '@/plugins/helpers'
import type { FileRelatedFilesGetter, FilesNameDialogMode } from '@/components/files/types'

/**
 * Dialog to enter a name for a new directory or file, or to rename or duplicate a file or directory.
 * It sends the request itself and only closes when the request was successful.
 */
@Component({
    components: { Panel },
})
export default class FilesNameDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick

    @VModel({ type: Boolean }) showDialog!: boolean
    @Prop({ type: String, required: true }) readonly mode!: FilesNameDialogMode
    /** Directory of the new or existing item, including the root */
    @Prop({ type: String, required: true }) readonly directory!: string
    /** Item to rename or duplicate */
    @Prop({ type: Object, default: null }) readonly item!: FileStateFile | null
    /** Only the name before the extension can be changed when renaming a file */
    @Prop({ type: Boolean, default: false }) readonly keepExtension!: boolean
    /** Files that are renamed together with a file */
    @Prop({ type: Function, default: null }) readonly relatedFiles!: FileRelatedFilesGetter | null
    @Ref() readonly inputField!: FocusableRef

    name = ''
    isLoading = false

    get title() {
        switch (this.mode) {
            case 'createDirectory':
                return this.$t('Files.NewDirectory').toString()
            case 'createFile':
                return this.$t('Files.CreateFile').toString()
            case 'duplicate':
                return this.$t('Files.DuplicateFile').toString()
            default:
                return this.item?.isDirectory
                    ? this.$t('Files.RenameDirectory').toString()
                    : this.$t('Files.RenameFile').toString()
        }
    }

    get actionText() {
        switch (this.mode) {
            case 'rename':
                return this.$t('Files.Rename')
            case 'duplicate':
                return this.$t('Files.Duplicate')
            default:
                return this.$t('Files.Create')
        }
    }

    /** Extension that can't be changed, it is shown as suffix of the input field */
    get extension() {
        if (this.mode !== 'rename' || !this.keepExtension || !this.item || this.item.isDirectory) return ''

        return splitExtension(this.item.filename).extension
    }

    get filename() {
        return this.name + this.extension
    }

    /** Validation error of the current name, or null if it is valid */
    get nameError(): string | null {
        if (this.name === '') return this.$t('Files.InvalidNameEmpty').toString()
        if (this.existsName(this.name)) return this.$t('Files.InvalidNameAlreadyExists').toString()

        return null
    }

    /** The rules change with the error, so the input field validates again, e.g. when a file is created */
    get nameRules() {
        return [this.nameError ?? true]
    }

    get isValid() {
        return this.nameError === null
    }

    @Watch('showDialog')
    onShowDialogChanged(newVal: boolean) {
        if (!newVal) return

        const filename = this.mode === 'rename' || this.mode === 'duplicate' ? (this.item?.filename ?? '') : ''
        this.name = this.extension ? splitExtension(filename).name : filename

        setTimeout(() => {
            this.inputField?.focus()
        }, 200)
    }

    existsName(name: string) {
        return this.$store.getters['files/pathExists'](joinPath(this.directory, name + this.extension))
    }

    async submit() {
        if (!this.isValid || this.isLoading) return

        this.isLoading = true
        const success = await this.sendRequest()
        this.isLoading = false

        if (success) this.closeDialog()
    }

    async sendRequest(): Promise<boolean> {
        const dest = joinPath(this.directory, this.filename)
        const source = joinPath(this.directory, this.item?.filename ?? '')

        switch (this.mode) {
            case 'createDirectory':
                return await this.$store.dispatch('files/createDirectory', dest)
            case 'createFile':
                return await this.$store.dispatch('files/createFile', dest)
            case 'duplicate':
                return await this.$store.dispatch('files/copy', { source, dest })
            default: {
                const success = await this.$store.dispatch('files/move', { source, dest })
                if (success) await this.renameRelatedFiles()

                return success
            }
        }
    }

    /** Renames the related files of a file, e.g. 'video.jpg' to 'renamed.jpg' when 'video.mp4' is renamed */
    async renameRelatedFiles() {
        if (!this.item || this.item.isDirectory || !this.relatedFiles) return

        const oldBase = splitExtension(this.item.filename).name
        const newBase = splitExtension(this.filename).name

        const requests = this.relatedFiles(this.item.filename)
            .filter((related) => related.startsWith(oldBase))
            .filter((related) => this.$store.getters['files/pathExists'](joinPath(this.directory, related)))
            .map((related) =>
                this.$store.dispatch('files/move', {
                    source: joinPath(this.directory, related),
                    dest: joinPath(this.directory, newBase + related.slice(oldBase.length)),
                    silent: true,
                })
            )

        await Promise.all(requests)
    }

    closeDialog() {
        this.showDialog = false
    }
}
</script>
