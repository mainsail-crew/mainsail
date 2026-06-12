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
            <panel
                card-class="editor-dialog"
                :icon="isWriteable ? mdiFileDocumentEditOutline : mdiFileDocumentOutline"
                :title="title">
                <template #buttons>
                    <v-btn variant="text" tile class="d-none d-md-flex" @click="dialogDevices = true">
                        <v-icon small class="mr-1">{{ mdiUsb }}</v-icon>
                        {{ $t('Editor.DeviceDialog') }}
                    </v-btn>
                    <v-btn
                        v-if="restartServiceName === 'klipper'"
                        variant="text"
                        tile
                        :href="klipperConfigReference"
                        target="_blank"
                        class="d-none d-md-flex">
                        <v-icon small class="mr-1">{{ mdiHelp }}</v-icon>
                        {{ $t('Editor.ConfigReference') }}
                    </v-btn>
                    <v-btn v-if="existsFileStructure" variant="text" tile class="d-none d-md-flex" @click="toggleFileStructure">
                        <v-icon small class="mr-1">{{ mdiFormatListCheckbox }}</v-icon>
                        {{ $t('Editor.FileStructure') }}
                    </v-btn>
                    <v-btn
                        v-if="restartServiceNameExists"
                        color="primary"
                        variant="text"
                        tile
                        class="d-none d-sm-flex"
                        @click="save(restartServiceName)">
                        <v-icon small class="mr-1">{{ mdiRestart }}</v-icon>
                        {{ $t('Editor.SaveRestart') }}
                    </v-btn>
                    <v-btn v-if="isWriteable" icon tile @click="save(null)">
                        <v-icon>{{ mdiContentSave }}</v-icon>
                    </v-btn>
                    <v-btn icon tile @click="close">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="pa-0 d-flex">
                    <codemirror-async
                        v-if="show"
                        ref="editor"
                        v-model="sourcecode"
                        :name="filename"
                        :file-extension="fileExtension"
                        class="codemirror"
                        :class="{ withSidebar: existsFileStructure && fileStructureSidebar }"
                        @lineChange="lineChanges" />
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
                                    :class="item.type == 'item' ? 'ͼp' : 'ͼt'"
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
                <v-btn color="red" variant="text" v-bind="attrs" style="min-width: auto" tile @click="cancelDownload">
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
                    <v-btn icon tile @click="dialogConfirmChange = false">
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
                    <v-btn variant="text" @click="discardChanges">
                        {{ $t('Editor.DontSave') }}
                    </v-btn>
                    <v-btn variant="text" color="primary" @click="save">
                        {{ $t('Editor.SaveClose') }}
                    </v-btn>
                    <template v-if="restartServiceNameExists">
                        <v-btn variant="text" color="primary" @click="save(restartServiceName)">
                            {{ $t('Editor.SaveRestart') }}
                        </v-btn>
                    </template>
                </v-card-actions>
            </panel>
        </v-dialog>
        <devices-dialog v-model="dialogDevices" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { capitalize, formatFilesize, windowBeforeUnloadFunction } from '@/plugins/helpers'
