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
        <v-card class="mb-3">
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading align-baseline"><v-icon left>mdi-file-document-multiple-outline</v-icon>{{ $t("Timelapse.TimelapseFiles")}}</span>
                </v-toolbar-title>
            </v-toolbar>
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
                        <v-btn @click="createDirectory" :title="$t('Timelapse.CreateNewDirectory')" color="grey darken-3" class="px-2 minwidth-0 ml-3"><v-icon>mdi-folder-plus</v-icon></v-btn>
                        <v-btn @click="refreshFileList" :title="$t('Timelapse.RefreshCurrentDirectory')" color="grey darken-3" class="px-2 minwidth-0 ml-3"><v-icon>mdi-refresh</v-icon></v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text>
                <v-row>
                    <v-col class="col-12 py-2 d-flex align-center">
                        <span><b>{{ $t('Timelapse.CurrentPath') }}:</b> {{ this.currentPath !== 'timelapse' ? "/"+this.currentPath.substring(7) : "/" }}</span>
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
                :items="mp4Files"
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
                    <div class="text-center">{{ $t('Timelapse.Empty') }}</div>
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
                            <template v-else>
                                <template v-if="getThumbnail(item)">
                                    <v-tooltip v-if="!item.isDirectory && getThumbnail(item)" top content-class="tooltip__content-opacity1">
                                        <template v-slot:activator="{ on, attrs }">
                                            <vue-load-image>
                                                <img slot="image" :src="getThumbnail(item)" :alt="item.filename" width="32" height="32" v-bind="attrs" v-on="on" />
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
                            </template>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'size').visible">{{ item.isDirectory ? '--' : formatFilesize(item.size) }}</td>
                        <td class="text-right" v-if="headers.find(header => header.value === 'modified').visible">{{ formatDate(item.modified) }}</td>
                    </tr>
                </template>
            </v-data-table>
        </v-card>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="downloadFile" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-cloud-download</v-icon> {{ $t('Timelapse.Download')}}
                </v-list-item>
                <v-list-item @click="renameDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> {{ $t('Timelapse.Rename')}}
                </v-list-item>
                <v-list-item @click="renameFile(contextMenu.item)" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> {{ $t('Timelapse.Rename')}}
                </v-list-item>
                <v-list-item @click="removeFile" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('Timelapse.Delete')}}
                </v-list-item>
                <v-list-item @click="deleteDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('Timelapse.Delete')}}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogCreateDirectory.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Timelapse.NewDirectory') }}</v-card-title>
                <v-card-text>
                    {{ $t('Timelapse.PleaseEnterANewDirectoryName') }}
                    <v-text-field label="Name" :rules="input_rules" @keypress.enter="createDirectoryAction" required v-model="dialogCreateDirectory.name" ref="inputFieldCreateDirectory"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateDirectory.show = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="createDirectoryAction">{{ $t('Timelapse.Create') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogRenameFile.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Timelapse.RenameFile')}}</v-card-title>
                <v-card-text>
                    <v-text-field :label="$t('Timelapse.Name')" required v-model="dialogRenameFile.newName" ref="inputFieldRenameFile"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameFile.show = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameFileAction">{{ $t('Timelapse.Rename') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogRenameDirectory.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Timelapse.RenameDirectory') }}</v-card-title>
                <v-card-text>
                    <v-text-field label="Name" required v-model="dialogRenameDirectory.newName" ref="inputFieldRenameDirectory"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameDirectory.show = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameDirectoryAction">{{ $t('Timelapse.Rename') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDeleteDirectory.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Timelapse.DeleteDirectory') }}</v-card-title>
                <v-card-text>
                    <p class="mb-0">{{ $t('Timelapse.DeleteDirectoryQuestion', { name: dialogDeleteDirectory.item.filename } )}}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogDeleteDirectory.show = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="deleteDirectoryAction">{{ $t('Timelapse.Delete') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script lang="ts">
import {Component, Mixins, Watch} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {findDirectory, formatFilesize, formatDate, sortFiles} from '@/plugins/helpers'
import {FileStateFile} from '@/store/files/types'

interface dialogRenameObject {
    show: boolean
    newName: string
    item: FileStateFile
}

@Component
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
    private files: FileStateFile[] | null = []
    private currentPath = 'timelapse'

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
            modified: new Date()
        }
    }

    private dialogRenameFile: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
            modified: new Date()
        }
    }

    private dialogRenameDirectory: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
            modified: new Date()
        }
    }

    private dialogDeleteDirectory: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
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

    get filetree() {
        return this.$store.state.files.filetree ?? []
    }

    get disk_usage() {
        return this.$store.getters['files/getDiskUsage'](this.currentPath)
    }

    get sortBy() {
        return this.$store.state.gui.gcodefiles.sortBy
    }

    set sortBy(newVal) {
        if (newVal === undefined) newVal = 'modified'

        this.$store.dispatch('gui/saveSetting', { name: 'timelapse.sortBy', value: newVal })
    }

    get sortDesc() {
        return this.$store.state.gui.gcodefiles.sortDesc
    }

    set sortDesc(newVal) {
        if (newVal === undefined) newVal = false

        this.$store.dispatch('gui/saveSetting', { name: 'timelapse.sortDesc', value: newVal })
    }

    get countPerPage() {
        return this.$store.state.gui.gcodefiles.countPerPage
    }

    set countPerPage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodefiles.countPerPage', value: newVal })
    }

    get mp4Files() {
        return this.files?.filter((file) => {
            if (file.isDirectory) return true

            return file.filename.endsWith('mp4')
        }) ?? []
    }

    createDirectory() {
        this.dialogCreateDirectory.name = ''
        this.dialogCreateDirectory.show = true
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

    created() {
        this.loadPath()
    }

    loadPath() {
        this.$socket.emit('server.files.get_directory', { path: this.currentPath }, { action: 'files/getDirectory' })
        let dirArray = this.currentPath.split('/')
        this.files = findDirectory(this.filetree, dirArray)
    }

    @Watch('currentPath')
    currentPathChanged() {
        this.loadPath()
    }

    getThumbnail(item: FileStateFile) {
        const filename = item.filename.slice(0, item.filename.lastIndexOf('.'))
        const preview = this.files?.find((file) => file.filename === filename+'.jpg')
        if (preview) {
            return this.apiUrl+'/server/files/'+this.currentPath+'/'+preview.filename+'?timestamp='+preview.modified.getTime()
        }

        return ''
    }

    clickRow(item: FileStateFile, force = false) {
        if (!this.contextMenu.shown || force) {
            if (force) {
                this.contextMenu.shown = false
            }
            if (!item.isDirectory) {
                // const filename = (this.currentPath+'/'+item.filename)
                // const href = this.apiUrl + '/server/files/' + encodeURI(filename)
                // console.log(href)
                // window.open(href)
            } else {
                this.currentPath += '/' + item.filename
                this.loadPath()
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

    downloadFile() {
        const filename = (this.currentPath+'/'+this.contextMenu.item.filename)
        const href = this.apiUrl + '/server/files/' + encodeURI(filename)

        window.open(href)
    }

    renameFile(item: FileStateFile) {
        this.dialogRenameFile.item = item
        this.dialogRenameFile.newName = item.filename
        this.dialogRenameFile.show = true

        this.$nextTick(() => {
            this.$refs.inputFieldRenameFile?.focus()
        })
    }

    renameFileAction() {
        //TODO: rename all files (mp4, jpg, zip)

        this.dialogRenameFile.show = false
        this.$socket.emit('server.files.move', {
            source: this.currentPath+'/'+this.dialogRenameFile.item.filename,
            dest: this.currentPath+'/'+this.dialogRenameFile.newName
        }, { action: 'files/getMove' })
    }

    renameDirectory(item: FileStateFile) {
        this.dialogRenameDirectory.item = item
        this.dialogRenameDirectory.newName = item.filename
        this.dialogRenameDirectory.show = true
    }

    renameDirectoryAction() {
        this.dialogRenameDirectory.show = false
        this.$socket.emit('server.files.move', {
            source: this.currentPath+'/'+this.dialogRenameDirectory.item.filename,
            dest: this.currentPath+'/'+this.dialogRenameDirectory.newName
        }, { action: 'files/getMove' })
    }

    removeFile() {
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
