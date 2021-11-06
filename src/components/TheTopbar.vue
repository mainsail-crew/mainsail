<style scoped>
    .button-min-width-auto {
        min-width: auto !important;
    }
</style>

<template>
    <div>
        <v-app-bar app elevate-on-scroll>
            <v-app-bar-nav-icon @click.stop="naviDrawer = !naviDrawer"></v-app-bar-nav-icon>
            <v-spacer></v-spacer>
            <the-throttled-states></the-throttled-states>
            <input type="file" ref="fileUploadAndStart" :accept="validGcodeExtensions.join(', ')" style="display: none" @change="uploadAndStart" />
            <v-btn
                color="primary"
                class="mr-5 button-min-width-auto px-3 d-none d-sm-flex"
                v-if="klippyIsConnected && saveConfigPending"
                :disabled="printerIsPrinting"
                :loading="loadings.includes('topbarSaveConfig')"
                @click="saveConfig">
                <v-icon class="d-md-none">mdi-content-save</v-icon><span class="d-none d-md-inline">{{ $t("App.TopBar.SAVE_CONFIG") }}</span>
            </v-btn>
            <v-btn
                color="primary"
                class="mr-5 button-min-width-auto px-3 d-none d-sm-flex"
                v-if="klippyIsConnected && ['standby', 'complete', 'cancelled'].includes(printer_state)"
                :loading="loadings.includes('btnUploadAndStart')"
                @click="btnUploadAndStart">
                <v-icon class="mr-md-2">mdi-file-upload</v-icon><span class="d-none d-md-inline">{{ $t("App.TopBar.UploadPrint") }}</span>
            </v-btn>
            <v-btn
                color="error"
                class="button-min-width-auto px-3"
                v-if="klippyIsConnected"
                :loading="loadings.includes('topbarEmergencyStop')"
                @click="btnEmergencyStop">
                <v-icon class="mr-md-2">mdi-alert-circle-outline</v-icon><span class="d-none d-md-flex">{{ $t("App.TopBar.EmergencyStop") }}</span>
            </v-btn>
            <the-settings-menu></the-settings-menu>
            <the-top-corner-menu></the-top-corner-menu>
        </v-app-bar>
        <v-snackbar
            :timeout="-1"
            :value="true"
            fixed
            right
            bottom
            dark
            v-model="uploadSnackbar.status"
        >
            <strong>{{ $t("App.TopBar.Uploading") }} {{ uploadSnackbar.filename }}</strong><br />
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
        <v-dialog v-model="showEmergencyStopDialog" width="400" :fullscreen="isMobile">
            <panel :title="$t('EmergencyStopDialog.EmergencyStop')" toolbar-color="error" card-class="emergency-stop-dialog" icon="mdi-alert-circle-outline" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon @click="showEmergencyStopDialog = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>{{ $t('EmergencyStopDialog.AreYouSure') }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="showEmergencyStopDialog = false">{{ $t('EmergencyStopDialog.No')}}</v-btn>
                    <v-btn color="primary" text @click="emergencyStop">{{$t('EmergencyStopDialog.Yes')}}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import {Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {validGcodeExtensions} from '@/store/variables'
import Component from 'vue-class-component'
import axios from 'axios'
import { formatFilesize } from '@/plugins/helpers'
import TheTopCornerMenu from '@/components/TheTopCornerMenu.vue'
import TheSettingsMenu from '@/components/TheSettingsMenu.vue'
import TheThrottledStates from '@/components/TheThrottledStates.vue'
import Panel from '@/components/ui/Panel.vue'

type uploadSnackbar = {
    status: boolean
    filename: string
    percent: number
    speed: number
    total: number
    cancelTokenSource: any
    lastProgress: {
        time: number
        loaded: number
    }
}

@Component({
    components: {
        Panel,
        TheThrottledStates,
        TheSettingsMenu,
        TheTopCornerMenu
    }
})
export default class TheTopbar extends Mixins(BaseMixin) {
    showEmergencyStopDialog = false

    uploadSnackbar: uploadSnackbar = {
        status: false,
        filename: '',
        percent: 0,
        speed: 0,
        total: 0,
        cancelTokenSource: null,
        lastProgress: {
            time: 0,
            loaded: 0
        }
    }

    formatFilesize = formatFilesize

    $refs!: {
        fileUploadAndStart: HTMLFormElement
    }

    get naviDrawer() {
        return this.$store.state.naviDrawer
    }

    set naviDrawer(newVal) {
        this.$store.dispatch('setNaviDrawer', newVal)
    }

    get validGcodeExtensions() {
        return validGcodeExtensions
    }

    get currentPage() {
        return this.$route.fullPath
    }

    get saveConfigPending() {
        return this.$store.state.printer.configfile?.save_config_pending ?? false
    }

    btnEmergencyStop() {
        const confirmOnEmergencyStop = this.$store.state.gui.general.confirmOnEmergencyStop
        if (confirmOnEmergencyStop) {
            this.showEmergencyStopDialog = true
        }
        else {
            this.emergencyStop()
        }
    }

    emergencyStop() {
        this.showEmergencyStopDialog = false
        this.$socket.emit('printer.emergency_stop', {}, { loading: 'topbarEmergencyStop' })
    }

    saveConfig() {
        this.$store.dispatch('server/addEvent', { message: 'SAVE_CONFIG', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'SAVE_CONFIG' }, { loading: 'topbarSaveConfig' })
    }

    btnUploadAndStart() {
        this.$refs.fileUploadAndStart.click()
    }

    async uploadAndStart() {
        if (this.$refs.fileUploadAndStart?.files.length) {
            this.$store.dispatch('socket/addLoading', { name: 'btnUploadAndStart' })
            let successFiles = []
            for (const file of this.$refs.fileUploadAndStart?.files) {
                const result = await this.doUploadAndStart(file)
                successFiles.push(result)
            }

            this.$store.dispatch('socket/removeLoading', { name: 'btnUploadAndStart' })
            for(const file of successFiles) {
                const text = this.$t('App.TopBar.UploadOfFileSuccessful', {file:file}).toString()
                this.$toast.success(text)
            }

            this.$refs.fileUploadAndStart.value = ''
            if (this.currentPage !== '/') await this.$router.push('/')
        }
    }

    doUploadAndStart(file: File) {
        const formData = new FormData()
        const filename = file.name.replace(' ', '_')

        this.uploadSnackbar.filename = filename
        this.uploadSnackbar.status = true
        this.uploadSnackbar.percent = 0
        this.uploadSnackbar.speed = 0
        this.uploadSnackbar.lastProgress.loaded = 0
        this.uploadSnackbar.lastProgress.time = 0

        formData.append('file', file, filename)
        formData.append('print', 'true')

        return new Promise(resolve => {
            this.uploadSnackbar.cancelTokenSource = axios.CancelToken.source()
            axios.post(this.apiUrl + '/server/files/upload',
                formData, {
                    cancelToken: this.uploadSnackbar.cancelTokenSource.token,
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent: ProgressEvent) => {
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
            ).then((result) => {
                this.uploadSnackbar.status = false
                resolve(result.data.result)
            }).catch(() => {
                this.uploadSnackbar.status = false
                this.$store.dispatch('socket/removeLoading', { name: 'btnUploadAndStart' })
                const text = this.$t('App.TopBar.CannotUploadTheFile').toString()
                this.$toast.error(text)
            })
        })
    }

    cancelUpload(): void {
        this.uploadSnackbar.cancelTokenSource.cancel()
        this.uploadSnackbar.status = false
    }
}
</script>