<template>
    <div>
        <v-dialog
            v-model="show"
            persistent
            fullscreen
            hide-overlay
            :transition="false"
            @close="close"
            @keydown.esc="escClose"
            @keydown.ctrl.shift.s.prevent="restartServiceNameExists && save(restartServiceName)"
            @keydown.meta.shift.s.prevent="restartServiceNameExists && save(restartServiceName)"
            @keydown.ctrl.s.prevent="save(null)"
            @keydown.meta.s.prevent="save(null)">
            <panel card-class="editor-dialog" :icon="editorIcon" :title="title">
                <template #buttons>
                    <v-btn
                        v-if="includeHistory.length"
                        icon
                        tile
                        :title="$t('Editor.GoBack').toString()"
                        :disabled="navigating || loaderBool"
                        @click="goBack">
                        <v-icon>{{ mdiArrowLeft }}</v-icon>
                    </v-btn>
                    <v-btn v-if="!markdownPreview" text tile class="d-none d-md-flex" @click="dialogDevices = true">
                        <v-icon small class="mr-1">{{ mdiUsb }}</v-icon>
                        {{ $t('Editor.DeviceDialog') }}
                    </v-btn>
                    <v-btn v-if="isMarkdown && isWriteable" text tile @click="markdownEditing = !markdownEditing">
                        <v-icon small class="mr-1">
                            {{ markdownToggleIcon }}
                        </v-icon>
                        {{ markdownToggleLabel }}
                    </v-btn>
                    <v-btn
                        v-if="restartServiceName === 'klipper'"
                        text
                        tile
                        :href="klipperConfigReference"
                        target="_blank"
                        class="d-none d-md-flex">
                        <v-icon small class="mr-1">{{ mdiHelp }}</v-icon>
                        {{ $t('Editor.ConfigReference') }}
                    </v-btn>
                    <v-btn v-if="existsFileStructure" text tile class="d-none d-md-flex" @click="toggleFileStructure">
                        <v-icon small class="mr-1">{{ mdiFormatListCheckbox }}</v-icon>
                        {{ $t('Editor.FileStructure') }}
                    </v-btn>
                    <v-btn
                        v-if="restartServiceNameExists"
                        color="primary"
                        text
                        tile
                        class="d-none d-sm-flex"
                        @click="save(restartServiceName)">
                        <v-icon small class="mr-1">{{ mdiRestart }}</v-icon>
                        {{ $t('Editor.SaveRestart') }}
                    </v-btn>
                    <v-btn v-if="isWriteable && !markdownPreview" icon tile @click="save(null)">
                        <v-icon>{{ mdiContentSave }}</v-icon>
                    </v-btn>
                    <v-btn icon tile @click="close">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="pa-0 d-flex">
                    <keep-alive v-if="show" :key="fileroot + '/' + filepath + '/' + filename">
                        <codemirror-async
                            v-if="!markdownPreview"
                            ref="editor"
                            v-model="sourcecode"
                            :name="filename"
                            :file-extension="fileExtension"
                            :include-navigation="includeNavigation"
                            :include-directory="filepath"
                            :include-files="includeFiles"
                            :read-only="navigating"
                            class="codemirror"
                            :class="{ withSidebar: existsFileStructure && fileStructureSidebar }"
                            @openInclude="openInclude"
                            @ready="editorReady"
                            @lineChange="lineChanges" />
                        <markdown-preview v-else :source="sourcecode" :source-url="sourceUrl" />
                    </keep-alive>
                    <div v-if="existsFileStructure && fileStructureSidebar" class="d-none d-md-flex structure-sidebar">
                        <v-treeview
                            activatable
                            dense
                            :active="structureActive"
                            :open="structureOpen"
                            :item-key="treeviewItemKeyProp"
                            :items="configFileStructure"
                            class="w-100"
                            @update:active="activeChanges">
                            <template #label="{ item }">
                                <div
                                    class="cursor-pointer _structure-sidebar-item"
                                    :class="
                                        item.type == 'item' ? '_structure-sidebar-key' : '_structure-sidebar-section'
                                    "
                                    @click="activeChangesItemClick">
                                    {{ item.name }}
                                </div>
                            </template>
                            <template v-if="restartServiceName === 'klipper'" #append="{ item }">
                                <v-btn
                                    v-if="item.type == 'section'"
                                    icon
                                    small
                                    plain
                                    color="grey darken-2"
                                    :href="klipperConfigReference + '#' + item.name.split(' ')[0]"
                                    target="_blank">
                                    <v-icon small class="mr-1">{{ mdiHelpCircle }}</v-icon>
                                </v-btn>
                            </template>
                        </v-treeview>
                    </div>
                </v-card-text>
            </panel>
        </v-dialog>
        <v-snackbar v-model="loaderBool" :timeout="-1" fixed right bottom>
            <div>
                {{ snackbarHeadline }}
                <br />
                <strong>{{ filename }}</strong>
            </div>
            <template v-if="loaderProgress.total > 0">
                <span class="mr-1">
                    ({{ formatFilesize(loaderProgress.loaded) }}/{{ formatFilesize(loaderProgress.total) }})
                </span>
                {{ Math.round((100 * loaderProgress.loaded) / loaderProgress.total) }} % @ {{ loaderProgress.speed }}/s
                <br />
                <v-progress-linear
                    class="mt-2"
                    :value="(100 * loaderProgress.loaded) / loaderProgress.total"></v-progress-linear>
            </template>
            <template v-else>
                <v-progress-linear class="mt-2" indeterminate></v-progress-linear>
            </template>
            <template #action="{ attrs }">
                <v-btn color="red" text v-bind="attrs" style="min-width: auto" tile @click="cancelDownload">
                    <v-icon class="0">{{ mdiClose }}</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
        <v-dialog v-model="dialogConfirmChange" persistent :width="600">
            <panel
                card-class="editor-confirm-change-dialog"
                :icon="mdiHelpCircle"
                :title="$t('Editor.UnsavedChanges')"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile :disabled="navigating || loaderBool" @click="cancelConfirmation">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="pt-3">
                    <v-row>
                        <v-col>
                            <p class="body-1 mb-2">{{ $t('Editor.UnsavedChangesMessage', { filename: filename }) }}</p>
                            <p class="body-2">{{ $t('Editor.UnsavedChangesSubMessage') }}</p>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text :disabled="navigating || loaderBool" @click="discardChanges">
                        {{ $t('Editor.DontSave') }}
                    </v-btn>
                    <v-btn text color="primary" :disabled="navigating || loaderBool" @click="saveAndClose">
                        {{ $t(pendingInclude ? 'Editor.SaveContinue' : 'Editor.SaveClose') }}
                    </v-btn>
                    <template v-if="restartServiceNameExists && !pendingInclude">
                        <v-btn text color="primary" :disabled="loaderBool" @click="save(restartServiceName)">
                            {{ $t('Editor.SaveRestart') }}
                        </v-btn>
                    </template>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-overlay :value="navigating" :z-index="300"><v-progress-circular indeterminate /></v-overlay>
        <devices-dialog v-model="dialogDevices" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { capitalize, escapePath, formatFilesize, windowBeforeUnloadFunction } from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import CodemirrorAsync from '@/components/inputs/CodemirrorAsync'
