<template>
    <v-app>
        <v-navigation-drawer
            class="sidebar-wrapper" persistent v-model="drawer" enable-resize-watcher fixed app
            :src="require('./assets/bg-navi.jpg')"
        >
            <div id="nav-header">
                <img :src="require('./assets/logo.svg')" />
                <v-toolbar-title>{{ hostname }}</v-toolbar-title>
            </div>
            <ul class="navi" :expand="$vuetify.breakpoint.mdAndUp">
                <li v-for="(category, index) in routes" :key="index" :prepend-icon="category.icon" :class="[category.path !== '/' && currentPage.includes(category.path) ? 'active' : '', 'nav-item']" :value="true">
                    <router-link slot="activator" class="nav-link" exact :to="category.path" @click.prevent>
                        <v-icon>mdi-{{ category.icon }}</v-icon>
                        <span class="nav-title">{{ category.title }}</span>
                        <v-icon class="nav-arrow" v-if="category.children && category.children.length > 0">mdi-chevron-down</v-icon>
                    </router-link>

                    <ul class="child">
                        <li v-for="(page, pageIndex) in category.children" class="nav-item" v-bind:key="`${index}-${pageIndex}`">
                            <router-link :to="page.path" class="nav-link" @click.prevent>
                                <v-icon>mdi-{{ page.icon }}</v-icon>
                                <span class="nav-title">{{ page.title }}</span>
                            </router-link>
                        </li>
                    </ul>
                </li>
            </ul>
        </v-navigation-drawer>

        <v-app-bar app absolute
                   elevate-on-scroll>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-spacer></v-spacer>
            <!--<v-btn color="green" v-if="!isConnected" :loading="loadingEmergencyStop" @click="emergencyStop"><v-icon class="mr-2">mdi-refresh-circle</v-icon> reconnect</v-btn>-->
            <v-btn color="error" v-if="isConnected" :loading="loadingEmergencyStop" @click="emergencyStop">Emergency Stop</v-btn>
        </v-app-bar>

        <v-content id="content">
            <v-scroll-y-transition>
                <v-container fluid id="page-container" class="container">
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </v-container>
            </v-scroll-y-transition>
        </v-content>

        <v-dialog v-model="isConnecting"  persistent width="300">
            <v-card color="primary" dark >
                <v-card-text class="pt-2">
                    Connecting to Klipper
                    <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-footer app class="d-block">
            <span v-if="version">{{ version }}</span>
            <span class="float-right">&copy; 2020</span>
        </v-footer>
    </v-app>
</template>

<script>
    import routes from './routes';
    import { mapState } from 'vuex';

export default {
    props: {
        source: String,
    },
    components: {

    },
    data: () => ({
        drawer: null,
        activeClass: 'active',
        routes: routes
    }),
    created () {
        this.$vuetify.theme.dark = true,
        this.$socket.onOpen = () => {
            this.$socket.sendObj('get_printer_info', {}, 'getKlipperInfo');
            this.$socket.sendObj('get_printer_objects', {}, 'getObjectInfo');
            this.$socket.sendObj('get_printer_status', { heater: [] }, 'getObjectInfo');
            this.$socket.sendObj('post_printer_subscriptions', {
                gcode: [],
                toolhead: [],
                virtual_sdcard: [],
                heater: [],
                heater_bed: [],
                extruder: ["temperature", "target"],
                fan: [],
                pause_resume: [],
                idle_timeout: [],

            });
            this.$socket.sendObj('get_printer_files', {}, 'getFileList');
        }
    },
    computed: {
        currentPage: function() {
          return this.$route.fullPath;
        },
        ...mapState({
            toolhead: state => state.printer.toolhead,
            hostname: state => state.printer.hostname,
            version: state => state.printer.version,
            loadingEmergencyStop: state => state.socket.loadingEmergencyStop,
            isConnected: state => state.socket.isConnected,
            isConnecting: state => !state.socket.isConnected,
        }),
    },
    methods: {
        emergencyStop: function() {
            this.$store.commit('setLoadingEmergencyStop', true);
            this.$socket.sendObj('post_printer_gcode', {script: 'M112'}, 'setLoadingEmergencyStop');
        },
    }
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