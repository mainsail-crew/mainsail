<style>
    @import './assets/styles/fonts.css';
    @import './assets/styles/toastr.css';
    @import './assets/styles/page.scss';
    @import './assets/styles/utils.scss';
    @import './assets/styles/updateManager.scss';

    .button-min-width-auto {
        min-width: auto !important;
    }

    #page-container {
        max-width: 1400px;
    }

    #sidebarVersions {
        position: absolute;
        left: 0;
        bottom: 0;
    }
</style>

<template>
    <v-app>
        <vue-headful :title="getTitle" />
        <v-navigation-drawer
            class="sidebar-wrapper" persistent v-model="drawer" enable-resize-watcher fixed app
            :src="sidebarBackground"
        >
            <div id="nav-header">
                <img :src="sidebarLogo" />
                <v-toolbar-title>{{ printername !== "" ? printername : hostname }}</v-toolbar-title>
            </div>
            <ul class="navi" :expand="$vuetify.breakpoint.mdAndUp">
                <printer-selecter></printer-selecter>
                <li v-for="(category, index) in routes" :key="index" :prepend-icon="category.icon"
                    :class="[category.path !== '/' && currentPage.includes(category.path) ? 'active' : '', 'nav-item']"
                    :value="true"
                    >
                    <router-link
                        style="position: relative;"
                        slot="activator" class="nav-link" exact :to="category.path" @click.prevent
                        v-if="getBoolShowInNavi(category)">
                        <v-icon>mdi-{{ category.icon }}</v-icon>
                        <v-icon
                            small
                            color="warning"
                            style="
                                top: 11px;
                                left: 32px;
                                position: absolute;
                            "
                            v-if="category.title === 'Settings' && isUpdateAvailable"
                        >mdi-progress-upload</v-icon>
                        <span class="nav-title">
                            {{ $t(`Router.${category.title}`) }}
                        </span>
                        <v-icon class="nav-arrow" v-if="category.children && category.children.length > 0">mdi-chevron-down</v-icon>
                    </router-link>

                    <ul class="child">
                        <li v-for="(page, pageIndex) in category.children" class="nav-item" v-bind:key="`${index}-${pageIndex}`">
                            <router-link :to="page.path" class="nav-link" @click.prevent v-if="klippy_state !== 'error' || page.alwaysShow">
                                <v-icon>mdi-{{ page.icon }}</v-icon>
                                <span class="nav-title">{{ $t(`Router.${page.title}`) }}</span>
                            </router-link>
                        </li>
                    </ul>
                </li>
            </ul>
            <p id="sidebarVersions" class="mb-0 text-body-2 pl-3 pb-2">
                v{{ getVersion }}<span class="" v-if="klipperVersion"> - {{ klipperVersion.substr(0, klipperVersion.lastIndexOf('-')) }}</span>
            </p>
        </v-navigation-drawer>

        <v-app-bar app elevate-on-scroll>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
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

        <v-main id="content" v-bind:style="{background:mainBackground,backgroundAttachment:'fixed',backgroundSize: 'cover',backgroundRepeat: 'no-repeat'}">
            <v-scroll-y-transition>
                <v-container fluid id="page-container" class="container px-3 px-sm-6 py-sm-6 mx-auto">
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </v-container>
            </v-scroll-y-transition>
        </v-main>

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

        <select-printer-dialog v-if="remoteMode"></select-printer-dialog>
        <connecting-dialog v-if="!remoteMode"></connecting-dialog>
        <update-dialog></update-dialog>
    </v-app>
</template>

<script>
    import routes from './routes'
    import { mapState, mapGetters } from 'vuex'
    import TopCornerMenu from "@/components/TopCornerMenu"
    import UpdateDialog from "@/components/UpdateDialog"
    import ConnectingDialog from "@/components/ConnectingDialog"
    import SelectPrinterDialog from "@/components/SelectPrinterDialog"
    import PrinterSelecter from "@/components/PrinterSelecter"
    import axios from "axios"
    import { validGcodeExtensions } from "@/store/variables"