import type Codemirror from '@/components/inputs/Codemirror.vue'
import {
    mdiArrowLeft,
    mdiClose,
    mdiCloseThick,
    mdiContentSave,
    mdiFileDocumentOutline,
    mdiFileDocumentEditOutline,
    mdiHelp,
    mdiHelpCircle,
    mdiRestart,
    mdiUsb,
    mdiFormatListCheckbox,
} from '@mdi/js'
import DevicesDialog from '@/components/dialogs/DevicesDialog.vue'
import { ConfigFileSection } from '@/store/files/types'
import type { EditorView } from '@codemirror/view'
import { EditorPositionMemory } from '@/plugins/codemirror/EditorPositionMemory'

import axios from 'axios'
import { resolveIncludePath } from '@/plugins/codemirror/configIncludes'

interface IncludeFile {
    path: string
    permissions: string
    size?: number
}

interface IncludeNavigation {
    path: string
    back: boolean
}

const INCLUDE_REQUEST_TIMEOUT = 30_000

const editorPositions = new EditorPositionMemory()

@Component({
    components: {
        DevicesDialog,
        Panel,
        CodemirrorAsync,
        MarkdownPreview: () => import('@/components/inputs/MarkdownPreview.vue'),
    },
})
export default class TheEditor extends Mixins(BaseMixin) {
    navigating = false
    pendingInclude: IncludeNavigation | null = null
    includeFiles: string[] = []
    includeHistory: string[] = []

