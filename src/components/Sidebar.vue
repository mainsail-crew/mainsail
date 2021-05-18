<style>
    #sidebarVersions {
        position: absolute;
        left: 0;
        bottom: 0;
    }

    @media screen and (max-width: 1024px) {
        #sidebarVersions {
            display: none;
        }
    }
</style>

<template>
    <v-navigation-drawer class="sidebar-wrapper" persistent v-model="naviDrawer" enable-resize-watcher fixed app :src="sidebarBackground" >
        <div id="nav-header">
            <img :src="sidebarLogo" alt="Logo" />
            <v-toolbar-title>{{ printerName }}</v-toolbar-title>
        </div>
        <ul class="navi" :expand="$vuetify.breakpoint.mdAndUp">
            <printer-selecter></printer-selecter>
            <li v-for="(category, index) in naviPoints" :key="index" :prepend-icon="category.icon"
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
                    <span class="nav-title">{{ $t(`Router.${category.title}`) }}</span>
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
            v{{ mainsailVersion }}
            <span class="" v-if="klipperVersion"><br />{{ klipperVersion }}</span>
        </p>
    </v-navigation-drawer>
</template>

<script>
import { mapState } from 'vuex'
import routes from '@/routes'
import PrinterSelecter from "@/components/PrinterSelecter"

export default {
    components: {
        PrinterSelecter,
    },
    data: () => ({

    }),
    computed: {
        ...mapState({
            klippy_state: state => state.server.klippy_state,
            klipperConfigfileSettings: state => state.printer.configfile.settings,
            boolNaviWebcam: state => state.gui.webcam.bool,

            mainsailVersion: state => state.packageVersion,
            klipperVersion: state => state.printer?.software_version
        }),
        naviDrawer: {
            get() {
                return this.$store.state.naviDrawer
            },
            set(newVal) {
                return this.$store.dispatch("setNaviDrawer", newVal)
            }
        },
        currentPage() {
            return this.$route.fullPath
        },
        naviPoints() {
            return routes.filter((element) => element.showInNavi)
        },
        printerName() {
            return this.$store.state.gui.general.printername || this.$store.state.printer.hostname
        },
        sidebarLogo() {
            return this.$store.getters["files/getSidebarLogo"]
        },
        sidebarBackground() {
            return this.$store.getters["files/getSidebarBackground"]
        },
        isUpdateAvailable() {
            return this.$store.getters["server/updateManager/isUpdateAvailable"]
        },
        moonrakerComponents() {
            return this.$store.state.server.components
        },
        registeredDirectories() {
            return this.$store.state.server.registered_directories
        }
    },
    methods: {
        getBoolShowInNavi(route) {
            if (['shutdown', 'error', 'disconnected'].includes(this.klippy_state) && !route.alwaysShow) return false

            if (route.component?.name === 'webcam') return this.boolNaviWebcam

            if ('moonrakerComponent' in route) return this.moonrakerComponents.includes(route.moonrakerComponent)
            if ('registeredDirectory' in route) return this.registeredDirectories.includes(route.registeredDirectory)
            if ('klipperComponent' in route) return (route.klipperComponent in this.klipperConfigfileSettings)

            return true
        },
    },
}
</script>