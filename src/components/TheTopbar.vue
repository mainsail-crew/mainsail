<style>
    .topbar .v-toolbar__content {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }
</style>
<style scoped>
    .button-min-width-auto {
        min-width: auto !important;
    }
    .topbar .v-btn {
        height: 100% !important;
        max-height: none;
    }
    .topbar .v-btn.v-btn--icon {
        width: var(--topbar-icon-btn-width) !important;
    }
    @media (min-width: 768px) {
        header.topbar {
            z-index: 8 !important;
        }
    }
</style>

<template>
    <div>
        <v-app-bar app elevate-on-scroll :height="topbarHeight" class="topbar pa-0" clipped-left>
            <v-app-bar-nav-icon tile @click.stop="naviDrawer = !naviDrawer"></v-app-bar-nav-icon>
            <router-link to="/">
                <template v-if="sidebarLogo">
                    <img :src="sidebarLogo" style="height: 32px;" class="nav-logo ml-4 mr-1 d-none d-sm-flex" alt="Logo" />
                </template>
                <template v-else>
                    <mainsail-logo :color="logoColor" style="height: 32px;" class="nav-logo ml-4 mr-1 d-none d-sm-flex" router to="/" :ripple="false"></mainsail-logo>
                </template>
            </router-link>
            <v-toolbar-title class="text-no-wrap ml-0 pl-2 mr-2">{{ printerName }}</v-toolbar-title>
            <printer-selector v-if="countPrinters"></printer-selector>
            <v-spacer></v-spacer>
            <the-throttled-states></the-throttled-states>
            <input type="file" ref="fileUploadAndStart" :accept="validGcodeExtensions.join(', ')" style="display: none" @change="uploadAndStart" />
            <v-btn tile
                :icon="$vuetify.breakpoint.smAndDown"
                :text="$vuetify.breakpoint.mdAndUp"
                color="primary"
                class="button-min-width-auto px-3 d-none d-sm-flex save-config-button"
                v-if="klippyIsConnected && saveConfigPending"
                :disabled="printerIsPrinting"
                :loading="loadings.includes('topbarSaveConfig')"
                @click="saveConfig">
                <v-icon class="d-md-none">mdi-content-save</v-icon><span class="d-none d-md-inline">{{ $t("App.TopBar.SAVE_CONFIG") }}</span>
            </v-btn>
            <v-btn tile
                :icon="$vuetify.breakpoint.smAndDown"
                :text="$vuetify.breakpoint.mdAndUp"
                color="primary"
                class="button-min-width-auto px-3 d-none d-sm-flex upload-and-start-button"
                v-if="klippyIsConnected && ['standby', 'complete', 'cancelled'].includes(printer_state) && !boolHideUploadAndPrintButton"
                :loading="loadings.includes('btnUploadAndStart')"
                @click="btnUploadAndStart">
                <v-icon class="mr-md-2">mdi-file-upload</v-icon><span class="d-none d-md-inline">{{ $t("App.TopBar.UploadPrint") }}</span>
            </v-btn>
            <v-btn tile
                :icon="$vuetify.breakpoint.smAndDown"
                :text="$vuetify.breakpoint.mdAndUp"
                color="error"
                class="button-min-width-auto px-3 emergency-button"
                v-if="klippyIsConnected"
                :loading="loadings.includes('topbarEmergencyStop')"
                @click="btnEmergencyStop">
                <v-icon class="mr-md-2">mdi-alert-circle-outline</v-icon><span class="d-none d-md-inline">{{ $t("App.TopBar.EmergencyStop") }}</span>
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
                    <v-btn icon tile @click="showEmergencyStopDialog = false"><v-icon>mdi-close-thick</v-icon></v-btn>
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
import PrinterSelector from '@/components/ui/PrinterSelector.vue'
import MainsailLogo from '@/components/ui/MainsailLogo.vue'
import {topbarHeight} from '@/store/variables'

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
        TheTopCornerMenu,
        PrinterSelector,
        MainsailLogo
    }
})
export default class TheTopbar extends Mixins(BaseMixin) {
    topbarHeight = topbarHeight

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

    get printerName():string {
        if (this.$store.state.gui.general.printername.length)
            return this.$store.state.gui.general.printername

        return this.$store.state.printer.hostname
    }

    get boolWideNavDrawer() {
        return this.$store.state.gui.uiSettings.boolWideNavDrawer ?? false
    }

    get countPrinters() {
        return this.$store.getters['farm/countPrinters']
    }

    get boolHideUploadAndPrintButton() {
        return this.$store.state.gui.uiSettings.boolHideUploadAndPrintButton ?? false
    }

    get sidebarLogo(): string {
        return this.$store.getters['files/getSidebarLogo']
    }

    get logoColor(): string {
        return this.$store.state.gui.uiSettings.logo
    }

    btnEmergencyStop() {
        const confirmOnEmergencyStop = this.$store.state.gui.uiSettings.confirmOnEmergencyStop
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
        const filename = file.name

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