    dialogConfirmChange = false
    dialogDevices = false
    markdownEditing = false
    treeviewItemKeyProp = 'line' as const
    structureActive: number[] = []
    structureOpen: number[] = []
    structureActiveChangedBySidebar: boolean = false

    formatFilesize = formatFilesize
    private includeFilesRequest = 0

    /**
     * Icons
     */
    mdiCloseThick = mdiCloseThick
    mdiArrowLeft = mdiArrowLeft
    mdiHelp = mdiHelp
    mdiContentSave = mdiContentSave
    mdiRestart = mdiRestart
    mdiClose = mdiClose
    mdiHelpCircle = mdiHelpCircle
    mdiFileDocumentEditOutline = mdiFileDocumentEditOutline
    mdiFileDocumentOutline = mdiFileDocumentOutline
    mdiUsb = mdiUsb
    mdiFormatListCheckbox = mdiFormatListCheckbox

    @Ref() readonly editor!: typeof Codemirror

    get includeNavigation(): boolean {
        return this.fileroot === 'config' && this.fileExtension === 'cfg'
    }

    get changed() {
        return this.$store.state.editor.changed ?? false
    }

    get changedOutput() {
        return this.changed ? '*' : ''
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

    get filenameWithoutExtension(): string {
        if (this.filename.lastIndexOf('.')) return this.filename.slice(0, this.filename.lastIndexOf('.'))

        return this.filename
    }

    get fileExtension() {
        if (this.filename.lastIndexOf('.')) return this.filename.slice(this.filename.lastIndexOf('.') + 1).toLowerCase()

        return ''
    }

    get fileroot() {
        return this.$store.state.editor.fileroot ?? 'gcodes'
    }

    get isMarkdown() {
        return this.fileExtension === 'md'
    }

    get markdownPreview() {
        return this.isMarkdown && (!this.markdownEditing || !this.isWriteable)
    }

    get editorIcon(): string {
        return this.isWriteable && !this.markdownPreview ? this.mdiFileDocumentEditOutline : this.mdiFileDocumentOutline
    }

    get markdownToggleIcon(): string {
        return this.markdownPreview ? this.mdiFileDocumentEditOutline : this.mdiFileDocumentOutline
    }

    get markdownToggleLabel() {
        return this.markdownPreview ? this.$t('Editor.Edit') : this.$t('Editor.Preview')
    }

    get sourceUrl() {
        const path = [this.fileroot, this.filepath, this.filename].filter(Boolean).join('/')
        return `${this.$store.getters['socket/getUrl']}/server/files/${escapePath(path)}`
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
        let directionUppercase = this.$t('Editor.Downloading')
        if (this.loaderProgress.direction) directionUppercase = capitalize(this.loaderProgress.direction)

        return this.$t(`Editor.${directionUppercase}`)
    }

    get availableServices() {
        return this.$store.state.server.system_info?.available_services ?? []
    }

    get restartAllowedOrPossible() {
        if (!this.isWriteable) return null
        if (['printing', 'paused'].includes(this.printer_state)) return null

        return true
    }

    get restartServiceName() {
        // check for generic services <service>.conf (like moonraker.conf, crowsnest.conf, sonar.conf)
        if (this.availableServices.includes(this.filenameWithoutExtension) && this.fileExtension === 'conf')
            return this.filenameWithoutExtension

        // old webcam service DEPRECATED
        if (this.filename.startsWith('webcam') && ['conf', 'txt'].includes(this.fileExtension)) return 'webcamd'

        // check for mooncord config files
        if (this.filename.startsWith('mooncord') && this.fileExtension === 'json') return 'mooncord'

        // fallback for moonraker with multi instances
        if (this.filename === 'moonraker.conf') return 'moonraker'

        // all .cfg files will be klipper config files
        if (this.fileExtension === 'cfg') return 'klipper'

        return null
    }

    get restartServiceNameExists() {
        if (!this.restartAllowedOrPossible) return false

        // hide the button, if there is no service found
        if (this.restartServiceName === null) return false

        // klipper and moonraker uses specific api calls instead of generic service restart
        if (['klipper', 'moonraker'].includes(this.restartServiceName)) return true

        return this.availableServices.includes(this.restartServiceName)
    }

    get confirmUnsavedChanges() {
        return this.$store.state.gui.editor.confirmUnsavedChanges ?? false
    }

    get escToClose() {
        return this.$store.state.gui.editor.escToClose ?? false
    }

    get title() {
        const title = this.filepath ? `${this.filepath}/${this.filename}` : this.filename

        if (!this.isWriteable) return `${title} (${this.$t('Editor.FileReadOnly')})`

        return `${title} ${this.changedOutput}`
    }

    get fileStructureSidebar() {
        return this.$store.state.gui.editor.fileStructureSidebar
    }

    set fileStructureSidebar(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'editor.fileStructureSidebar', value: newVal })
    }

    get configFileStructure(): ConfigFileSection[] {
        if (!['conf', 'cfg'].includes(this.fileExtension)) return []

        const lines = this.sourcecode.split(/\n/gi)
        const regex = /^[^#\S]*?(\[(?<section>.*?)]|(?<name>\w+)\s*?[:=])/gim
        const structure: ConfigFileSection[] = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const matches = [...line.matchAll(regex)]

            // break if no matches were found
            if (matches.length === 0) continue

            const match = matches[0]
            if (match['groups']['section']) {
                structure.push({
                    name: match['groups']['section'],
                    type: 'section',
                    line: i + 1,
                    children: [],
                })

                continue
            }

            if (structure.length && match['groups']['name']) {
                structure[structure.length - 1]['children'].push({
                    name: match['groups']['name'],
                    type: 'item',
                    line: i + 1,
                })
            }
        }

        return structure
    }

    get existsFileStructure() {
        return this.configFileStructure.length > 0
    }

    async loadIncludeFiles() {
        const request = ++this.includeFilesRequest
        const response = await axios.get<{ result: IncludeFile[] }>(
            this.$store.getters['socket/getUrl'] + '/server/files/list',
            { params: { root: 'config' }, timeout: INCLUDE_REQUEST_TIMEOUT }
        )
        if (request !== this.includeFilesRequest || !this.show || !this.includeNavigation) return null
        const files = response.data.result.filter((file) => file.permissions.includes('r'))
        this.includeFiles = files.map((file) => file.path)
        return files
    }

    openInclude(include: string) {
        if (!this.includeNavigation) return
        const path = resolveIncludePath(this.filepath, include)
        if (path) this.requestNavigation({ path, back: false })
    }

    goBack() {
        const path = this.includeHistory[this.includeHistory.length - 1]
        if (path) this.requestNavigation({ path, back: true })
    }

    requestNavigation(target: IncludeNavigation) {
        if (this.navigating || this.loaderBool || this.dialogConfirmChange) return
        if (target.path === [this.filepath, this.filename].filter(Boolean).join('/')) return
        if (this.confirmUnsavedChanges && this.changed && this.isWriteable) {
            this.pendingInclude = target
            this.dialogConfirmChange = true
            return
        }
        void this.navigateInclude(target)
    }

    async navigateInclude(target: IncludeNavigation, save = false) {
        if (this.navigating || this.loaderBool) return
        this.navigating = true
        try {
            const view = this.editor?.cminstance
            if (view && this.fileroot === 'config') editorPositions.remember(view, this.editorPositionKey)
            await this.$nextTick()
            const files = await this.loadIncludeFiles()
            if (!files) return
            const file = files.find((file) => file.path === target.path)
            if (!file) {
                this.$toast.error(this.$t('Editor.IncludeNotFound', { path: target.path }).toString())
                return
            }
            if (save) {
                const saved = await this.$store.dispatch('editor/saveFile', {
                    content: this.sourcecode,
                    restartServiceName: null,
                    timeout: INCLUDE_REQUEST_TIMEOUT,
                })
                if (!saved) return
            }
            const previousPath = [this.filepath, this.filename].filter(Boolean).join('/')
            const separator = file.path.lastIndexOf('/')
            const opened = await this.$store.dispatch('editor/openFile', {
                root: 'config',
                path: file.path.slice(0, Math.max(0, separator)),
                filename: file.path.slice(separator + 1),
                permissions: file.permissions,
                size: file.size,
                timeout: INCLUDE_REQUEST_TIMEOUT,
            })
            if (!opened) return
            if (target.back) this.includeHistory.pop()
            else this.includeHistory.push(previousPath)
            this.cancelConfirmation()
            this.structureActive = []
            this.structureOpen = []
            await this.$nextTick()
            const nextView = this.editor?.cminstance
            if (nextView && this.fileroot === 'config') editorPositions.restore(nextView, this.editorPositionKey)
        } catch {
            this.$toast.error(this.$t('Editor.FailedOpen', { filename: target.path }).toString())
        } finally {
            this.navigating = false
        }
    }

    cancelConfirmation() {
        this.dialogConfirmChange = false
        this.pendingInclude = null
    }

    async saveAndClose() {
        if (this.navigating || this.loaderBool) return
        if (this.pendingInclude) return this.navigateInclude(this.pendingInclude, true)

        const saved = await this.$store.dispatch('editor/saveFile', {
            content: this.sourcecode,
            restartServiceName: null,
        })
        if (saved) {
            this.cancelConfirmation()
            this.$store.dispatch('editor/close')
        }
    }

    toggleFileStructure() {
        this.fileStructureSidebar = !this.fileStructureSidebar
    }

    editorReady(view: EditorView) {
        if (this.includeNavigation && !this.navigating) {
            void this.loadIncludeFiles().catch(() => {})
        }

        if (this.fileroot !== 'config') return

        editorPositions.restore(view, this.editorPositionKey)
    }

    get editorPositionKey() {
        return JSON.stringify([this.$store.getters['socket/getUrl'], this.fileroot, this.filepath, this.filename])
    }

    cancelDownload() {
        this.$store.dispatch('editor/cancelLoad')
    }

    escClose() {
        if (this.dialogConfirmChange || this.navigating) return
        if (this.escToClose) this.close()
    }

    close() {
        if (this.navigating) return
        if (this.confirmUnsavedChanges) this.promptUnsavedChanges()
        else this.$store.dispatch('editor/close')
    }

    discardChanges() {
        if (this.navigating || this.loaderBool) return
        if (this.pendingInclude) return this.navigateInclude(this.pendingInclude)
        this.dialogConfirmChange = false
        this.$store.dispatch('editor/close')
    }

    promptUnsavedChanges() {
        if (!this.changed || !this.isWriteable) this.$store.dispatch('editor/close')
        else this.dialogConfirmChange = true
    }

    save(restartServiceName: string | null = null) {
        if (!this.isWriteable || this.navigating || this.loaderBool) return

        this.dialogConfirmChange = false

        this.$store.dispatch('editor/saveFile', {
            content: this.sourcecode,
            restartServiceName: restartServiceName,
        })
    }

    // Relies on event bubbling to flip the flag before treeview active change is handled
    activeChangesItemClick() {
        this.structureActiveChangedBySidebar = true
    }

    activeChanges(activeItems: Array<ConfigFileSection[typeof this.treeviewItemKeyProp]>) {
        if (!this.structureActiveChangedBySidebar) {
            return
        }

        this.structureActiveChangedBySidebar = false

        if (!activeItems.length) {
            return
        }

        this.editor?.gotoLine(activeItems[0])
    }

    lineChanges(line: number) {
        this.configFileStructure?.map((item) => {
            if (item.line == line) {
                this.structureActive = [line]
            } else {
                item.children?.map((child) => {
                    if (child.line == line) {
                        this.structureActive = [line]
                        if (!this.structureOpen.includes(item.line)) this.structureOpen.push(item.line)
                    }
                })
            }
        })
    }

    @Watch('changed')
    changedChanged(newVal: boolean) {
        if (!this.confirmUnsavedChanges) return

        if (newVal) {
            window.addEventListener('beforeunload', windowBeforeUnloadFunction)
            return
        }

        window.removeEventListener('beforeunload', windowBeforeUnloadFunction)
    }

    @Watch('show')
    showChanged(show: boolean) {
        this.markdownEditing = false
        if (show) return
        this.includeFilesRequest++
        this.cancelConfirmation()
        this.includeFiles = []
        this.includeHistory = []
    }
}
</script>
<style scoped>
::v-deep .ͼ1 .cm-panel.cm-search *:focus:not(.focus-visible) {
    outline: none;
}

