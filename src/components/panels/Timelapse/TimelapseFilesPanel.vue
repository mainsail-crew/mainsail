<style scoped>
.v-data-table .v-data-table-header__icon {
    margin-left: 7px;
}

.v-data-table th {
    white-space: nowrap;
}

.v-data-table .file-list-cursor:hover {
    cursor: pointer;
}

</style>

<template>
    <div>
        <panel :title="$t('Timelapse.TimelapseFiles')" icon="mdi-file-document-multiple-outline" card-class="timelapse-files-panel">
            <v-card-text>
                <v-row>
                    <v-col class="col-12 d-flex align-center">
                        <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            :label="$t('Timelapse.Search')"
                            single-line
                            outlined
                            clearable
                            hide-details
                            dense
                            style="max-width: 300px;"
                        ></v-text-field>
                        <v-spacer></v-spacer>
                        <v-btn v-if="this.directoryPermissions.includes('w')" @click="createDirectory" :title="$t('Timelapse.CreateNewDirectory')" class="px-2 minwidth-0 ml-3"><v-icon>mdi-folder-plus</v-icon></v-btn>
                        <v-btn @click="refreshFileList" :title="$t('Timelapse.RefreshCurrentDirectory')" class="px-2 minwidth-0 ml-3"><v-icon>mdi-refresh</v-icon></v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text>
                <v-row>
                    <v-col class="col-12 py-2 d-flex align-center">
                        <span><b>{{ $t('Timelapse.CurrentPath') }}:</b> {{ this.currentPath !== 'timelapse' ? "/"+this.currentPath.substring(10) : "/" }}</span>
                        <v-spacer></v-spacer>
                        <template v-if="this.disk_usage !== null">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <b>{{ $t('Timelapse.FreeDisk') }}:</b> {{ formatFilesize(disk_usage.free) }}
                                    </span>
                                </template>
                                <span>
                                    {{ $t('Timelapse.Used') }}: {{ formatFilesize(this.disk_usage.used) }}<br />
                                    {{ $t('Timelapse.Free') }}: {{ formatFilesize(this.disk_usage.free) }}<br />
                                    {{ $t('Timelapse.Total') }}: {{ formatFilesize(this.disk_usage.total) }}
                                </span>
                            </v-tooltip>
                        </template>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider class="mb-3"></v-divider>
            <v-data-table
                :items="displayFiles"
                class="files-table"
                :headers="headers"
                :custom-sort="sortFiles"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :items-per-page.sync="countPerPage"
                :footer-props="{
                    itemsPerPageText: $t('Timelapse.Files'),
                    itemsPerPageAllText: $t('Timelapse.AllFiles'),
                    itemsPerPageOptions: [10,25,50,100,-1]
                }"
                item-key="name"
                :search="search"
                :custom-filter="advancedSearch"
                mobile-breakpoint="0">

                <template slot="items">
                    <td v-for="header in headers" v-bind:key="header.value">{{ header.text }}</td>
                </template>

                <template #no-data>
                    <div class="text-center font-italic">{{ $t('Timelapse.Empty') }}</div>
                </template>

                <template slot="body.prepend" v-if="(currentPath !== 'timelapse')">
                    <tr
                        class="file-list-cursor"
                        @click="clickRowGoBack"
                    >
                        <td class="pr-0 text-center" style="width: 32px;"><v-icon>mdi-folder-upload</v-icon></td>
                        <td class=" " :colspan="headers.length">..</td>
                    </tr>
                </template>

                <template #item="{ index, item }">
                    <tr
                        :key="`${index} ${item.filename}`"
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)"
                        class="file-list-cursor user-select-none"
                    >
                        <td class="pr-0 text-center" style="width: 32px;">
                            <template v-if="item.isDirectory">
                                <v-icon>mdi-folder</v-icon>
                            </template>
                            <template v-else-if="item.filename.endsWith('zip')">
                                <v-icon>mdi-folder-zip-outline</v-icon>
                            </template>
                            <template v-else-if="getThumbnail(item)">
                                <v-tooltip v-if="!item.isDirectory && getThumbnail(item)" top content-class="tooltip__content-opacity1">
                                    <template v-slot:activator="{ on, attrs }">
                                        <vue-load-image>
                                            <img slot="image" :src="getThumbnail(item)" :alt="item.filename" width="32" v-bind="attrs" v-on="on" />
                                            <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                                            <v-icon slot="error">mdi-file</v-icon>
                                        </vue-load-image>
                                    </template>
                                    <span><img :src="getThumbnail(item)" :alt="item.filename" width="250" /></span>
                                </v-tooltip>
                            </template>
                            <template v-else>
                                <v-icon>mdi-file</v-icon>
                            </template>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'size').visible">{{ item.isDirectory ? '--' : formatFilesize(item.size) }}</td>
                        <td class="text-right" v-if="headers.find(header => header.value === 'modified').visible">{{ formatDate(item.modified) }}</td>
                    </tr>
                </template>
            </v-data-table>
        </panel>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="downloadFile(contextMenu.item.filename)" v-if="!contextMenu.item.isDirectory">
                    <v-icon left>mdi-cloud-download</v-icon> {{ $t('Timelapse.Download')}}
                </v-list-item>
                <v-list-item @click="renameDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')">
                    <v-icon left>mdi-rename-box</v-icon> {{ $t('Timelapse.Rename')}}
                </v-list-item>
                <v-list-item @click="renameFile(contextMenu.item)" v-if="!contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')">
                    <v-icon left>mdi-rename-box</v-icon> {{ $t('Timelapse.Rename')}}
                </v-list-item>
                <v-list-item @click="removeFile" v-if="!contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')">
                    <v-icon left>mdi-delete</v-icon> {{ $t('Timelapse.Delete')}}
                </v-list-item>
                <v-list-item @click="deleteDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')">
                    <v-icon left>mdi-delete</v-icon> {{ $t('Timelapse.Delete')}}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogRenameFile.show" max-width="400">
            <panel :title="$t('Timelapse.RenameFile')" card-class="gcode-files-rename-file-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogRenameFile.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        v-model="dialogRenameFile.newName"
                        :label="$t('Timelapse.Name')"
                        ref="inputFieldRenameFile"
                        @keypress.enter="renameFileAction"
                        required
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameFile.show = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameFileAction">{{ $t('Timelapse.Rename') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogCreateDirectory.show" max-width="400">
            <panel :title="$t('Timelapse.NewDirectory')" card-class="gcode-files-new-directory-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogCreateDirectory.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        v-model="dialogCreateDirectory.name"
                        ref="inputFieldCreateDirectory"
                        @keypress.enter="createDirectoryAction"
                        :label="$t('Timelapse.Name')"
                        :rules="input_rules"
                        required
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateDirectory.show = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="createDirectoryAction">{{ $t('Timelapse.Create') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRenameDirectory.show" max-width="400">
            <panel :title="$t('Timelapse.RenameDirectory')" card-class="gcode-files-rename-directory-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogRenameDirectory.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        v-model="dialogRenameDirectory.newName"
                        ref="inputFieldRenameDirectory"
                        :label="$t('Timelapse.Name')"
                        @keyup.enter="renameDirectoryAction"
                        required
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameDirectory.show = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameDirectoryAction">{{ $t('Timelapse.Rename') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogDeleteDirectory.show" max-width="400">
            <panel :title="$t('Timelapse.DeleteDirectory')" card-class="gcode-files-delete-directory-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogDeleteDirectory.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">{{ $t('Timelapse.DeleteDirectoryQuestion', { name: dialogDeleteDirectory.item.filename } )}}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogDeleteDirectory.show = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="deleteDirectoryAction">{{ $t('Timelapse.Delete') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="boolVideoDialog" :max-width="700">
            <panel :title="$t('Timelapse.Video')" icon="mdi-file-video" card-class="timelapse-video-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="boolVideoDialog = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text class="">
                    <v-row>
                        <v-col class="pb-0">
                            <video :src="hostUrl+'server/files/'+videoDialogFilename" controls style="width: 100%;">
                                Sorry, your browser doesn't support embedded videos,
                                but don't worry, you can <a :href="hostUrl+'server/files/'+videoDialogFilename">download it</a>
                                and watch it with your favorite video player!
                            </video>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn text color="primary" :href="hostUrl+'server/files/'+videoDialogFilename" target="_blank">{{ $t('Timelapse.Download') }}</v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>
<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {formatFilesize, formatDate, sortFiles} from '@/plugins/helpers'
import {FileStateFile} from '@/store/files/types'
import Panel from '@/components/ui/Panel.vue'

interface dialogRenameObject {
    show: boolean
    newName: string
    item: FileStateFile
}

@Component({
    components: {Panel}
})
export default class TimelapseFilesPanel extends Mixins(BaseMixin) {
    formatDate = formatDate
    formatFilesize = formatFilesize
    sortFiles = sortFiles

    $refs!: {
        inputFieldRenameFile: any,
        inputFieldCreateDirectory: any,
        inputFieldRenameDirectory: any,
    }

    private search = ''
    private boolVideoDialog = false
    private videoDialogFilename = ''

    private dialogCreateDirectory = {
        show: false,
        name: ''
    }

    private contextMenu = {
        shown: false,
        isDirectory: false,
        touchTimer: undefined,
        x: 0,
        y: 0,
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date()
        }
    }

    private dialogRenameFile: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date()
        }
    }

    private dialogRenameDirectory: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date()
        }
    }

    private dialogDeleteDirectory: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date()
        }
    }

    private input_rules = [
        (value: string) => value.indexOf(' ') === -1 || 'Name contains spaces!'
    ]

    get headers() {
        return [
            { text: '',                                     value: '',                          align: 'left',  configable: false,  visible: true, filterable: false },
            { text: this.$t('Timelapse.Name'),              value: 'filename',                  align: 'left',  configable: false,  visible: true },
            { text: this.$t('Timelapse.Filesize'),          value: 'size',                      align: 'right', configable: true,   visible: true },
            { text: this.$t('Timelapse.LastModified'),      value: 'modified',                  align: 'right', configable: true,   visible: true },
        ]
    }

    get directory() {
        return this.$store.getters['files/getDirectory'](this.currentPath)
    }

    get disk_usage() {
        return this.directory?.disk_usage ?? { used: 0, free: 0, total: 0}
    }

    get directoryPermissions() {
        return this.directory?.permissions ?? 'r'
    }

    get files() {
        return [...this.directory?.childrens ?? []]
    }

    get sortBy() {
        return this.$store.state.gui.view.gcodefiles.sortBy ?? 'modified'
    }

    set sortBy(newVal) {
        if (newVal === undefined) newVal = 'modified'

        this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.sortBy', value: newVal })
    }

    get sortDesc() {
        return this.$store.state.gui.view.gcodefiles.sortDesc ?? true
    }

    set sortDesc(newVal) {
        if (newVal === undefined) newVal = false

        this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.sortDesc', value: newVal })
    }

    get countPerPage() {
        return this.$store.state.gui.view.gcodefiles?.countPerPage ?? 10
    }

    set countPerPage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.countPerPage', value: newVal })
    }

    get displayFiles() {
        return this.files?.filter((file) => {
            if (file.isDirectory) return true

            return (file.filename.endsWith('mp4') || file.filename.endsWith('zip'))
        }) ?? []
    }

    get currentPath() {
        return this.$store.state.gui.view.timelapse.currentPath
    }

    set currentPath(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.timelapse.currentPath', value: newVal })
    }

    createDirectory() {
        this.dialogCreateDirectory.name = ''
        this.dialogCreateDirectory.show = true

        setTimeout(() => {
            this.$refs.inputFieldCreateDirectory?.focus()
        }, 200)
    }

    createDirectoryAction() {
        if (this.dialogCreateDirectory.name.length && this.dialogCreateDirectory.name.indexOf(' ') === -1) {
            this.dialogCreateDirectory.show = false
            this.$socket.emit('server.files.post_directory', { path: this.currentPath+'/'+this.dialogCreateDirectory.name }, { action: 'files/getCreateDir' })
        }
    }

    refreshFileList() {
        this.$socket.emit('server.files.get_directory', { path: this.currentPath }, { action: 'files/getDirectory' })
    }

    advancedSearch(value: string | number, search: string) {
        return value != null &&
            search != null &&
            typeof value === 'string' &&
            value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
    }

    getThumbnail(item: FileStateFile) {
        const filename = item.filename.slice(0, item.filename.lastIndexOf('.'))
        const preview = this.files?.find((file) => file.filename === filename+'.jpg')
        if (preview) {
            return `${this.apiUrl}/server/files/${encodeURI(this.currentPath)}/${encodeURI(preview.filename)}?timestamp=${preview.modified.getTime()}`
        }

        return ''
    }

    clickRow(item: FileStateFile, force = false) {
        if (!this.contextMenu.shown || force) {
            if (force) this.contextMenu.shown = false

            if (item.isDirectory) this.currentPath += '/' + item.filename
            else if (item.filename.endsWith('zip')) {
                this.downloadFile(item.filename)
            } else if (item.filename.endsWith('mp4')) {
                this.videoDialogFilename =  encodeURI(`${this.currentPath}/${item.filename}`)
                this.boolVideoDialog = true
            }
        }
    }

    clickRowGoBack() {
        this.currentPath = this.currentPath.substr(0, this.currentPath.lastIndexOf('/'))
    }

    showContextMenu (e: any, item: FileStateFile) {
        if (!this.contextMenu.shown) {
            e?.preventDefault()
            this.contextMenu.shown = true
            this.contextMenu.x = e?.clientX || e?.pageX || window.screenX / 2
            this.contextMenu.y = e?.clientY || e?.pageY || window.screenY / 2
            this.contextMenu.item = item
            this.$nextTick(() => {
                this.contextMenu.shown = true
            })
        }
    }

    existsFramesZip(item: FileStateFile) {
        const posLastPoint = item.filename.lastIndexOf('.')
        const zipFilename = item.filename.substr(0, posLastPoint)+'.zip'

        return (this.files.findIndex((file) => file.filename === zipFilename) !== -1)
    }

    downloadFile(filename: string) {
        const path = (this.currentPath+'/'+filename)
        const href = this.apiUrl + '/server/files/' + encodeURI(path)

        window.open(href)
    }

    renameFile(item: FileStateFile) {
        const posLastPoint = item.filename.lastIndexOf('.')
        this.dialogRenameFile.newName = item.filename.substr(0, posLastPoint)

        this.dialogRenameFile.item = item
        this.dialogRenameFile.show = true

        setTimeout(() => {
            this.$refs.inputFieldRenameFile?.focus()
        }, 200)
    }

    renameFileAction() {
        const posLastPoint = this.dialogRenameFile.item.filename.lastIndexOf('.')
        const oldNameWithoutExtension = this.dialogRenameFile.item.filename.substr(0, posLastPoint)

        this.dialogRenameFile.show = false
        this.$socket.emit('server.files.move', {
            source: this.currentPath+'/'+this.dialogRenameFile.item.filename,
            dest: this.currentPath+'/'+this.dialogRenameFile.newName+'.mp4'
        }, { action: 'files/getMove' })

        const fileJpg = this.files.find((file) => file.filename === oldNameWithoutExtension+'.jpg')
        if (fileJpg) {
            this.$socket.emit('server.files.move', {
                source: this.currentPath+'/'+oldNameWithoutExtension+'.jpg',
                dest: this.currentPath+'/'+this.dialogRenameFile.newName+'.jpg'
            })
        }
    }

    renameDirectory(item: FileStateFile) {
        this.dialogRenameDirectory.item = item
        this.dialogRenameDirectory.newName = item.filename
        this.dialogRenameDirectory.show = true

        setTimeout(() => {
            this.$refs.inputFieldRenameDirectory?.focus()
        }, 200)
    }

    renameDirectoryAction() {
        this.dialogRenameDirectory.show = false
        this.$socket.emit('server.files.move', {
            source: this.currentPath+'/'+this.dialogRenameDirectory.item.filename,
            dest: this.currentPath+'/'+this.dialogRenameDirectory.newName
        }, { action: 'files/getMove' })
    }

    removeFile() {
        const filename = this.contextMenu.item.filename.slice(0, this.contextMenu.item.filename.lastIndexOf('.'))
        const previewFilename = filename+'.jpg'
        const previewExists = (this.files.findIndex((file) => file.filename === previewFilename) !== -1)

        if(previewExists) this.$socket.emit('server.files.delete_file', { path: this.currentPath+'/'+previewFilename }, { action: 'files/getDeleteFile' })
        this.$socket.emit('server.files.delete_file', { path: this.currentPath+'/'+this.contextMenu.item.filename }, { action: 'files/getDeleteFile' })
    }

    deleteDirectory(item: FileStateFile) {
        this.dialogDeleteDirectory.item = item
        this.dialogDeleteDirectory.show = true
    }

    deleteDirectoryAction() {
        this.dialogDeleteDirectory.show = false
        this.$socket.emit('server.files.delete_directory', { path: this.currentPath+'/'+this.contextMenu.item.filename, force: true }, { action: 'files/getDeleteDir' })
    }
}
</script>
