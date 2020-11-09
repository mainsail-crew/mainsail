<style>
    @import './assets/styles/fonts.css';

    .button-min-width-auto {
        min-width: auto !important;
    }
</style>

<template>
    <v-app>
        <vue-headful
                :title="getTitle"
        />
        <v-navigation-drawer
            class="sidebar-wrapper" persistent v-model="drawer" enable-resize-watcher fixed app
            :src="require('./assets/bg-navi.jpg')"
        >
            <div id="nav-header">
                <img :src="require('./assets/logo.svg')" />
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
                            (category.title === 'Heightmap' && boolNaviHeightmap) ||
                            (
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
        </v-navigation-drawer>

        <v-app-bar app elevate-on-scroll>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-spacer></v-spacer>
            <v-btn color="primary" class="mr-5" v-if="isConnected && save_config_pending" :loading="loadingConfigChanged" @click="clickSaveConfig">SAVE CONFIG</v-btn>
            <v-btn color="error" class="button-min-width-auto px-3" v-if="isConnected" :loading="loadingEmergencyStop" @click="clickEmergencyStop"><v-icon class="mr-sm-2">mdi-alert-circle-outline</v-icon><span class="d-none d-sm-flex">Emergency Stop</span></v-btn>
            <v-menu
                bottom
                left
                :offset-y="true"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        dark
                        icon
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>

                <v-list dense>
                    <v-list-item link @click="doRestart()">
                        <v-list-item-title><v-icon class="mr-3">mdi-sync</v-icon>Restart</v-list-item-title>
                    </v-list-item>
                    <v-list-item link @click="doFirmwareRestart()">
                        <v-list-item-title><v-icon class="mr-3">mdi-sync</v-icon>FW Restart</v-list-item-title>
                    </v-list-item>
                    <v-list-item link @click="doHostReboot()">
                        <v-list-item-title><v-icon class="mr-3">mdi-power</v-icon>Reboot Host</v-list-item-title>
                    </v-list-item>
                    <v-list-item link @click="doHostShutdown()">
                        <v-list-item-title><v-icon class="mr-3">mdi-power</v-icon>Shutdown Host</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-main id="content">
            <v-scroll-y-transition>
                <v-container fluid id="page-container" class="container">
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </v-container>
            </v-scroll-y-transition>
        </v-main>

        <v-dialog v-model="isConnecting"  persistent width="300">
            <v-card color="primary" dark >
                <v-card-text class="pt-2">
                    Connecting...
                    <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-footer app class="d-block">
            <span>v{{ getVersion }}</span>
            <span v-if="version" class="d-none d-sm-inline"> - {{ version }}</span>
            <span class="float-right">Made with <img src="/img/heart.png" height="15" title="love" alt="heard" /> by <a href="http://www.vorondesign.com/" target="_blank"><img src="/img/voron.png" height="15" title="VoronDesign" alt="Logo - VoronDesign" /></a></span>
        </v-footer>
    </v-app>
</template>

<script>
    import routes from './routes';
    import { mapState, mapGetters } from 'vuex';

export default {
    props: {
        source: String,
    },
    components: {

    },
    data: () => ({
        drawer: null,
        activeClass: 'active',
        routes: routes,
        //is_ready: false,
        boolNaviHeightmap: false,
        loadingEmergencyStop: false,
        loadingConfigChanged: false,
    }),
    created () {
        this.$vuetify.theme.dark = true;
        //this.is_ready = (this.klippy_state === "ready") ? true : false;
        this.boolNaviHeightmap = (typeof(this.config.bed_mesh) !== "undefined");
    },
    computed: {
        currentPage: function() {
          return this.$route.fullPath;
        },
        ...mapState({
            toolhead: state => state.printer.toolhead,
            hostname: state => state.printer.hostname,
            printername: state => state.gui.general.printername,
            version: state => state.printer.software_version,
            isConnected: state => state.socket.isConnected,
            isConnecting: state => !state.socket.isConnected,
            virtual_sdcard: state => state.printer.virtual_sdcard,
            current_file: state => state.printer.print_stats.filename,
            boolNaviWebcam: state => state.gui.webcam.bool,
            klippy_state: state => state.printer.webhooks.state,
            loadings: state => state.loadings,
            config: state => state.printer.configfile.config,
            save_config_pending: state => state.printer.configfile.save_config_pending,
        }),
        ...mapGetters([
            'getTitle',
            'getVersion'
        ])
    },
    methods: {
        clickEmergencyStop: function() {
            this.$store.commit('setLoading', { name: 'btnEmergencyStop' });
            this.$socket.sendObj('printer.emergency_stop', {});
        },
        clickSaveConfig: function() {
            this.$store.commit('addGcodeResponse', "SAVE_CONFIG");
            this.$store.commit('setLoading', { name: 'btnSaveConfig' });
            this.$socket.sendObj('printer.gcode.script', { script: "SAVE_CONFIG" });
        },
        doRestart: function() {
            this.$store.commit('setPrinterData', { webhooks: { state: "restart", state_message: "Printer is restarting..."}});
            this.$store.commit('addGcodeResponse', "RESTART");
            this.$socket.sendObj('printer.gcode.script', { script: "RESTART" });
        },
        doFirmwareRestart: function() {
            this.$store.commit('setPrinterData', { webhooks: { state: "restart", state_message: "Printer is restarting..."}});
            this.$store.commit('addGcodeResponse', "FIRMWARE_RESTART");
            this.$socket.sendObj('printer.gcode.script', { script: "FIRMWARE_RESTART" });
        },
        doHostReboot: function() {
            this.$socket.sendObj('machine.reboot', { });
        },
        doHostShutdown: function() {
            this.$socket.sendObj('machine.shutdown', { });
        },
        drawFavicon(val) {
            let favicon16 = document.querySelector("link[rel*='icon'][sizes='16x16']");
            let favicon32 = document.querySelector("link[rel*='icon'][sizes='32x32']");
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

                favicon16.href = canvas.toDataURL('image/png');
                favicon32.href = canvas.toDataURL('image/png');
            } else {
                favicon16.href = "/img/icons/favicon-16x16.png"
                favicon32.href = "/img/icons/favicon-32x32.png"
            }
        }
    },
    watch: {
        virtual_sdcard: {
            deep: true,
            handler: function(val) {
                let progress = (val && val.progress) ? val.progress : 0;

                this.drawFavicon(progress);
            }
        },
        current_file: {
            handler: function(newVal) {
                this.$socket.sendObj("server.files.metadata", { filename: newVal }, "getMetadataCurrentFile");
            }
        },
        config() {
            this.boolNaviHeightmap = (typeof(this.config.bed_mesh) !== "undefined");
        },
        loadings: function(loadings) {
            this.loadingEmergencyStop = loadings.includes('btnEmergencyStop');
            this.loadingConfigChanged = loadings.includes('btnSaveConfig');
        }
    },
}
</script>

<style>
    .sidebar-wrapper:before {
        position: absolute;
        content: ' ';
        top: 0; right: 0; bottom: 0; left: 0;
        background: #000;
        opacity: .7;
    }

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