::v-deep .ͼ1 .cm-panel.cm-search input[type='checkbox'] {
    width: 2.2em;
    height: 2.2em;
    color: dodgerblue;
    vertical-align: middle;
    -webkit-appearance: none;
    border: 10px;
    outline: 0;
    flex-grow: 0;
    border-radius: 4px;
    background: var(--v-toolbar-base);
    transition: background 300ms;
    cursor: pointer;
    margin-right: 0.5em;
}

/* Pseudo element for check styling */

::v-deep .ͼ1 .cm-panel.cm-search input[type='checkbox']::before {
    content: '';
    color: transparent;
    display: block;
    width: inherit;
    height: inherit;
    border-radius: inherit;
    border: 2px;
    background-color: transparent;
    background-size: contain;
    box-shadow: inset 0 0 0 1px #ccd3d8;
    font-size: 16px;
}

/* Checked */

::v-deep .ͼ1 .cm-panel.cm-search input[type='checkbox']:checked {
    background-color: var(--color-primary);
}

::v-deep .ͼ1 .cm-panel.cm-search input[type='checkbox']:checked::before {
    box-shadow: none;
    background-color: var(--color-primary);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E %3Cpath d='M15.88 8.29L10 14.17l-1.88-1.88a.996.996 0 1 0-1.41 1.41l2.59 2.59c.39.39 1.02.39 1.41 0L17.3 9.7a.996.996 0 0 0 0-1.41c-.39-.39-1.03-.39-1.42 0z' fill='%23fffff'/%3E %3C/svg%3E");
}

@media screen and (min-width: 960px) {
    .codemirror:not(.withSidebar) {
        width: 100%;
    }
    .codemirror.withSidebar {
        width: calc(100% - 300px);
    }
}

.structure-sidebar {
    position: relative;
    z-index: 1;
    width: 300px;
    overflow-y: auto;
    max-height: calc(100vh - 48px);
    border-left: 1px solid #272727;
    box-shadow: -4px 0 8px rgba(0, 0, 0, 0.35);
    clip-path: inset(0 0 0 -12px);
}

html.theme--light .structure-sidebar {
    border-left-color: rgba(0, 0, 0, 0.12);
    box-shadow: -4px 0 8px rgba(0, 0, 0, 0.12);
}

._structure-sidebar-item {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

._structure-sidebar-section {
    color: #4ec9b0;
}

._structure-sidebar-key {
    color: #569cd6;
}

html.theme--light ._structure-sidebar-section {
    color: #267f99;
}

html.theme--light ._structure-sidebar-key {
    color: #0000ff;
}

::v-deep .v-treeview-node__level + .v-treeview-node__level {
    width: 12px;
}
</style>
