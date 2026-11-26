<template>
    <div>
        <panel
            :title="$t('Machine.ConfigFilesPanel.ConfigFiles')"
            card-class="machine-configfiles-panel"
            :icon="mdiInformation"
            :collapsible="true">
            <file-browser
                :root="root"
                :path="currentPath"
                :items="files"
                :selected.sync="selectedFiles"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :items-per-page.sync="countPerPage"
                :upload-accept="[]"
                can-create-file
                @update:path="updatePath"
                @click:file="openFile">
                <template #toolbar-prepend>
                    <v-select
                        v-model="root"
                        class="machine-configfiles-panel__root-select"
                        :items="registeredDirectoriesSelectItems"
                        :label="$t('Machine.ConfigFilesPanel.Root')"
                        outlined
                        hide-details
                        dense
                        attach=".machine-configfiles-panel__root-select" />
                </template>
                <template #toolbar-append>
                    <v-menu offset-y left :title="$t('Machine.ConfigFilesPanel.SetupCurrentList')">
                        <template #activator="{ on, attrs }">
                            <v-btn class="px-2 minwidth-0 ml-3" v-bind="attrs" v-on="on">
                                <v-icon>{{ mdiCog }}</v-icon>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item class="minHeight36">
                                <v-checkbox
                                    v-model="showHiddenFiles"
                                    class="mt-0"
                                    hide-details
                                    :label="$t('Machine.ConfigFilesPanel.HiddenFiles')" />
                            </v-list-item>
                            <v-list-item class="minHeight36">
                                <v-checkbox
                                    v-model="hideBackupFiles"
                                    class="mt-0"
                                    hide-details
                                    :label="$t('Machine.ConfigFilesPanel.HideBackupFiles')" />
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </template>
                <template #context-menu="{ item }">
                    <v-list-item @click="openFile(item)">
                        <v-icon class="mr-1">{{ mdiFileDocumentEditOutline }}</v-icon>
                        {{
                            item.permissions.includes('w')
                                ? $t('Machine.ConfigFilesPanel.EditFile')
                                : $t('Machine.ConfigFilesPanel.ShowFile')
                        }}
                    </v-list-item>
                </template>
                <template #root-missing>
                    <v-card-text>
                        <v-alert
                            dense
                            text
                            type="warning"
                            elevation="2"
                            class="mx-auto mt-6"
                            max-width="500"
                            :icon="mdiLockOutline">
                            {{ $t('Machine.ConfigFilesPanel.ConfigRootDirectoryDoesntExists') }}
                        </v-alert>
                    </v-card-text>
                </template>
            </file-browser>
        </panel>
        <v-dialog
            v-model="imageDialog.show"
            hide-overlay
            fullscreen
            class="fill-height"
            @keydown.esc="closeImageDialog">
            <panel
                :title="imageDialog.name"
                card-class="maschine-configfiles-imageviewer-dialog"
                style="position: relative">
                <template #buttons>
                    <v-btn icon tile @click="closeImageDialog">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <div class="d-flex justify-center" style="max-height: calc(var(--app-height) - 64px); overflow: auto">
                    <img
                        v-if="imageDialog.url"
                        :src="imageDialog.url"
                        style="max-height: 100%; width: auto; max-width: 100%; object-fit: contain"
                        alt="image" />
                    <div v-else-if="imageDialog.svg" class="fill-width" v-html="imageDialog.svg" />
                </div>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import FileBrowser from '@/components/files/FileBrowser.vue'
import Panel from '@/components/ui/Panel.vue'
import { escapePath } from '@/plugins/helpers'
import { getExtension, joinPath } from '@/store/files/helpers'
import { FileStateDirectoryListing, FileStateFile } from '@/store/files/types'
import { hiddenRootDirectories } from '@/store/variables'
import { mdiCloseThick, mdiCog, mdiFileDocumentEditOutline, mdiInformation, mdiLockOutline } from '@mdi/js'

const IMAGE_EXTENSIONS = ['.png', '.jpeg', '.jpg', '.gif', '.bmp', '.tif']
const KLIPPER_BACKUP_FILE = /^printer-\d{8}_\d{6}\.cfg$/
const CROWSNEST_BACKUP_FILE = /^crowsnest\.conf\.\d{4}-\d{2}-\d{2}-\d{4}$/

