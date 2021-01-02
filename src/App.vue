<style>
    @import './assets/styles/fonts.css';
    @import './assets/styles/toastr.css';

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
                <li v-for="(category, index) in routes" :key="index" :prepend-icon="category.icon"
                    :class="[category.path !== '/' && currentPage.includes(category.path) ? 'active' : '', 'nav-item']"
                    :value="true"
                    >
                    <router-link
                        slot="activator" class="nav-link" exact :to="category.path" @click.prevent
                        v-if="
                            (category.title === 'Webcam' && boolNaviWebcam) ||
                            (category.title === 'Heightmap' && boolNaviHeightmap) || (
                                category.title !== 'Webcam' &&
                                category.title !== 'Heightmap' &&
                                (klippy_state !== 'error' || category.alwaysShow)
                            )
                        ">
                        <v-icon>mdi-{{ category.icon }}</v-icon>
                        <span class="nav-title">{{ category.title }}</span>
                        <v-icon class="nav-arrow" v-if="category.children && category.children.length > 0">mdi-chevron-down</v-icon>
                    </router-link>

                    <ul class="child">
                        <li v-for="(page, pageIndex) in category.children" class="nav-item" v-bind:key="`${index}-${pageIndex}`">
                            <router-link :to="page.path" class="nav-link" @click.prevent v-if="klippy_state !== 'error' || page.alwaysShow">
                                <v-icon>mdi-{{ page.icon }}</v-icon>
                                <span class="nav-title">{{ page.title }}</span>
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
            <v-btn color="primary" class="mr-5 d-none d-sm-flex" v-if="isConnected && save_config_pending" :disabled="['printing', 'paused'].includes(printer_state)" :loading="loadings.includes['topbarSaveConfig']" @click="clickSaveConfig">SAVE CONFIG</v-btn>
            <v-btn color="error" class="button-min-width-auto px-3" v-if="isConnected" :loading="loadings.includes['topbarEmergencyStop']" @click="clickEmergencyStop"><v-icon class="mr-sm-2">mdi-alert-circle-outline</v-icon><span class="d-none d-sm-flex">Emergency Stop</span></v-btn>
            <top-corner-menu></top-corner-menu>
        </v-app-bar>

        <v-main id="content">
            <v-scroll-y-transition>
                <v-container fluid id="page-container" class="container px-3 px-sm-6 py-sm-6 mx-auto">
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </v-container>
            </v-scroll-y-transition>
        </v-main>

        <v-dialog v-model="overlayDisconnect" persistent width="300">
            <v-card color="primary" dark >
                <v-card-text class="pt-2">
                    Connecting...
                    <v-progress-linear indeterminate color="white" class="mb-0 mt-2"></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>

        <update-dialog></update-dialog>
    </v-app>
</template>

<script>
    import routes from './routes'
    import { mapState, mapGetters } from 'vuex'
    import TopCornerMenu from "@/components/TopCornerMenu"
    import UpdateDialog from "@/components/UpdateDialog"

export default {
    props: {
        source: String,
    },
    components: {
        UpdateDialog,
        TopCornerMenu,

    },
    data: () => ({
        overlayDisconnect: true,
        drawer: null,
        activeClass: 'active',
        routes: routes,
        boolNaviHeightmap: false,
    }),
    created () {
        this.$vuetify.theme.dark = true;
        this.boolNaviHeightmap = (typeof(this.config.bed_mesh) !== "undefined");
    },
    computed: {
        currentPage: function() {
          return this.$route.fullPath;
        },
        ...mapState({
            isConnected: state => state.socket.isConnected,
            hostname: state => state.printer.hostname,
            klippy_state: state => state.server.klippy_state,
            printer_state: state => state.printer.print_stats.state,
            loadings: state => state.socket.loadings,

            toolhead: state => state.printer.toolhead,
            printername: state => state.gui.general.printername,
            virtual_sdcard: state => state.printer.virtual_sdcard,
            current_file: state => state.printer.print_stats.filename,
            boolNaviWebcam: state => state.gui.webcam.bool,
            config: state => state.printer.configfile.config,
            save_config_pending: state => state.printer.configfile.save_config_pending,

            klipperVersion: state => state.printer.software_version,
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
        customStylesheet: {
            get() {
                return this.$store.getters["files/getCustomStylesheet"]
            }
        },
    },
    methods: {
        clickEmergencyStop: function() {
            this.$store.commit('socket/addLoading', { name: 'topbarEmergencyStop' });
            this.$socket.sendObj('printer.emergency_stop', {}, 'socket/removeLoading',{ name: 'topbarEmergencyStop' });
        },
        clickSaveConfig: function() {
            this.$store.commit('server/addEvent', "SAVE_CONFIG");
            this.$store.commit('socket/addLoading', { name: 'topbarSaveConfig' });
            this.$socket.sendObj('printer.gcode.script', { script: "SAVE_CONFIG" }, 'socket/removeLoading', { name: 'topbarSaveConfig' });
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
                let percent = val * 100;

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

                //favicon16.href = canvas.toDataURL('image/png')
                favicon32.href = canvas.toDataURL('image/png')
            } else {
                const [favicon16Default, favicon32Default] = this.defaultFavicons
                favicon16.href = favicon16Default
                favicon32.href = favicon32Default
            }
        }
    },
    watch: {
        print_percent() {
            this.drawFavicon(this.print_percent);
        },
        current_file: {
            handler: function(newVal) {
                this.$socket.sendObj("server.files.metadata", { filename: newVal }, "files/getMetadataCurrentFile");
            }
        },
        config() {
            this.boolNaviHeightmap = (typeof(this.config.bed_mesh) !== "undefined");
        },
        isConnected(newVal) {
            this.overlayDisconnect = !newVal;
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

    nav ul.navi a.nav-link {
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

    nav ul.navi a.nav-link:hover,
    nav ul.navi li.active>a.nav-link,
    nav ul.navi a.nav-link.router-link-active {
        background: rgba(255,255,255,.3);
        opacity: 1;
    }

    nav ul.navi li.active>a.nav-link i.nav-arrow ,
    nav ul.navi a.nav-link.router-link-active i.nav-arrow {
        transform: rotate(0);
    }

    nav ul.navi a.nav-link>i.v-icon {
        color: white;
        font-size: 1.7em;
        margin-right: .5em;
    }

    nav ul.navi a.nav-link>span.nav-title {
        line-height: 30px;
        font-weight: 600;
        text-transform: uppercase;
        white-space: nowrap;
        letter-spacing: 1px;
    }

    nav ul.navi a.nav-link>i.nav-arrow {
        float: right;
        margin-top: 5px;
        margin-right: 0;
        transform: rotate(90deg);
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

    nav ul.navi>li>ul.child a.nav-link {
        padding: 5px 15px 5px 15px;
    }

    nav ul.navi>li>ul.child a.nav-link:hover,
    nav ul.navi>li>ul.child a.nav-link.router-link-active {
        background: rgba(255,255,255,.2);
    }

    nav ul.navi>li>ul.child a.nav-link>span.nav-title {
        text-transform: capitalize;
        font-weight: 400;
        font-size: 14px;
    }

    .v-btn--absolute.v-btn--bottom, .v-btn--fixed.v-btn--bottom {
        bottom: 52px;
    }


</style>
