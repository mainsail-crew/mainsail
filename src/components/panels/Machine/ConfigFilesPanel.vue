<template>
  <panel
    :title="$t('Machine.ConfigFilesPanel.ConfigFiles')"
    card-class="config-files-panel"
    :icon="mdiInformation"
    :collapsible="true">
    <v-card-text class="pa-0">
      <v-row no-gutters>
        <!-- Left Sidebar - File List -->
        <v-col cols="12" md="4" class="pa-3" style="border-right: 1px solid rgba(0,0,0,0.12)">
          <!-- Header -->
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-caption text-uppercase font-weight-bold grey--text">
              {{ $t('Machine.ConfigFilesPanel.ConfigFiles') }}
            </span>
            <v-btn icon x-small @click="dialogCreateFile.show = true">
              <v-icon small>{{ mdiFilePlus }}</v-icon>
            </v-btn>
          </div>

          <!-- Root Selection -->
          <v-select
            v-model="root"
            :items="registeredDirectoriesSelectItems"
            :label="$t('Machine.ConfigFilesPanel.Root')"
            outlined
            dense
            hide-details
            class="mb-3"
            @change="changeRoot"
          />

          <!-- Path Breadcrumb -->
          <div class="mb-3 pb-3" style="border-bottom: 1px solid rgba(0,0,0,0.12)">
            <div class="text-caption grey--text mb-1">{{ $t('Machine.ConfigFilesPanel.CurrentPath') }}</div>
            <div class="d-flex align-center flex-wrap">
              <v-btn
                x-small
                text
                color="primary"
                class="pa-0 text-caption"
                style="min-width: auto"
                @click="currentPath = ''"
              >
                /{{ root }}
              </v-btn>
              <template v-for="(segment, index) in pathSegments">
                <span :key="`sep-${index}`" class="mx-1 grey--text">/</span>
                <v-btn
                  :key="`seg-${index}`"
                  x-small
                  text
                  color="primary"
                  class="pa-0 text-caption"
                  style="min-width: auto"
                  @click="currentPath = '/' + pathSegments.slice(0, index + 1).join('/')"
                >
                  {{ segment }}
                </v-btn>
              </template>
            </div>
          </div>

          <!-- Files List -->
          <div style="max-height: 400px; overflow-y: auto">
            <!-- Go Back Button -->
            <v-btn
              v-if="currentPath !== ''"
              block
              text
              small
              class="justify-start mb-1"
              @click="clickRowGoBack"
            >
              <v-icon small left>{{ mdiFolderUpload }}</v-icon>
              ..
            </v-btn>

            <!-- File/Directory Items -->
            <v-btn
              v-for="file in files"
              :key="file.filename"
              block
              text
              small
              class="justify-start mb-1"
              :color="selectedFile?.filename === file.filename ? 'primary' : ''"
              @click="clickRow(file)"
              @contextmenu.prevent="showContextMenu($event, file)"
            >
              <v-icon small left>{{ file.isDirectory ? mdiFolder : mdiFile }}</v-icon>
              <div class="text-left" style="flex: 1; overflow: hidden">
                <div class="text-truncate">{{ file.filename }}</div>
                <div class="text-caption grey--text">
                  <span v-if="!file.isDirectory">{{ formatFilesize(file.size) }} • </span>
                  {{ formatDateTime(file.modified) }}
                </div>
              </div>
              <v-icon v-if="selectedFile?.filename === file.filename" small>{{ mdiChevronRight }}</v-icon>
            </v-btn>
          </div>

          <!-- Action Buttons -->
          <v-divider class="my-3" />
          <v-btn
            outlined
            small
            block
            class="mb-2"
            @click="uploadFileButton"
            :loading="loadings.includes('configFileUpload')"
          >
            <v-icon small left>{{ mdiFileUpload }}</v-icon>
            {{ $t('Machine.ConfigFilesPanel.UploadFile') }}
          </v-btn>

          <!-- Disk Usage -->
          <template v-if="disk_usage">
            <v-divider class="my-3" />
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on" class="text-caption">
                  <div class="font-weight-bold mb-1">{{ $t('Machine.ConfigFilesPanel.FreeDisk') }}</div>
                  <div>{{ formatFilesize(disk_usage.free) }}</div>
                </div>
              </template>
              <span>
                {{ $t('Machine.ConfigFilesPanel.Used') }}: {{ formatFilesize(disk_usage.used) }}<br />
                {{ $t('Machine.ConfigFilesPanel.Free') }}: {{ formatFilesize(disk_usage.free) }}<br />
                {{ $t('Machine.ConfigFilesPanel.Total') }}: {{ formatFilesize(disk_usage.total) }}
              </span>
            </v-tooltip>
          </template>

          <!-- Settings -->
          <v-divider class="my-3" />
          <v-menu offset-y>
            <template #activator="{ on, attrs }">
              <v-btn outlined small block v-bind="attrs" v-on="on">
                <v-icon small left>{{ mdiCog }}</v-icon>
                {{ $t('Machine.ConfigFilesPanel.SetupCurrentList') }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item>
                <v-checkbox
                  v-model="showHiddenFiles"
                  hide-details
                  :label="$t('Machine.ConfigFilesPanel.HiddenFiles')"
                  class="mt-0"
                />
              </v-list-item>
              <v-list-item>
                <v-checkbox
                  v-model="hideBackupFiles"
                  hide-details
                  :label="$t('Machine.ConfigFilesPanel.HideBackupFiles')"
                  class="mt-0"
                />
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>

        <!-- Right - Editor Area -->
        <v-col cols="12" md="8" class="pa-4">
          <!-- File Selected - Editor -->
          <template v-if="selectedFile && !selectedFile.isDirectory">
            <!-- Header -->
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-2">{{ mdiFileDocumentEditOutline }}</v-icon>
                <div>
                  <div class="d-flex align-center">
                    <span class="font-weight-bold">{{ selectedFile.filename }}</span>
                    <v-chip v-if="hasUnsavedChanges" x-small color="warning" class="ml-2">
                      Unsaved
                    </v-chip>
                  </div>
                  <div class="text-caption grey--text">
                    {{ formatFilesize(selectedFile.size) }} • {{ formatDateTime(selectedFile.modified) }}
                  </div>
                </div>
              </div>
              <div>
                <v-btn small text @click="downloadFile(selectedFile)">
                  <v-icon small left>{{ mdiCloudDownload }}</v-icon>
                  Download
                </v-btn>
                <v-btn small text @click="resetEditor" :disabled="!hasUnsavedChanges">
                  <v-icon small left>{{ mdiRefresh }}</v-icon>
                  Reset
                </v-btn>
                <v-btn
                  small
                  color="primary"
                  @click="saveFile"
                  :disabled="!hasUnsavedChanges"
                  :loading="saveStatus === 'saving'"
                >
                  <v-icon small left>{{ saveStatus === 'saved' ? mdiCheck : mdiContentSave }}</v-icon>
                  {{ saveStatus === 'saved' ? 'Saved!' : 'Save' }}
                </v-btn>
              </div>
            </div>

            <!-- Warning -->
            <v-alert dense outlined type="warning" class="mb-3">
              Editing configuration files may affect printer operation. Backup before making changes.
            </v-alert>

            <!-- Code Editor -->
            <v-card outlined>
              <!-- Editor Header -->
              <div class="d-flex align-center pa-2" style="background-color: rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.12)">
                <div class="d-flex mr-3">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #ff5f56" class="mr-1"></div>
                  <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #ffbd2e" class="mr-1"></div>
                  <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #27c93f"></div>
                </div>
                <span class="text-caption grey--text" style="font-family: monospace">{{ selectedFile.filename }}</span>
              </div>

              <!-- Editor Content -->
              <div style="position: relative; height: 450px">
                <!-- Line Numbers -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 48px; background-color: rgba(0,0,0,0.03); border-right: 1px solid rgba(0,0,0,0.12); overflow: hidden; padding: 12px 8px 12px 0; text-align: right">
                  <div
                    v-for="(_, i) in fileContent.split('\n')"
                    :key="i"
                    class="text-caption grey--text"
                    style="font-family: monospace; line-height: 20px; height: 20px"
                  >
                    {{ i + 1 }}
                  </div>
                </div>

                <!-- Textarea -->
                <textarea
                  v-model="fileContent"
                  @input="handleContentChange"
                  style="
                    position: absolute;
                    left: 48px;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    width: calc(100% - 48px);
                    height: 100%;
                    padding: 12px;
                    border: none;
                    outline: none;
                    resize: none;
                    font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
                    font-size: 12px;
                    line-height: 20px;
                    tab-size: 4;
                  "
                  spellcheck="false"
                />
              </div>
            </v-card>
          </template>

          <!-- No File Selected -->
          <template v-else-if="!selectedFile">
            <div class="d-flex flex-column align-center justify-center" style="height: 500px">
              <v-icon size="64" color="grey lighten-1">{{ mdiFileOutline }}</v-icon>
              <div class="text-h6 mt-4 mb-2">No File Selected</div>
              <div class="text-body-2 grey--text">Select a file from the list to view and edit</div>
            </div>
          </template>

          <!-- Directory Selected -->
          <template v-else-if="selectedFile.isDirectory">
            <div class="d-flex flex-column align-center justify-center" style="height: 500px">
              <v-icon size="64" color="grey lighten-1">{{ mdiFolder }}</v-icon>
              <div class="text-h6 mt-4 mb-2">{{ selectedFile.filename }}</div>
              <div class="text-body-2 grey--text">This is a directory. Click to open it.</div>
            </div>
          </template>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Hidden file input -->
    <input ref="fileUpload" type="file" style="display: none" multiple @change="uploadFile" />

    <!-- Context Menu -->
    <v-menu
      v-model="contextMenu.shown"
      :position-x="contextMenu.x"
      :position-y="contextMenu.y"
      absolute
      offset-y
    >
      <v-list dense>
        <v-list-item v-if="!contextMenu.item.isDirectory" @click="downloadFile(contextMenu.item)">
          <v-list-item-icon>
            <v-icon small>{{ mdiCloudDownload }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Download</v-list-item-title>
        </v-list-item>
        <v-list-item @click="renameFile(contextMenu.item)">
          <v-list-item-icon>
            <v-icon small>{{ mdiRenameBox }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Rename</v-list-item-title>
        </v-list-item>
        <v-list-item @click="duplicateFile(contextMenu.item)">
          <v-list-item-icon>
            <v-icon small>{{ mdiContentCopy }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Duplicate</v-list-item-title>
        </v-list-item>
        <v-list-item @click="deleteDialog = true">
          <v-list-item-icon>
            <v-icon small color="error">{{ mdiDelete }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="error--text">Delete</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Dialogs -->
    <v-dialog v-model="dialogCreateFile.show" max-width="400">
      <v-card>
        <v-card-title>Create File</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="dialogCreateFile.name"
            label="Filename"
            outlined
            dense
            @keyup.enter="createFile"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogCreateFile.show = false">Cancel</v-btn>
          <v-btn color="primary" @click="createFile">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogRenameFile.show" max-width="400">
      <v-card>
        <v-card-title>Rename File</v-card-title>
        <v-card-text>
          <v-text-field
            ref="inputDialogRenameFileName"
            v-model="dialogRenameFile.newName"
            label="New Name"
            outlined
            dense
            @keyup.enter="renameFileAction"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogRenameFile.show = false">Cancel</v-btn>
          <v-btn color="primary" @click="renameFileAction">Rename</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDuplicateFile.show" max-width="400">
      <v-card>
        <v-card-title>Duplicate File</v-card-title>
        <v-card-text>
          <v-text-field
            ref="inputDialogDuplicateFileName"
            v-model="dialogDuplicateFile.newName"
            label="New Name"
            outlined
            dense
            @keyup.enter="duplicateFileAction"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogDuplicateFile.show = false">Cancel</v-btn>
          <v-btn color="primary" @click="duplicateFileAction">Duplicate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <confirmation-dialog
      :show="deleteDialog"
      :title="$t('Machine.ConfigFilesPanel.DeleteFile')"
      :text="$t('Machine.ConfigFilesPanel.ConfirmDeleteFile', { filename: contextMenu.item.filename })"
      @confirm="removeFile"
      @cancel="deleteDialog = false"
    />
  </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import { FileStateFile } from '@/store/files/types'
import axios from 'axios'
import {
  mdiFile,
  mdiFolder,
  mdiFolderUpload,
  mdiFileDocumentEditOutline,
  mdiContentSave,
  mdiRefresh,
  mdiCloudDownload,
  mdiFileUpload,
  mdiCog,
  mdiFilePlus,
  mdiDelete,
  mdiRenameBox,
  mdiContentCopy,
  mdiCheck,
  mdiChevronRight,
  mdiFileOutline,
  mdiInformation
} from '@mdi/js'

@Component({
  components: { Panel, ConfirmationDialog }
})
export default class ConfigFilesPanel extends Mixins(BaseMixin) {
  mdiFile = mdiFile
  mdiFolder = mdiFolder
  mdiFolderUpload = mdiFolderUpload
  mdiFileDocumentEditOutline = mdiFileDocumentEditOutline
  mdiContentSave = mdiContentSave
  mdiRefresh = mdiRefresh
  mdiCloudDownload = mdiCloudDownload
  mdiFileUpload = mdiFileUpload
  mdiCog = mdiCog
  mdiFilePlus = mdiFilePlus
  mdiDelete = mdiDelete
  mdiRenameBox = mdiRenameBox
  mdiContentCopy = mdiContentCopy
  mdiCheck = mdiCheck
  mdiChevronRight = mdiChevronRight
  mdiFileOutline = mdiFileOutline
  mdiInformation = mdiInformation

  private selectedFile: FileStateFile | null = null
  private fileContent = ''
  private originalContent = ''
  private saveStatus: 'idle' | 'saving' | 'saved' = 'idle'
  
  private contextMenu = {
    shown: false,
    x: 0,
    y: 0,
    item: {} as FileStateFile
  }

  private dialogCreateFile = {
    show: false,
    name: ''
  }

  private dialogRenameFile = {
    show: false,
    item: {} as FileStateFile,
    newName: ''
  }

  private dialogDuplicateFile = {
    show: false,
    item: {} as FileStateFile,
    newName: ''
  }

  private deleteDialog = false

  get root() {
    return this.$store.state.gui.view.configfiles.currentRoot ?? 'config'
  }

  set root(newVal) {
    this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.currentRoot', value: newVal })
  }

  get currentPath() {
    return this.$store.state.gui.view.configfiles.currentPath ?? ''
  }

  set currentPath(newVal) {
    this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.currentPath', value: newVal })
  }

  get absolutePath(): string {
    let path = '/' + this.root
    if (this.currentPath) path += this.currentPath
    return path
  }

  get directory() {
    return this.$store.getters['files/getDirectory'](this.absolutePath)
  }

  get disk_usage() {
    return this.directory?.disk_usage ?? null
  }

  get files() {
    let files = [...(this.directory?.childrens ?? [])]

    if (!this.showHiddenFiles) {
      files = files.filter((file: FileStateFile) => file.filename.slice(0, 1) !== '.')
    }

    if (this.hideBackupFiles) {
      const klipperBackupFileMatcher = /^printer-\d{8}_\d{6}\.cfg$/
      const crowsnestBackupFileMatcher = /^crowsnest\.conf\.\d{4}-\d{2}-\d{2}-\d{4}$/

      files = files.filter(
        (file: FileStateFile) =>
          !file.filename.match(klipperBackupFileMatcher) &&
          !file.filename.match(crowsnestBackupFileMatcher) &&
          !file.filename.endsWith('.bkp')
      )
    }

    return files
  }

  get pathSegments(): string[] {
    if (!this.currentPath) return []
    return this.currentPath.split('/').filter(Boolean)
  }

  get registeredDirectories() {
    return this.$store.getters['files/getRootDirectories'] ?? []
  }

  get registeredDirectoriesSelectItems() {
    return this.registeredDirectories.map((dir: any) => ({
      text: dir.name,
      value: dir.name
    }))
  }

  get loadings() {
    return this.$store.state.socket.loadings
  }

  get hasUnsavedChanges(): boolean {
    return this.fileContent !== this.originalContent
  }

  get showHiddenFiles() {
    return this.$store.state.gui.view.configfiles.showHiddenFiles ?? false
  }

  set showHiddenFiles(newVal) {
    this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.showHiddenFiles', value: newVal })
  }

  get hideBackupFiles() {
    return this.$store.state.gui.view.configfiles.hideBackupFiles ?? true
  }

  set hideBackupFiles(newVal) {
    this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.hideBackupFiles', value: newVal })
  }

  changeRoot() {
    this.currentPath = ''
    this.selectedFile = null
  }

  clickRowGoBack() {
    this.currentPath = this.currentPath.substr(0, this.currentPath.lastIndexOf('/'))
    this.selectedFile = null
  }

  async clickRow(item: FileStateFile) {
    if (item.isDirectory) {
      this.currentPath += '/' + item.filename
      this.selectedFile = null
    } else {
      this.selectedFile = item
      await this.loadFileContent(item)
    }
  }

  async loadFileContent(file: FileStateFile) {
    try {
      const url = `${this.apiUrl}/server/files${this.absolutePath}/${file.filename}`
      const response = await axios.get(url)
      this.fileContent = response.data
      this.originalContent = response.data
    } catch (error) {
      console.error('Error loading file:', error)
      this.$toast.error('Error loading file')
    }
  }

  handleContentChange() {
    // Content already bound via v-model
  }

  async saveFile() {
    if (!this.selectedFile) return

    this.saveStatus = 'saving'
    try {
      const formData = new FormData()
      const blob = new Blob([this.fileContent], { type: 'text/plain' })
      const file = new File([blob], this.selectedFile.filename)
      
      formData.append('file', file)
      formData.append('root', this.root)
      if (this.currentPath.length) {
        formData.append('path', this.currentPath.slice(1))
      }

      await axios.post(`${this.apiUrl}/server/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      this.originalContent = this.fileContent
      this.saveStatus = 'saved'
      this.$toast.success('File saved successfully')
      
      setTimeout(() => {
        this.saveStatus = 'idle'
      }, 2000)
    } catch (error) {
      console.error('Error saving file:', error)
      this.$toast.error('Error saving file')
      this.saveStatus = 'idle'
    }
  }

  resetEditor() {
    this.fileContent = this.originalContent
  }

  showContextMenu(e: MouseEvent, item: FileStateFile) {
    e.preventDefault()
    this.contextMenu.shown = false
    this.contextMenu.x = e.clientX
    this.contextMenu.y = e.clientY
    this.contextMenu.item = item
    this.$nextTick(() => {
      this.contextMenu.shown = true
    })
  }

  downloadFile(item: FileStateFile) {
    const filename = `${this.absolutePath}/${item.filename}`.slice(1)
    const link = document.createElement('a')
    link.href = `${this.apiUrl}/server/files/${filename}`
    link.download = item.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  createFile() {
    if (!this.dialogCreateFile.name) return

    const formData = new FormData()
    const blob = new Blob([''], { type: 'text/plain' })
    const file = new File([blob], this.dialogCreateFile.name)
    
    formData.append('file', file)
    formData.append('root', this.root)
    if (this.currentPath.length) {
      formData.append('path', this.currentPath.slice(1))
    }

    axios
      .post(`${this.apiUrl}/server/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(() => {
        this.$toast.success(`File ${this.dialogCreateFile.name} created successfully`)
        this.dialogCreateFile.show = false
        this.dialogCreateFile.name = ''
      })
      .catch(() => {
        console.error('Error creating file: ' + this.dialogCreateFile.name)
      })
  }

  renameFile(item: FileStateFile) {
    this.dialogRenameFile.item = item
    this.dialogRenameFile.newName = item.filename
    this.dialogRenameFile.show = true

    setTimeout(() => {
      (this.$refs.inputDialogRenameFileName as any)?.focus()
    }, 200)
  }

  renameFileAction() {
    this.dialogRenameFile.show = false
    this.$socket.emit(
      'server.files.move',
      {
        source: `${this.absolutePath}/${this.dialogRenameFile.item.filename}`.slice(1),
        dest: `${this.absolutePath}/${this.dialogRenameFile.newName}`.slice(1)
      },
      { action: 'files/getMove' }
    )
  }

  duplicateFile(item: FileStateFile) {
    this.dialogDuplicateFile.item = item
    this.dialogDuplicateFile.newName = item.filename
    this.dialogDuplicateFile.show = true

    setTimeout(() => {
      (this.$refs.inputDialogDuplicateFileName as any)?.focus()
    }, 200)
  }

  duplicateFileAction() {
    this.dialogDuplicateFile.show = false
    this.$socket.emit('server.files.copy', {
      source: `${this.absolutePath}/${this.dialogDuplicateFile.item.filename}`.slice(1),
      dest: `${this.absolutePath}/${this.dialogDuplicateFile.newName}`.slice(1)
    })
  }

  removeFile() {
    this.deleteDialog = false
    this.$socket.emit(
      'server.files.delete_file',
      { path: `${this.absolutePath}/${this.contextMenu.item.filename}` },
      { action: 'files/getDeleteFile' }
    )
  }

  uploadFileButton() {
    (this.$refs.fileUpload as HTMLInputElement).click()
  }

  async uploadFile() {
    const fileInput = this.$refs.fileUpload as HTMLInputElement
    if (fileInput.files?.length) {
      const files = [...fileInput.files]
      fileInput.value = ''

      await this.$store.dispatch('socket/addLoading', { name: 'configFileUpload' })
      await this.$store.dispatch('files/uploadSetCurrentNumber', 0)
      await this.$store.dispatch('files/uploadSetMaxNumber', files.length)

      for (const file of files) {
        await this.$store.dispatch('files/uploadIncrementCurrentNumber')
        const path = this.currentPath.slice(0, 1) === '/' ? this.currentPath.slice(1) : this.currentPath
        const result = await this.$store.dispatch('files/uploadFile', {
          file,
          path,
          root: this.root
        })

        if (result !== false) {
          this.$toast.success(`File ${result} uploaded successfully`)
        }
      }

      await this.$store.dispatch('socket/removeLoading', { name: 'configFileUpload' })
    }
  }
}
</script>