export default {
    props: {
        source: String,
    },
    components: {
        PrinterSelecter,
        ConnectingDialog,
        SelectPrinterDialog,
        UpdateDialog,
        TopCornerMenu,
    },
    data: () => ({
        drawer: null,
        activeClass: 'active',
        routes: routes.filter((element) => element.title !== "Printers"),
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
    created () {
        this.$vuetify.theme.dark = true

        if(this.debugMode) this.getMemoryUsage()
    },
    computed: {
        currentPage: function() {
          return this.$route.fullPath;
        },
        ...mapState({
            language: state => state.gui.general.language,
            isConnected: state => state.socket.isConnected,
            hostname: state => state.printer.hostname,
            apiHost: state => state.socket.hostname,
            apiPort: state => state.socket.port,
            klippy_state: state => state.server.klippy_state,
            printer_state: state => state.printer.print_stats.state,
            loadings: state => state.socket.loadings,

            printername: state => state.gui.general.printername,
            current_file: state => state.printer.print_stats.filename,
            boolNaviWebcam: state => state.gui.webcam.bool,
            save_config_pending: state => state.printer.configfile.save_config_pending,

            klipperVersion: state => state.printer.software_version,
            remoteMode: state => state.socket.remoteMode,
            klipperConfigfileSettings: state => state.printer.configfile.settings,
            moonrakerComponents: state => state.server.components,

            debugMode: state => state.debugMode,
        }),
        ...mapGetters([
            'getTitle',
            'getVersion',
        ]),
        print_percent: {
            get() {
                return this.$store.getters["printer/getPrintPercent"]
            }
        },
        defaultFavicons: {
            get() {
                return this.$store.getters["files/getFavicons"]
            }
        },
        sidebarLogo: {
            get() {
                return this.$store.getters["files/getSidebarLogo"]
            }
        },
        sidebarBackground: {
            get() {
                return this.$store.getters["files/getSidebarBackground"]
            }
        },
        mainBackground: {
            get() {
                return this.$store.getters["files/getMainBackground"]
            }
        },
        customStylesheet: {
            get() {
                return this.$store.getters["files/getCustomStylesheet"]
            }
        },
        isUpdateAvailable: {
            get() {
                return this.$store.getters["server/updateManager/isUpdateAvailable"]
            }
        }
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
                this.$router.push("/");
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
        getBoolShowInNavi(route) {
            if (['shutdown', 'error', 'disconnected'].includes(this.klippy_state) && !route.alwaysShow) return false

            if (route.component?.name === 'webcam') return this.boolNaviWebcam

            if ('moonrakerComponent' in route) return this.moonrakerComponents.includes(route.moonrakerComponent)
            if ('klipperComponent' in route) return (route.klipperComponent in this.klipperConfigfileSettings)

            return true
        },
        drawFavicon(val) {
            let favicon16 = document.querySelector("link[rel*='icon'][sizes='16x16']")
            let favicon32 = document.querySelector("link[rel*='icon'][sizes='32x32']")

            if (val > 0 && val < 100) {
                let faviconSize = 64;

                let canvas = document.createElement('canvas');
                canvas.width = faviconSize;
                canvas.height = faviconSize;
                let context = canvas.getContext('2d');
                let centerX = canvas.width / 2;
                let centerY = canvas.height / 2;
                let radius = 32;
                let percent = (val * 100).toFixed(0);

                /* draw the grey circle */
                context.beginPath();
                context.moveTo(centerX, centerY);
                context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                context.closePath();
                context.fillStyle = "#ddd";
                context.fill();
                context.strokeStyle = "rgba(200, 208, 218, 0.66)";
                context.stroke();

                /* draw the green circle based on percentage */
                let startAngle = 1.5 * Math.PI;
                let endAngle = 0;
                let unitValue = (Math.PI - 0.5 * Math.PI) / 25;
                if (percent >= 0 && percent <= 25) endAngle = startAngle + (percent * unitValue);
                else if (percent > 25 && percent <= 50) endAngle = startAngle + (percent * unitValue);
                else if (percent > 50 && percent <= 75) endAngle = startAngle + (percent * unitValue);
                else if (percent > 75 && percent <= 100) endAngle = startAngle + (percent * unitValue);

                context.beginPath();
                context.moveTo(centerX, centerY);
                context.arc(centerX, centerY, radius, startAngle, endAngle, false);
                context.closePath();
                context.fillStyle = "#e41313";
                context.fill();

                favicon16.href = canvas.toDataURL('image/png')
                favicon32.href = canvas.toDataURL('image/png')
            } else {
                const [favicon16Default, favicon32Default] = this.defaultFavicons
                favicon16.href = favicon16Default
                favicon32.href = favicon32Default
            }
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
    },
    watch: {
        language(){
            this.$i18n.locale = this.language;
        },
        print_percent() {
            this.drawFavicon(this.print_percent);
        },
        current_file: {
            handler: function(newVal) {
                this.$socket.sendObj("server.files.metadata", { filename: newVal }, "files/getMetadataCurrentFile");
            }
        },
        customStylesheet(newVal) {
            if (newVal !== null) {
                let style = document.getElementById("customStylesheet")
                if (!style) {
                    style = document.createElement('link')
                    style.id = "customStylesheet"
                    style.type = "text/css"
                    style.rel = "stylesheet"
                }

                style.href = newVal
                document.head.appendChild(style)
            } else {
                let style = document.getElementById("customStylesheet")
                if (style) style.remove()
            }
        },
        defaultFavicons() {
            this.drawFavicon(this.print_percent);
        }
    },
}
</script>

<style>
    body {
      background: #121212;
    }
    /*.sidebar-wrapper:before {
        position: absolute;
        content: ' ';
        top: 0; right: 0; bottom: 0; left: 0;
        background: #000;
        opacity: .5;
    }*/

    #nav-header {
        text-align: center;
        border-bottom: 1px solid #ffffff40;
        margin-bottom: 1em;
        padding: .75em 0 .75em 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #nav-header img {
        height: 40px;
        margin-right: 1em;
    }

    #nav-header .v-toolbar__title {
        font-size: 24px;
        vertical-align: middle;
    }

    .v-navigation-drawer__content {
        z-index: 10;
    }

    nav ul.navi {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    nav ul.navi li.nav-item {
        padding: 0;
        margin: 0;
    }

    nav ul.navi .nav-link {
        display: block;
        color: white;
        border-radius: .5em;
        line-height: 30px;
        font-size: 14px;
        font-weight: 600;
        padding: 10px 15px;
        opacity: .85;
        transition: all .15s ease-in;
        text-decoration: none;
        margin: 0.5em 1em;
    }

    nav ul.navi .nav-link:hover,
    nav ul.navi li.active>.nav-link,
    nav ul.navi .nav-link.router-link-active {
        background: rgba(255,255,255,.3);
        opacity: 1;
    }

    nav ul.navi li.active>.nav-link i.nav-arrow ,
    nav ul.navi .nav-link.router-link-active i.nav-arrow {
        transform: rotate(0);
    }

    nav ul.navi .nav-link>i.v-icon {
        color: white;
        font-size: 1.7em;
        margin-right: .5em;
    }

    nav ul.navi .nav-link>span.nav-title {
        line-height: 30px;
        font-weight: 600;
        text-transform: uppercase;
        white-space: nowrap;
        letter-spacing: 1px;
    }

    nav ul.navi .nav-link>.nav-arrow {
        float: right;
        margin-top: 5px;
        margin-right: 0;
        transform: rotate(90deg);
    }
    nav ul.navi .nav-link>.nav-arrow.right {
        transform: rotate(-90deg);
    }

    nav ul.navi>li>ul.child {
        display: none;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    nav ul.navi>li>a.router-link-active+ul.child,
    nav ul.navi>li.active>ul.child {
        display: block;
    }

    nav ul.navi>li>ul.child .nav-link {
        padding: 5px 15px 5px 15px;
    }

    nav ul.navi>li>ul.child .nav-link:hover,
    nav ul.navi>li>ul.child .nav-link.router-link-active {
        background: rgba(255,255,255,.2);
    }

    nav ul.navi>li>ul.child .nav-link>span.nav-title {
        text-transform: capitalize;
        font-weight: 400;
        font-size: 14px;
    }

    .v-btn--absolute.v-btn--bottom, .v-btn--fixed.v-btn--bottom {
        bottom: 52px;
    }


</style>
