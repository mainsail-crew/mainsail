<template>
    <div>
        <panel
            :title="$t('Timelapse.TimelapseFiles')"
            :icon="mdiFileDocumentMultipleOutline"
            card-class="timelapse-files-panel">
            <file-browser
                :root="ROOT"
                :path="currentPath"
                :items="files"
                :selected.sync="selectedFiles"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :items-per-page.sync="countPerPage"
                :search.sync="search"
                :can-duplicate="false"
                keep-extension
                :related-files="getRelatedFiles"
                :zip-root="ROOT"
                @update:path="updatePath"
                @click:file="openFile">
                <template #item.icon="{ item }">
                    <v-icon v-if="item.isDirectory">{{ mdiFolder }}</v-icon>
                    <v-icon v-else-if="item.filename.endsWith('zip')">{{ mdiFolderZipOutline }}</v-icon>
                    <v-tooltip v-else-if="getThumbnail(item)" top content-class="tooltip__content-opacity1">
                        <template #activator="{ on, attrs }">
                            <vue-load-image>
                                <img
                                    slot="image"
                                    :src="getThumbnail(item)"
                                    :alt="item.filename"
                                    width="32"
                                    v-bind="attrs"
                                    v-on="on" />
                                <div slot="preloader">
                                    <v-progress-circular indeterminate color="primary" />
                                </div>
                                <div slot="error">
                                    <v-icon>{{ mdiFile }}</v-icon>
                                </div>
                            </vue-load-image>
                        </template>
                        <span><img :src="getThumbnail(item)" :alt="item.filename" width="250" /></span>
                    </v-tooltip>
                    <v-icon v-else>{{ mdiFile }}</v-icon>
                </template>
                <template #no-data>
                    <span class="font-italic">{{ $t('Timelapse.Empty') }}</span>
                </template>
            </file-browser>
        </panel>
        <v-dialog v-model="videoDialog.show" :max-width="700">
            <panel
                :title="$t('Timelapse.Video')"
                :icon="mdiFileVideo"
                card-class="timelapse-video-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="videoDialog.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row>
                        <v-col class="pb-0">
                            <video :src="videoDialog.url" controls style="width: 100%">
                                Sorry, your browser doesn't support embedded videos, but don't worry, you can
                                <a :href="videoDialog.url">download it</a>
                                and watch it with your favorite video player!
                            </video>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn text color="primary" :href="videoDialog.url" target="_blank">
                                {{ $t('Timelapse.Download') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import FileBrowser from '@/components/files/FileBrowser.vue'
import Panel from '@/components/ui/Panel.vue'
import { escapePath, splitExtension } from '@/plugins/helpers'
import { joinPath, stripRoot } from '@/store/files/helpers'
import { FileStateDirectoryListing, FileStateFile } from '@/store/files/types'
import {
    mdiCloseThick,
    mdiFile,
    mdiFileDocumentMultipleOutline,
    mdiFileVideo,
    mdiFolder,
    mdiFolderZipOutline,
} from '@mdi/js'

const ROOT = 'timelapse'
const VIDEO_EXTENSION = '.mp4'
const ZIP_EXTENSION = '.zip'
/** The thumbnail of a video is a jpg file with the same name */
const THUMBNAIL_EXTENSION = '.jpg'

@Component({
    components: { FileBrowser, Panel },
})
export default class TimelapseFilesPanel extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiFile = mdiFile
    mdiFileDocumentMultipleOutline = mdiFileDocumentMultipleOutline
    mdiFileVideo = mdiFileVideo
    mdiFolder = mdiFolder
    mdiFolderZipOutline = mdiFolderZipOutline

    ROOT = ROOT

    search = ''
    videoDialog = { show: false, url: '' }

    /** The setting contains the root, e.g. 'timelapse/subdir' */
    get currentPath(): string {
        return stripRoot(this.$store.state.gui.view.timelapse.currentPath ?? ROOT)
    }

    get directory(): FileStateDirectoryListing | null {
        return this.$store.getters['files/getDirectory'](joinPath(ROOT, this.currentPath))
    }

    get allFiles(): FileStateFile[] {
        return this.directory?.items ?? []
    }

    /** Only directories, videos and zip files of the frames are shown, the thumbnails belong to the videos */
    get files(): FileStateFile[] {
        return this.allFiles.filter(
            (file) =>
                file.isDirectory || file.filename.endsWith(VIDEO_EXTENSION) || file.filename.endsWith(ZIP_EXTENSION)
        )
    }

    get selectedFiles(): FileStateFile[] {
        return this.$store.state.gui.view.timelapse.selectedFiles ?? []
    }

    set selectedFiles(newVal: FileStateFile[]) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.selectedFiles', value: newVal })
    }

    get sortBy(): string {
        return this.$store.state.gui.view.timelapse.sortBy ?? 'modified'
    }

    set sortBy(newVal: string) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.sortBy', value: newVal })
    }

    get sortDesc(): boolean {
        return this.$store.state.gui.view.timelapse.sortDesc ?? true
    }

    set sortDesc(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.sortDesc', value: newVal })
    }

    get countPerPage(): number {
        return this.$store.state.gui.view.timelapse.countPerPage ?? 10
    }

    set countPerPage(newVal: number) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.countPerPage', value: newVal })
    }

    updatePath(path: string) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.currentPath', value: joinPath(ROOT, path) })
    }

    getRelatedFiles(filename: string): string[] {
        if (!filename.endsWith(VIDEO_EXTENSION)) return []

        return [splitExtension(filename).name + THUMBNAIL_EXTENSION]
    }

    getThumbnail(item: FileStateFile): string | undefined {
        const thumbnailName = splitExtension(item.filename).name + THUMBNAIL_EXTENSION
        const thumbnail = this.allFiles.find((file) => file.filename === thumbnailName)
        if (!thumbnail) return undefined

        const path = escapePath(joinPath(ROOT, this.currentPath, thumbnail.filename))
        return `${this.apiUrl}/server/files/${path}?timestamp=${thumbnail.modified.getTime()}`
    }

    openFile(item: FileStateFile) {
        const url = `${this.apiUrl}/server/files/${escapePath(joinPath(ROOT, this.currentPath, item.filename))}`

        if (item.filename.endsWith(VIDEO_EXTENSION)) {
            this.videoDialog = { show: true, url }
            return
        }

        window.open(url)
    }
}
</script>