import { klipperRepos } from '@/store/variables'
import CodemirrorAsync from '@/components/inputs/CodemirrorAsync'
import {
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

const store = useStore()
const { t } = useI18n()
const { printer_state, klipperAppName } = useBase()

const dialogConfirmChange = ref(false)
const dialogDevices = ref(false)
const treeviewItemKeyProp = 'line' as const
const structureActive = ref<number[]>([])
const structureOpen = ref<number[]>([])
const structureActiveChangedBySidebar = ref(false)

const editor = ref<any>(null)

const changed = computed(() => store.state.editor.changed ?? false)
const changedOutput = computed(() => changed.value ? '*' : '')
const show = computed(() => store.state.editor.bool ?? false)
const filepath = computed((): string => store.state.editor.filepath ?? '')
const filename = computed((): string => store.state.editor.filename ?? '')
const filenameWithoutExtension = computed((): string => {
    if (filename.value.lastIndexOf('.')) return filename.value.slice(0, filename.value.lastIndexOf('.'))
    return filename.value
})
const fileExtension = computed(() => {
    if (filename.value.lastIndexOf('.')) return filename.value.slice(filename.value.lastIndexOf('.') + 1)
    return ''
})
const fileroot = computed(() => store.state.editor.fileroot ?? 'gcodes')
const permissions = computed((): string => store.state.editor.permissions ?? 'r')
const isWriteable = computed(() => permissions.value.includes('w'))
const sourcecode = computed({
    get: () => store.state.editor.sourcecode ?? '',
    set: (newVal) => store.dispatch('editor/updateSourcecode', newVal),
})
const loaderBool = computed(() => store.state.editor.loaderBool ?? false)
const loaderProgress = computed(() => store.state.editor.loaderProgress ?? {})
const snackbarHeadline = computed(() => {
    let directionUppercase = t('Editor.Downloading')
    if (loaderProgress.value.direction) directionUppercase = capitalize(loaderProgress.value.direction)
    return t(`Editor.${directionUppercase}`)
})
const availableServices = computed(() => store.state.server.system_info?.available_services ?? [])
const restartAllowedOrPossible = computed(() => {
    if (!isWriteable.value) return null
    if (['printing', 'paused'].includes(printer_state.value)) return null
    return true
})
const restartServiceName = computed(() => {
    if (availableServices.value.includes(filenameWithoutExtension.value) && fileExtension.value === 'conf')
        return filenameWithoutExtension.value
    if (filename.value.startsWith('webcam') && ['conf', 'txt'].includes(fileExtension.value)) return 'webcamd'
    if (filename.value.startsWith('mooncord') && fileExtension.value === 'json') return 'mooncord'
    if (filename.value === 'moonraker.conf') return 'moonraker'
    if (fileExtension.value === 'cfg') return 'klipper'
    return null
})
const restartServiceNameExists = computed(() => {
    if (!restartAllowedOrPossible.value) return false
    if (restartServiceName.value === null) return false
    if (['klipper', 'moonraker'].includes(restartServiceName.value)) return true
    return availableServices.value.includes(restartServiceName.value)
})
const confirmUnsavedChanges = computed(() => store.state.gui.editor.confirmUnsavedChanges ?? false)
const escToClose = computed(() => store.state.gui.editor.escToClose ?? false)
const title = computed(() => {
    const title = filepath.value ? `${filepath.value}/${filename.value}` : filename.value
    if (!isWriteable.value) return `${title} (${t('Editor.FileReadOnly')})`
    return `${title} ${changedOutput.value}`
})
const currentLanguage = computed(() => store.state.gui.general.language)
const klipperConfigReference = computed((): string => {
    const currentLanguageValue = currentLanguage.value
    const klipperRepo = klipperRepos[klipperAppName.value] ?? klipperRepos.Klipper
    let url = klipperRepo.url
    if (klipperRepo.docsLanguages?.includes(currentLanguageValue)) {
        url += `${currentLanguageValue}/`
    }
    url += 'Config_Reference.html'
    return url
})
const fileStructureSidebar = computed({
    get: () => store.state.gui.editor.fileStructureSidebar,
    set: (newVal) => store.dispatch('gui/saveSetting', { name: 'editor.fileStructureSidebar', value: newVal }),
})
const configFileStructure = computed((): ConfigFileSection[] => {
    if (!['conf', 'cfg'].includes(fileExtension.value)) return []
    const lines = sourcecode.value.split(/\n/gi)
    const regex = /^[^#\S]*?(\[(?<section>.*?)]|(?<name>\w+)\s*?[:=])/gim
    const structure: ConfigFileSection[] = []
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const matches = [...line.matchAll(regex)]
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
})
const existsFileStructure = computed(() => configFileStructure.value.length > 0)

function toggleFileStructure() {
    fileStructureSidebar.value = !fileStructureSidebar.value
}

function cancelDownload() {
    store.dispatch('editor/cancelLoad')
}

function escClose() {
    if (escToClose.value) close()
}

function close() {
    if (confirmUnsavedChanges.value) promptUnsavedChanges()
    else store.dispatch('editor/close')
}

function discardChanges() {
    dialogConfirmChange.value = false
    store.dispatch('editor/close')
}

function promptUnsavedChanges() {
    if (!changed.value || !isWriteable.value) store.dispatch('editor/close')
    else dialogConfirmChange.value = true
}

function save(restartServiceName: string | null = null) {
    dialogConfirmChange.value = false
    store.dispatch('editor/saveFile', {
        content: sourcecode.value,
        restartServiceName: restartServiceName,
    })
}

function activeChangesItemClick() {
    structureActiveChangedBySidebar.value = true
}

function activeChanges(activeItems: Array<ConfigFileSection[typeof treeviewItemKeyProp]>) {
    if (!structureActiveChangedBySidebar.value) return
    structureActiveChangedBySidebar.value = false
    if (!activeItems.length) return
    editor.value?.gotoLine(activeItems[0])
}

function lineChanges(line: number) {
    configFileStructure.value?.map((item) => {
        if (item.line == line) {
            structureActive.value = [line]
        } else {
            item.children?.map((child) => {
                if (child.line == line) {
                    structureActive.value = [line]
                    if (!structureOpen.value.includes(item.line)) structureOpen.value.push(item.line)
                }
            })
        }
    })
}

watch(changed, (newVal: boolean) => {
    if (!confirmUnsavedChanges.value) return
    if (newVal) {
        window.addEventListener('beforeunload', windowBeforeUnloadFunction)
        return
    }
    window.removeEventListener('beforeunload', windowBeforeUnloadFunction)
})
</script>
<style scoped>
:deep(.ͼ1 .cm-panel.cm-search *:focus:not(.focus-visible)) {
    outline: none;
}

:deep(.ͼ1 .cm-panel.cm-search input[type='checkbox']) {
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

:deep(.ͼ1 .cm-panel.cm-search input[type='checkbox']::before) {
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

:deep(.ͼ1 .cm-panel.cm-search input[type='checkbox']:checked) {
    background-color: var(--color-primary);
}

:deep(.ͼ1 .cm-panel.cm-search input[type='checkbox']:checked::before) {
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
    width: 300px;
    overflow-y: auto;
    max-height: calc(100vh - 48px);
}
._structure-sidebar-item {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

:deep(.v-treeview-node__level) + .v-treeview-node__level {
    width: 12px;
}
</style>