@Component({
    components: { FileBrowser, Panel },
})
export default class ConfigFilesPanel extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiCog = mdiCog
    mdiFileDocumentEditOutline = mdiFileDocumentEditOutline
    mdiInformation = mdiInformation
    mdiLockOutline = mdiLockOutline

    imageDialog: { show: boolean; name: string; url: string | null; svg: string | null } = {
        show: false,
        name: '',
        url: null,
        svg: null,
    }

    get root(): string {
        return this.$store.state.gui.view.configfiles.rootPath
    }

    set root(newVal: string) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.rootPath', value: newVal })
        this.updatePath('')
        this.selectedFiles = []
    }

    get currentPath(): string {
        return this.$store.state.gui.view.configfiles.currentPath
    }

    set currentPath(newVal: string) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.currentPath', value: newVal })
    }

    get directory(): FileStateDirectoryListing | null {
        return this.$store.getters['files/getDirectory'](joinPath(this.root, this.currentPath))
    }

    get files(): FileStateFile[] {
        return (this.directory?.items ?? []).filter((file) => {
            if (!this.showHiddenFiles && file.filename.startsWith('.')) return false
            if (!this.hideBackupFiles) return true

            return (
                !KLIPPER_BACKUP_FILE.test(file.filename) &&
                !CROWSNEST_BACKUP_FILE.test(file.filename) &&
                !file.filename.endsWith('.bkp')
            )
        })
    }

    get selectedFiles(): FileStateFile[] {
        return this.$store.state.gui.view.configfiles.selectedFiles ?? []
    }

    set selectedFiles(newVal: FileStateFile[]) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.selectedFiles', value: newVal })
    }

    get countPerPage(): number {
        return this.$store.state.gui.view.configfiles.countPerPage
    }

    set countPerPage(newVal: number) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.countPerPage', value: newVal })
    }

    get showHiddenFiles(): boolean {
        return this.$store.state.gui.view.configfiles.showHiddenFiles
    }

    set showHiddenFiles(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.showHiddenFiles', value: newVal })
    }

    get hideBackupFiles(): boolean {
        return this.$store.state.gui.view.configfiles.hideBackupFiles
    }

    set hideBackupFiles(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.hideBackupFiles', value: newVal })
    }

    get sortBy(): string {
        return this.$store.state.gui.view.configfiles.sortBy
    }

    set sortBy(newVal: string) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.sortBy', value: newVal })
    }

    get sortDesc(): boolean {
        return this.$store.state.gui.view.configfiles.sortDesc
    }

    set sortDesc(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.sortDesc', value: newVal })
    }

    get registeredDirectoriesSelectItems(): string[] {
        const registeredDirectories: string[] = this.$store.state.server.registered_directories ?? []
        const items = registeredDirectories.filter((dir) => !hiddenRootDirectories.includes(dir)).sort()
        // the config root is always selectable, the file browser shows a warning if it is missing
        if (!items.includes('config')) items.push('config')

        return items
    }

    updatePath(path: string) {
        this.currentPath = path ? `/${path}` : ''
    }

    openFile(item: FileStateFile) {
        const extension = getExtension(item.filename)
        const path = escapePath(joinPath(this.root, this.currentPath, item.filename))
        const url = `${this.apiUrl}/server/files/${path}?t=${Date.now()}`

        if (extension === '.svg') {
            this.openSvg(item.filename, url)
            return
        }

        if (IMAGE_EXTENSIONS.includes(extension)) {
            this.imageDialog = { show: true, name: item.filename, url, svg: null }
            return
        }

        this.$store.dispatch('editor/openFile', {
            root: this.root,
            path: this.currentPath,
            filename: item.filename,
            size: item.size,
            permissions: item.permissions,
        })
    }

    async openSvg(name: string, url: string) {
        const svg = await fetch(url).then((res) => res.text())

        this.imageDialog = { show: true, name, url: null, svg }
    }

    closeImageDialog() {
        this.imageDialog = { show: false, name: '', url: null, svg: null }
    }
}
</script>
