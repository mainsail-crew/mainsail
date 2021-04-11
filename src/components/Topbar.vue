<style>
    .button-min-width-auto {
        min-width: auto !important;
    }
</style>

<template>
    <div>
        <v-app-bar app elevate-on-scroll>
            <v-app-bar-nav-icon @click.stop="naviDrawer = !naviDrawer"></v-app-bar-nav-icon>
            <v-spacer></v-spacer>
            <template v-if="debugMode" class="mr-3">
                <span v-if="'jsHeapSizeLimit' in debugModeData.memory" class="mr-5">L: {{ formatFilesize(debugModeData.memory.jsHeapSizeLimit) }}</span>
                <span v-if="'totalJSHeapSize' in debugModeData.memory" class="mr-5">T: {{ formatFilesize(debugModeData.memory.totalJSHeapSize) }}</span>
                <span v-if="'usedJSHeapSize' in debugModeData.memory" class="mr-5">U: {{ formatFilesize(debugModeData.memory.usedJSHeapSize) }}</span>
            </template>
            <input type="file" ref="fileUploadAndStart" :accept="validGcodeExtensions.join(', ')" style="display: none" @change="uploadAndStart" />
            <v-btn color="primary" class="mr-5 d-none d-sm-flex" v-if="isConnected && save_config_pending" :disabled="['printing', 'paused'].includes(printer_state)" :loading="loadings.includes['topbarSaveConfig']" @click="clickSaveConfig">{{ $t("App.SAVECONFIG") }}</v-btn>
            <v-btn color="primary" class="mr-5 d-none d-sm-flex" v-if="isConnected && ['standby', 'complete'].includes(printer_state)" :loading="loadings.includes['btnUploadAndStart']" @click="btnUploadAndStart"><v-icon class="mr-2">mdi-file-upload</v-icon>{{ $t("App.UploadPrint") }}</v-btn>
            <v-btn color="error" class="button-min-width-auto px-3" v-if="isConnected" :loading="loadings.includes['topbarEmergencyStop']" @click="clickEmergencyStop"><v-icon class="mr-sm-2">mdi-alert-circle-outline</v-icon><span class="d-none d-sm-flex">{{ $t("App.EmergencyStop") }}</span></v-btn>
            <top-corner-menu></top-corner-menu>
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
            <strong>{{ $t("App.Uploading")}} {{ uploadSnackbar.filename }}</strong><br />
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
    </div>
</template>

<script>
import { mapState } from "vuex"
import TopCornerMenu from "@/components/TopCornerMenu"
import axios from "axios"
import { validGcodeExtensions } from "@/store/variables"

export default {
    components: {
        TopCornerMenu,
    },
    data: () => ({
        uploadSnackbar: {
            status: false,
            filename: "",
            percent: 0,
            speed: 0,
            total: 0,
            cancelTokenSource: "",
            lastProgress: {
                time: 0,
                loaded: 0
            }
        },
        debugModeData: {
            memory: {}
        },
        validGcodeExtensions: validGcodeExtensions
    }),
    created() {
        if(this.debugMode) this.getMemoryUsage()
    },
    computed: {
        ...mapState({
            debugMode: state => state.debugMode,
            loadings: state => state.socket.loadings,
            printer_state: state => state.printer.print_stats.state,
            isConnected: state => state.socket.isConnected,
            apiHost: state => state.socket.hostname,
            apiPort: state => state.socket.port,
            save_config_pending: state => state.printer.configfile.save_config_pending,
        }),
        naviDrawer: {
            get() {
                return this.$store.state.naviDrawer
            },
            set(newVal) {
                return this.$store.dispatch("setNaviDrawer", newVal)
            }
        },
        currentPage: {
            get() {
                return this.$route.fullPath
            }
        },
    },
    methods: {
        clickEmergencyStop: function() {
            this.$store.commit('socket/addLoading', { name: 'topbarEmergencyStop' });
            this.$socket.sendObj('printer.emergency_stop', {}, 'socket/removeLoading',{ name: 'topbarEmergencyStop' });
        },
        clickSaveConfig: function() {
            this.$store.commit('server/addEvent', { message: "SAVE_CONFIG", type: "command" });
            this.$store.commit('socket/addLoading', { name: 'topbarSaveConfig' });
            this.$socket.sendObj('printer.gcode.script', { script: "SAVE_CONFIG" }, 'socket/removeLoading', { name: 'topbarSaveConfig' });
        },
        btnUploadAndStart: function() {
            this.$refs.fileUploadAndStart.click()
        },
        async uploadAndStart() {
            if (this.$refs.fileUploadAndStart.files.length) {
                this.$store.commit('socket/addLoading', { name: 'btnUploadAndStart' })
                let successFiles = []
                for (const file of this.$refs.fileUploadAndStart.files) {
                    const result = await this.doUploadAndStart(file)
                    successFiles.push(result)
                }

                this.$store.commit('socket/removeLoading', { name: 'gcodeUpload' })
                for(const file of successFiles) {
                    this.$toast.success("Upload of "+file+" successful!")
                }

                this.$refs.fileUploadAndStart.value = ''
                if (this.currentPage !== "/") await this.$router.push("/");
            }
        },
        doUploadAndStart(file) {
            let toast = this.$toast
            let formData = new FormData()
            let filename = file.name.replace(" ", "_")

            this.uploadSnackbar.filename = filename
            this.uploadSnackbar.status = true
            this.uploadSnackbar.percent = 0
            this.uploadSnackbar.speed = 0
            this.uploadSnackbar.lastProgress.loaded = 0
            this.uploadSnackbar.lastProgress.time = 0

            formData.append('file', file, filename)
            formData.append('print', true)

            return new Promise(resolve => {
                this.uploadSnackbar.cancelTokenSource = axios.CancelToken.source();
                axios.post('//' + this.apiHost + ':' + this.apiPort + '/server/files/upload',
                    formData, {
                        cancelToken: this.uploadSnackbar.cancelTokenSource.token,
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: (progressEvent) => {
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
                    this.$store.commit('socket/removeLoading', { name: 'btnUploadAndStart' })
                    toast.error("Cannot upload the file!")
                })
            })
        },
        cancelUpload: function() {
            this.uploadSnackbar.cancelTokenSource.cancel()
            this.uploadSnackbar.status = false
        },
        formatFilesize(fileSizeInBytes) {
            let i = -1
            let byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
            do {
                fileSizeInBytes = fileSizeInBytes / 1024
                i++
            } while (fileSizeInBytes > 1024)

            return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
        },
        getMemoryUsage() {
            if ('memory' in performance) {
                if ('jsHeapSizeLimit' in performance.memory)
                    this.debugModeData.memory.jsHeapSizeLimit = performance.memory.jsHeapSizeLimit

                if ('totalJSHeapSize' in performance.memory)
                    this.debugModeData.memory.totalJSHeapSize = performance.memory.totalJSHeapSize

                if ('usedJSHeapSize' in performance.memory)
                    this.debugModeData.memory.usedJSHeapSize = performance.memory.usedJSHeapSize
            }

            setTimeout(() => { this.getMemoryUsage() }, 1000)
        },
    }
}
</script>