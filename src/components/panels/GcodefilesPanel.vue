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

.fileupload-card {
    position: relative;
}

.dragzone {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    height: 100%;
    z-index: 9999999999;
    background-color: rgba(0, 0, 0, 0.5);
    transition: visibility 175ms, opacity 175ms;
    font: bold 42px Oswald, DejaVu Sans, Tahoma, sans-serif;
}

.dragzone:before {
    display: block;
    content: ' ';
    position: absolute;
    top: 15px; right: 15px; bottom: 15px; left: 15px;
    border: 3px dashed white;
    border-radius: 15px;
}

.dragzone .textnode {
    text-align: center;
    transition: font-size 175ms;
}
</style>

<template>
    <div
        @dragover="dragOverUpload"
        @dragleave="dragLeaveUpload"
        @drop.prevent.stop="dragDropUpload"
    >
        <panel
            :title="$t('Files.GCodeFiles')"
            icon="mdi-file-document-multiple-outline"
            card-class="gcode-files-panel"
        >
            <v-card-text>
                <v-row>
                    <v-col class="col-12 d-flex align-center">
                        <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            :label="$t('Files.Search')"
                            single-line
                            outlined
                            clearable
                            hide-details
                            dense
                            style="max-width: 300px;"
                        ></v-text-field>
                        <v-spacer></v-spacer>
                        <input type="file" ref="fileUpload" :accept="validGcodeExtensions.join(', ')" style="display: none" multiple @change="uploadFile" />
                        <v-btn @click="clickUploadButton" :title="$t('Files.UploadNewGcode')" class="primary--text px-2 minwidth-0 ml-3" :loading="loadings.includes('gcodeUpload')"><v-icon>mdi-upload</v-icon></v-btn>
                        <v-btn @click="createDirectory" :title="$t('Files.CreateNewDirectory')" class="px-2 minwidth-0 ml-3"><v-icon>mdi-folder-plus</v-icon></v-btn>
                        <v-btn @click="refreshFileList" :title="$t('Files.RefreshCurrentDirectory')" class="px-2 minwidth-0 ml-3"><v-icon>mdi-refresh</v-icon></v-btn>
                        <v-menu offset-y left :close-on-content-click="false" :title="$t('Files.SetupCurrentList')">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn class="px-2 minwidth-0 ml-3" v-bind="attrs" v-on="on"><v-icon>mdi-cog</v-icon></v-btn>
                            </template>
                            <v-list>
                                <v-list-item class="minHeight36">
                                    <v-checkbox class="mt-0" hide-details v-model="showHiddenFiles" :label="$t('Files.HiddenFiles')"></v-checkbox>
                                </v-list-item>
                                <v-list-item class="minHeight36">
                                    <v-checkbox class="mt-0" hide-details v-model="showPrintedFiles" :label="$t('Files.PrintedFiles')"></v-checkbox>
                                </v-list-item>
                                <v-divider></v-divider>
                                <v-list-item class="minHeight36" v-for="header of configHeaders" v-bind:key="header.key">
                                    <v-checkbox class="mt-0" hide-details v-model="header.visible" @change="changeMetadataVisible(header.value)" :label="header.text"></v-checkbox>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text>
                <v-row>
                    <v-col class="col-12 py-2 d-flex align-center">
                        <span><b>{{ $t('Files.CurrentPath') }}:</b> {{ this.currentPath !== 'gcodes' ? "/"+this.currentPath.substring(7) : "/" }}</span>
                        <v-spacer></v-spacer>
                        <template v-if="this.disk_usage !== null">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <b>{{ $t('Files.FreeDisk') }}:</b> {{ formatFilesize(disk_usage.free) }}
                                    </span>
                                </template>
                                <span>
                                    {{ $t('Files.Used') }}: {{ formatFilesize(this.disk_usage.used) }}<br />
                                    {{ $t('Files.Free') }}: {{ formatFilesize(this.disk_usage.free) }}<br />
                                    {{ $t('Files.Total') }}: {{ formatFilesize(this.disk_usage.total) }}
                                </span>
                            </v-tooltip>
                        </template>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider class="mb-3"></v-divider>
            <v-data-table
                :items="files"
                class="files-table"
                :headers="filteredHeaders"
                :custom-sort="sortFiles"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :items-per-page.sync="countPerPage"
                :footer-props="{
                    itemsPerPageText: $t('Files.Files'),
                    itemsPerPageAllText: $t('Files.AllFiles'),
                    itemsPerPageOptions: [10,25,50,100,-1]
                }"
                item-key="name"
                :search="search"
                :custom-filter="advancedSearch"
                mobile-breakpoint="0"
                @current-items="refreshMetadata"
            >

                <template slot="items">
                    <td v-for="header in filteredHeaders" v-bind:key="header.value">{{ header.text }}</td>
                </template>

                <template #no-data>
                    <div class="text-center">{{ $t('Files.Empty') }}</div>
                </template>

                <template slot="body.prepend" v-if="(currentPath !== 'gcodes')">
                    <tr
                        class="file-list-cursor"
                        @click="clickRowGoBack"
                        @dragover="dragOverFilelist($event, {isDirectory: true, filename: '..'})" @dragleave="dragLeaveFilelist" @drop.prevent.stop="dragDropFilelist($event, {isDirectory: true, filename: '..'})"
                    >
                        <td class="pr-0 text-center" style="width: 32px;"><v-icon>mdi-folder-upload</v-icon></td>
                        <td class=" " :colspan="filteredHeaders.length">..</td>
                    </tr>
                </template>

                <template #item="{ index, item }">
                    <tr
                        :key="`${index} ${item.filename}`"
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)"
                        class="file-list-cursor user-select-none"
                        draggable="true"
                        @drag="dragFile($event, item)"
                        @dragend="dragendFile($event)"
                        @dragover="dragOverFilelist($event, item)" @dragleave="dragLeaveFilelist" @drop.prevent.stop="dragDropFilelist($event, item)"
                        :data-name="item.filename"
                    >
                        <td class="pr-0 text-center" style="width: 32px;">
                            <template v-if="item.isDirectory">
                                <v-icon>mdi-folder</v-icon>
                            </template>
                            <template v-else>
                                <template v-if="getSmallThumbnail(item) && getBigThumbnail(item)">
                                    <v-tooltip v-if="!item.isDirectory && getSmallThumbnail(item) && getBigThumbnail(item)" top content-class="tooltip__content-opacity1">
                                        <template v-slot:activator="{ on, attrs }">
                                            <vue-load-image>
                                                <img slot="image" :src="getSmallThumbnail(item)" width="32" height="32" v-bind="attrs" v-on="on" />
                                                <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                                                <v-icon slot="error">mdi-file</v-icon>
                                            </vue-load-image>
                                        </template>
                                        <span><img :src="getBigThumbnail(item)" width="250" /></span>
                                    </v-tooltip>
                                </template>
                                <template v-else-if="getSmallThumbnail(item)">
                                    <vue-load-image>
                                        <img slot="image" :src="getSmallThumbnail(item)" width="32" height="32" />
                                        <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                                        <v-icon slot="error">mdi-file</v-icon>
                                    </vue-load-image>
                                </template>
                                <template v-else>
                                    <v-icon>mdi-file</v-icon>
                                </template>
                            </template>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class="text-center">
                            <v-tooltip top  v-if="getJobStatus(item)">
                                <template v-slot:activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <v-icon small :color="getStatusColor(getJobStatus(item))">{{ getStatusIcon(getJobStatus(item)) }}</v-icon>
                                    </span>
                                </template>
                                <span>{{ getJobStatus(item).replace(/_/g, " ") }}</span>
                            </v-tooltip>
                        </td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'size').visible">{{ item.isDirectory ? '--' : formatFilesize(item.size) }}</td>
                        <td class="text-right" v-if="headers.find(header => header.value === 'modified').visible">{{ formatDate(item.modified) }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'object_height').visible">{{ item.object_height ? item.object_height.toFixed(2)+' mm' : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'layer_height').visible">{{ item.layer_height ? item.layer_height.toFixed(2)+' mm' : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'nozzle_diameter').visible">{{ item.nozzle_diameter ? item.nozzle_diameter.toFixed(2)+' mm' : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'filament_name').visible">{{ item.filament_name ? item.filament_name : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'filament_type').visible">{{ item.filament_type ? item.filament_type : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'filament_total').visible">{{ item.filament_total ? item.filament_total.toFixed()+' mm' : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'filament_weight_total').visible">{{ item.filament_weight_total ? item.filament_weight_total.toFixed(2)+' g' : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'estimated_time').visible">{{ formatPrintTime(item.estimated_time) }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'slicer').visible">{{ item.slicer ? item.slicer : '--' }}<br /><small v-if="item.slicer_version">{{ item.slicer_version}}</small></td>
                    </tr>
                </template>
            </v-data-table>
            <div class="dragzone d-flex justify-center flex-column" :style="'visibility: '+dropzone.visibility+'; opacity: '+dropzone.hidden">
                <div class="textnode">{{ $t('Files.DropFilesToAddGcode')}}</div>
            </div>
        </panel>
        <v-snackbar
            :timeout="-1"
            :value="true"
            fixed
            right
            bottom
            dark
            v-model="uploadSnackbar.status"
        >
            <span v-if="uploadSnackbar.max > 1" class="mr-1">({{ uploadSnackbar.number }}/{{ uploadSnackbar.max }})</span><strong>{{ $t("Files.Uploading") + " " + uploadSnackbar.filename }}</strong><br />
            {{ Math.round(uploadSnackbar.percent) }} % @ {{ formatFilesize(Math.round(uploadSnackbar.speed)) }}/s<br />
            <v-progress-linear class="mt-2" :value="uploadSnackbar.percent"></v-progress-linear>
            <template v-slot:action="{ attrs }">
                <v-btn
                    color="red"
                    text
                    v-bind="attrs"
                    @click="cancelUpload"
                    style="min-width: auto;"
                >
                    <v-icon class="0">mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
        <v-dialog v-model="dialogPrintFile.show" :max-width="getThumbnailWidth(dialogPrintFile.item)">
            <v-card>
                <v-img
                    contain
                    v-if="getBigThumbnail(dialogPrintFile.item)"
                    :src="getBigThumbnail(dialogPrintFile.item)"
                ></v-img>
                <v-card-title class="headline">{{ $t('Files.StartJob') }}</v-card-title>
                <v-card-text class="pb-0">{{ $t('Files.DoYouWantToStartFilename', {'filename': dialogPrintFile.item.filename}) }}</v-card-text>
                <template v-if="moonrakerComponents.includes('timelapse')">
                    <v-divider class="mt-3 mb-2"></v-divider>
                    <v-card-text class="pb-0">
                        <settings-row title="Timelapse">
                            <v-switch v-model="timelapseEnabled" hide-details class="mt-0"></v-switch>
                        </settings-row>
                    </v-card-text>
                    <v-divider class="mt-2 mb-0"></v-divider>
                </template>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogPrintFile.show = false">{{ $t('Files.Cancel')}}</v-btn>
                    <v-btn color="primary" text @click="startPrint(dialogPrintFile.item.filename)" :disabled="printerIsPrinting || !klipperReadyForGui">{{$t('Files.StartPrint')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="clickRow(contextMenu.item, true)" :disabled="printerIsPrinting || !klipperReadyForGui || !isGcodeFile(contextMenu.item)" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-play</v-icon> {{ $t('Files.PrintStart')}}
                </v-list-item>
                <v-list-item @click="addToQueue(contextMenu.item)" v-if="!contextMenu.item.isDirectory && moonrakerComponents.includes('job_queue')" :disabled="!isGcodeFile(contextMenu.item)">
                    <v-icon class="mr-1">mdi-playlist-plus</v-icon> {{ $t('Files.AddToQueue')}}
                </v-list-item>
                <v-list-item
                    @click="preheat"
                    v-if="
                        'first_layer_extr_temp' in contextMenu.item &&
                        contextMenu.item.first_layer_extr_temp > 0 &&
                        'first_layer_bed_temp' in contextMenu.item &&
                        contextMenu.item.first_layer_bed_temp > 0
                    "
                    :disabled="['error', 'printing', 'paused'].includes(printer_state)"
                >
                    <v-icon class="mr-1">mdi-fire</v-icon> {{ $t('Files.Preheat')}}
                </v-list-item>
                <v-list-item @click="view3D(contextMenu.item)" v-if="!contextMenu.item.isDirectory" :disabled="!isGcodeFile(contextMenu.item)">
                    <v-icon class="mr-1">mdi-video-3d</v-icon>
                    {{ $t('Files.View3D') }}
                </v-list-item>
                <v-list-item @click="downloadFile" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-cloud-download</v-icon> {{ $t('Files.Download')}}
                </v-list-item>
                <v-list-item @click="renameDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> {{ $t('Files.Rename')}}
                </v-list-item>
                <v-list-item @click="editFile(contextMenu.item)" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-pencil</v-icon> {{ $t('Files.EditFile') }}
                </v-list-item>
                <v-list-item @click="renameFile(contextMenu.item)" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> {{ $t('Files.Rename')}}
                </v-list-item>
                <v-list-item @click="removeFile" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('Files.Delete')}}
                </v-list-item>
                <v-list-item @click="deleteDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('Files.Delete')}}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogCreateDirectory.show" :max-width="400">
            <panel :title="$t('Files.NewDirectory')" card-class="gcode-files-new-directory-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogCreateDirectory.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        v-model="dialogCreateDirectory.name"
                        ref="inputFieldCreateDirectory"
                        @keypress.enter="createDirectoryAction"
                        :label="$t('Files.Name')"
                        :rules="input_rules"
                        required
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateDirectory.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="createDirectoryAction">{{ $t('Files.Create') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRenameFile.show" :max-width="400">
            <panel :title="$t('Files.RenameFile')" card-class="gcode-files-rename-file-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogRenameFile.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        v-model="dialogRenameFile.newName"
                        ref="inputFieldRenameFile"
                        @keyup.enter="renameFileAction"
                        :label="$t('Files.Name')"
                        required
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameFile.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameFileAction">{{ $t('Files.Rename') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRenameDirectory.show" max-width="400">
            <panel :title="$t('Files.RenameDirectory')" card-class="gcode-files-rename-directory-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogRenameDirectory.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        v-model="dialogRenameDirectory.newName"
                        ref="inputFieldRenameDirectory"
                        :label="$t('Files.Name')"
                        @keyup.enter="renameDirectoryAction"
                        required
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameDirectory.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameDirectoryAction">{{ $t('Files.Rename') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogDeleteDirectory.show" max-width="400">
            <panel :title="$t('Files.DeleteDirectory')" card-class="gcode-files-delete-directory-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogDeleteDirectory.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">{{ $t('Files.DeleteDirectoryQuestion', { name: dialogDeleteDirectory.item.filename } )}}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogDeleteDirectory.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="deleteDirectoryAction">{{ $t('Files.Delete') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import {Component, Mixins, Watch} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import axios from 'axios'
import {thumbnailSmallMin, thumbnailSmallMax, thumbnailBigMin, validGcodeExtensions} from '@/store/variables'
import {formatFilesize, formatDate, sortFiles, formatPrintTime} from '@/plugins/helpers'
import {FileStateFile} from '@/store/files/types'
import Panel from '@/components/ui/Panel.vue'
import SettingsRow from '@/components/settings/SettingsRow.vue'

interface draggingFile {
    status: boolean
    item: FileStateFile
}

interface uploadSnackbar {
    status: boolean
    filename: string
    percent: number
    speed: number
    total: number
    number: number
    max: number
    cancelTokenSource: any
    lastProgress: {
        time: number
        loaded: number
    }
}

interface dialogPrintFile {
    show: boolean
    item: FileStateFile
}

interface dialogRenameObject {
    show: boolean
    newName: string
    item: FileStateFile
}

@Component({
    components: {Panel,SettingsRow}
})
export default class GcodefilesPanel extends Mixins(BaseMixin) {
    validGcodeExtensions = validGcodeExtensions
    formatDate = formatDate
    formatFilesize = formatFilesize
    formatPrintTime = formatPrintTime
    sortFiles = sortFiles

    $refs!: {
        fileUpload: HTMLInputElement,
        inputFieldRenameFile: HTMLInputElement,
        inputFieldCreateDirectory: HTMLInputElement,
        inputFieldRenameDirectory: HTMLInputElement,
    }

    private TimelapseModeOptions = [
        {
            text: 'layermacro',
            value: 'layermacro'
        },
        {
            text: 'hyperlapse',
            value: 'hyperlapse'
        }
    ]

    private search = ''
    private selected = []
    private hideHeaderColums = []
    private dropzone = {
        visibility: 'hidden',
        opacity: 0,
    }
    private draggingFile: draggingFile = {
        status: false,
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date()
        }
    }
    private uploadSnackbar: uploadSnackbar = {
        status: false,
        filename: '',
        percent: 0,
        speed: 0,
        total: 0,
        number: 0,
        max: 0,
        cancelTokenSource: {},
        lastProgress: {
            time: 0,
            loaded: 0
        }
    }
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

    private dialogPrintFile: dialogPrintFile = {
        show: false,
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

    get currentPath() {
        return this.$store.state.gui.view.gcodefiles.currentPath
    }

    set currentPath(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.gcodefiles.currentPath', value: newVal })
    }

    get headers() {
        const headers = [
            { text: '',                                     value: '',                          align: 'left',  configable: false,  visible: true, filterable: false },
            { text: this.$t('Files.Name'),                  value: 'filename',                  align: 'left',  configable: false,  visible: true },
            { text: '',                                     value: 'status',                    align: 'left',  configable: false,  visible: true },
            { text: this.$t('Files.Filesize'),              value: 'size',                      align: 'right', configable: true,   visible: true },
            { text: this.$t('Files.LastModified'),          value: 'modified',                  align: 'right', configable: true,   visible: true },
            { text: this.$t('Files.ObjectHeight'),          value: 'object_height',             align: 'right', configable: true,   visible: true },
            { text: this.$t('Files.LayerHeight'),           value: 'layer_height',              align: 'right', configable: true,   visible: true },
            { text: this.$t('Files.NozzleDiameter'),        value: 'nozzle_diameter',           align: 'right', configable: true,   visible: true },
            { text: this.$t('Files.FilamentName'),          value: 'filament_name',             align: 'right', configable: true,   visible: true },
            { text: this.$t('Files.FilamentType'),          value: 'filament_type',             align: 'right', configable: true,   visible: true },
            { text: this.$t('Files.FilamentUsage'),         value: 'filament_total',            align: 'right', configable: true,   visible: true },
            { text: this.$t('Files.FilamentWeight'),        value: 'filament_weight_total',     align: 'right', configable: true,   visible: true },
            { text: this.$t('Files.PrintTime'),             value: 'estimated_time',            align: 'right', configable: true,   visible: true },
            { text: this.$t('Files.Slicer'),                value: 'slicer',                    align: 'right', configable: true,   visible: true },
        ]

        headers.forEach((header) => {
            if (header.visible && this.hideMetadataColums.includes(header.value)) {
                header.visible = false
            } else if (!header.visible && !this.hideMetadataColums.includes(header.value)) {
                header.visible = true
            }
        })

        return headers
    }

    get directory() {
        return this.$store.getters['files/getDirectory'](this.currentPath)
    }

    get disk_usage() {
        return this.directory?.disk_usage ?? { used: 0, free: 0, total: 0}
    }

    get files() {
        let files = [...this.directory?.childrens ?? []]

        if (!this.showHiddenFiles) {
            files = files.filter(file => file.filename !== 'thumbs' && file.filename.substr(0, 1) !== '.')
        }

        if (!this.showPrintedFiles) {
            files = files.filter(file => {
                if (file.isDirectory) return true
                else {
                    return (this.$store.getters['server/history/getPrintStatusByFilename'](
                        (this.currentPath+'/'+file.filename).substr(7),
                        file.modified.getTime()
                    ) !== 'completed')
                }
            })
        }

        return files
    }

    get configHeaders() {
        return this.headers.filter(header => header.configable)
    }

    get filteredHeaders() {
        return this.headers.filter(header => header.visible)
    }

    get hideMetadataColums() {
        return this.$store.state.gui.view.gcodefiles.hideMetadataColums
    }

    set hideMetadataColums(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.hideMetadataColums', value: newVal })
    }

    get showHiddenFiles() {
        return this.$store.state.gui.view.gcodefiles.showHiddenFiles
    }

    set showHiddenFiles(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.showHiddenFiles', value: newVal })
    }

    get showPrintedFiles() {
        return this.$store.state.gui.view.gcodefiles.showPrintedFiles
    }

    set showPrintedFiles(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.showPrintedFiles', value: newVal })
    }

    get sortBy() {
        return this.$store.state.gui.view.gcodefiles.sortBy
    }

    set sortBy(newVal) {
        if (newVal === undefined) newVal = 'modified'

        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortBy', value: newVal })
    }

    get sortDesc() {
        return this.$store.state.gui.view.gcodefiles.sortDesc
    }

    set sortDesc(newVal) {
        if (newVal === undefined) newVal = false

        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortDesc', value: newVal })
    }

    get countPerPage() {
        return this.$store.state.gui.view.gcodefiles.countPerPage
    }

    set countPerPage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.countPerPage', value: newVal })
    }

    get timelapseEnabled() {
        return this.$store.state.server.timelapse?.settings?.enabled ?? false
    }

    set timelapseEnabled(newVal) {
        this.$socket.emit('machine.timelapse.post_settings', { enabled: newVal }, { action: 'server/timelapse/initSettings' })
    }

    getJobStatus(item: FileStateFile) {
        return this.$store.getters['server/history/getPrintStatus'](item.job_id)
    }

    getStatusIcon(status: string) {
        return this.$store.getters['server/history/getPrintStatusChipIcon'](status)
    }

    getStatusColor(status: string) {
        return this.$store.getters['server/history/getPrintStatusChipColor'](status)
    }

    dragOverUpload(e: Event) {
        if (!this.draggingFile.status) {
            e.preventDefault()
            e.stopPropagation()

            this.dropzone.visibility = 'visible'
            this.dropzone.opacity = 1
        }
    }

    dragLeaveUpload(e: Event) {
        if (!this.draggingFile.status) {
            e.preventDefault()
            e.stopPropagation()

            this.dropzone.visibility = 'hidden'
            this.dropzone.opacity = 0
        }
    }

    async dragDropUpload(e: any) {
        if (!this.draggingFile.status) {
            e.preventDefault()

            this.dropzone.visibility = 'hidden'
            this.dropzone.opacity = 0

            if (e.dataTransfer.files.length) {
                const files = [...e.dataTransfer.files].filter((file: File) => {
                    const format = file.name.slice(file.name.lastIndexOf('.'))

                    if (!validGcodeExtensions.includes(format)) {
                        this.$toast.error(this.$t('Files.WrongFileUploaded', { filename: file.name }).toString())

                        return false
                    }

                    return true
                })

                this.$store.dispatch('socket/addLoading', { name: 'gcodeUpload' })
                let successFiles = []
                this.uploadSnackbar.number = 0
                this.uploadSnackbar.max = files.length
                for (const file of files) {
                    this.uploadSnackbar.number++
                    const result = await this.doUploadFile(file)
                    successFiles.push(result)
                }

                this.$store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
                for(const file of successFiles) {
                    this.$toast.success(this.$t('Files.SuccessfullyUploaded', { filename: file }).toString())
                }
            }
        }
    }

    doUploadFile(file: File) {
        let formData = new FormData()
        let filename = file.name

        this.uploadSnackbar.filename = filename
        this.uploadSnackbar.status = true
        this.uploadSnackbar.percent = 0
        this.uploadSnackbar.speed = 0
        this.uploadSnackbar.lastProgress.loaded = 0
        this.uploadSnackbar.lastProgress.time = 0

        formData.append('file', file, (this.currentPath+'/'+filename).substring(7))

        return new Promise(resolve => {
            this.uploadSnackbar.cancelTokenSource = axios.CancelToken.source()
            axios.post(this.apiUrl + '/server/files/upload',
                formData, {
                    cancelToken: this.uploadSnackbar.cancelTokenSource.token,
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent: any) => {
                        this.uploadSnackbar.percent = (progressEvent.loaded * 100) / progressEvent.total
                        if (this.uploadSnackbar.lastProgress.time) {
                            const time = progressEvent.timeStamp - this.uploadSnackbar.lastProgress.time
                            const data = progressEvent.loaded - this.uploadSnackbar.lastProgress.loaded

                            if (time) this.uploadSnackbar.speed = data / (time / 1000)
                        }

                        this.uploadSnackbar.lastProgress.time = progressEvent.timeStamp
                        this.uploadSnackbar.lastProgress.loaded = progressEvent.loaded
                        this.uploadSnackbar.total = progressEvent.total
                    }
                }
            ).then((result: any) => {
                const filename = result.data.item.path.substr(result.data.item.path.indexOf('/')+1)
                this.uploadSnackbar.status = false
                resolve(filename)
            }).catch(() => {
                this.uploadSnackbar.status = false
                this.$store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
                this.$toast.error('Cannot upload the file!')
            })
        })
    }

    dragOverFilelist(e: any, row: any) {
        if (this.draggingFile.status) {
            e.preventDefault()
            //e.stopPropagation()

            if (row.isDirectory) {
                e.target.parentElement.style.backgroundColor = '#43A04720'
            }
        }
    }

    dragLeaveFilelist(e: any) {
        if (this.draggingFile.status) {
            e.preventDefault()
            e.stopPropagation()

            e.target.parentElement.style.backgroundColor = 'transparent'
        }
    }

    async dragDropFilelist(e: any, row: any) {
        if (this.draggingFile.status) {
            e.preventDefault()
            e.target.parentElement.style.backgroundColor = 'transparent'

            let dest = ''
            if (row.filename === '..') {
                dest = this.currentPath.substring(0, this.currentPath.lastIndexOf('/') + 1)+this.draggingFile.item.filename
            } else dest = this.currentPath+'/'+row.filename+'/'+this.draggingFile.item.filename

            this.$socket.emit('server.files.move', {
                source: this.currentPath+'/'+this.draggingFile.item.filename,
                dest: dest
            }, { action: 'files/getMove' })
        }
    }

    async uploadFile() {
        if (this.$refs.fileUpload.files?.length) {
            this.$store.dispatch('socket/addLoading', { name: 'gcodeUpload' })
            let successFiles = []
            this.uploadSnackbar.number = 0
            this.uploadSnackbar.max = this.$refs.fileUpload.files.length
            for (const file of this.$refs.fileUpload.files) {
                this.uploadSnackbar.number++
                const result = await this.doUploadFile(file)
                successFiles.push(result)
            }

            this.$store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
            for(const file of successFiles) {
                this.$toast.success(this.$t('Files.SuccessfullyUploaded', { filename: file }).toString())
            }

            this.$refs.fileUpload.value = ''
        }
    }

    clickUploadButton() {
        this.$refs.fileUpload.click()
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

    refreshMetadata(data: FileStateFile[]) {
        const items = data.filter((file) => !file.isDirectory && !file.metadataRequested && !file.metadataPulled)
        items.forEach((file: FileStateFile) => {
            this.$store.dispatch('files/requestMetadata', {
                filename: (this.currentPath+'/'+file.filename)
            })
        })
    }

    created() {
        this.$socket.emit('server.files.get_directory', { path: this.currentPath }, { action: 'files/getDirectory' })
    }

    getSmallThumbnail(item: FileStateFile) {
        if (item.thumbnails?.length) {
            const thumbnail = item.thumbnails.find(thumb =>
                thumb.width >= thumbnailSmallMin && thumb.width <= thumbnailSmallMax &&
                thumb.height >= thumbnailSmallMin && thumb.height <= thumbnailSmallMax
            )

            if (thumbnail && 'relative_path' in thumbnail) {
                return `${this.apiUrl}/server/files/${encodeURI(this.currentPath)}/${encodeURI(thumbnail.relative_path)}?timestamp=${item.modified.getTime()}`
            }
        }

        return ''
    }

    getBigThumbnail(item: FileStateFile) {
        if (item.thumbnails?.length) {
            const thumbnail = item.thumbnails.find(thumb => thumb.width >= thumbnailBigMin)

            if (thumbnail && 'relative_path' in thumbnail) {
                return `${this.apiUrl}/server/files/${encodeURI(this.currentPath)}/${encodeURI(thumbnail.relative_path)}?timestamp=${item.modified.getTime()}`
            }
        }

        return ''
    }

    getThumbnailWidth(item: FileStateFile) {
        if (this.getBigThumbnail(item)) {
            const thumbnail = item?.thumbnails?.find(thumb => thumb.width >= thumbnailBigMin)

            if (thumbnail) return thumbnail.width
        }

        return 400
    }

    clickRow(item: FileStateFile, force = false) {
        if (!this.contextMenu.shown || force) {
            if (force) this.contextMenu.shown = false

            if (item.isDirectory) {
                this.currentPath += '/' + item.filename
            } else if (!['error', 'printing', 'paused'].includes(this.printer_state) && this.isGcodeFile(item)) {
                this.dialogPrintFile.show = true
                this.dialogPrintFile.item = item
            }
        }
    }

    clickRowGoBack() {
        this.currentPath = this.currentPath.substr(0, this.currentPath.lastIndexOf('/'))
    }

    addToQueue(item: FileStateFile) {
        let path = this.currentPath.slice(7)
        if (path != '') path += '/'
        const filename = path+item.filename

        this.$store.dispatch('server/jobQueue/addToQueue', [filename])
    }

    changeMetadataVisible(name: string) {
        if (this.headers.filter(header => header.value === name).length) {
            const value = this.headers.filter(header => header.value === name)[0].visible

            this.$store.dispatch('gui/setGcodefilesMetadata', {name: name, value: value})
        }
    }

    cancelUpload() {
        this.uploadSnackbar.cancelTokenSource.cancel()
        this.uploadSnackbar.status = false
        this.$refs.fileUpload.value = ''
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

    preheat() {
        const file: any = this.contextMenu.item

        if (
            'first_layer_extr_temp' in file &&
            'first_layer_bed_temp' in file &&
            !['error', 'printing', 'paused'].includes(this.printer_state)
        ) {
            let gcode = ''
            if (file.first_layer_extr_temp > 0) {
                gcode = 'M104 S'+file.first_layer_extr_temp
                this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
                this.$socket.emit('printer.gcode.script', { script: gcode })
            }

            if (file.first_layer_bed_temp > 0) {
                gcode = 'M140 S'+file.first_layer_bed_temp
                this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
                this.$socket.emit('printer.gcode.script', { script: gcode })
            }
        }
    }

    editFile(item: FileStateFile) {
        const path = this.currentPath === 'gcodes' ? '' : this.currentPath.slice(7)

        this.$store.dispatch('editor/openFile', {
            root: 'gcodes',
            path: path !== '' ? '/'+path : '',
            filename: item.filename,
            size: item.size,
            permissions: item.permissions
        })
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

        setTimeout(() => {
            this.$refs.inputFieldRenameFile?.focus()
        }, 200)
    }

    renameFileAction() {
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

    startPrint(filename = '') {
        filename = (this.currentPath+'/'+filename).substring(7)
        this.dialogPrintFile.show = false
        this.$socket.emit('printer.print.start', { filename: filename }, { action: 'switchToDashboard' })
    }

    dragFile(e: Event, item: FileStateFile) {
        e.preventDefault()
        this.draggingFile.status = true
        this.draggingFile.item = item
    }

    dragendFile(e: Event) {
        e.preventDefault()
        this.draggingFile.status = false
        this.draggingFile.item = {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date()
        }
    }

    @Watch('hideMetadataColums')
    hideMetadataColumsCanged(newVal: string[]) {
        newVal.forEach((key) => {
            let headerElement = this.headers.find(element => element.value === key)
            if (headerElement) headerElement.visible = false
        })
    }

    isGcodeFile(file: FileStateFile) {
        const format = file.filename.slice(file.filename.lastIndexOf('.'))

        return validGcodeExtensions.includes(format)
    }

    view3D(item: FileStateFile) {
        this.$router.push({path: '/viewer', query: {filename: this.currentPath + '/' + item.filename}})
    }
}
</script>
