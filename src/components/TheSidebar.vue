<style scoped>
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
    <v-navigation-drawer class="sidebar-wrapper" persistent v-model="naviDrawer" mobile-breakpoint="1280" enable-resize-watcher fixed app :src="sidebarBackground">
        <div id="nav-header">
            <template v-if="sidebarLogo">
                <img :src="sidebarLogo" style="height: 40px;" class="mr-3" alt="Logo" />
            </template>
            <template v-else>
                <mainsail-logo :color="logoColor" style="height: 40px;" class="mr-3"></mainsail-logo>
            </template>
            <v-toolbar-title>{{ printerName }}</v-toolbar-title>
        </div>
        <ul class="navi" :expand="$vuetify.breakpoint.mdAndUp">
            <the-sidebar-printer-menu></the-sidebar-printer-menu>
            <li v-for="(category, index) in naviPoints" :key="index" :prepend-icon="category.icon"
                :class="[category.path !== '/' && currentPage.includes(category.path) ? 'active' : '', 'nav-item']"
                :value="true"
            >
                <router-link
                    style="position: relative;"
                    slot="activator" class="nav-link" exact :to="category.path" @click.prevent
                    v-if="showInNavi(category)">
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

<script lang="ts">
import Component from "vue-class-component"
import routes, {AppRoute} from '@/routes'
import {Mixins, Watch} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";
import {PrinterStateKlipperConfig} from "@/store/printer/types";
import TheSelectPrinterDialog from "@/components/TheSelectPrinterDialog.vue";
import TheSidebarPrinterMenu from "@/components/TheSidebarPrinterMenu.vue";
import MainsailLogo from "@/components/ui/MainsailLogo.vue";

@Component({
    components: {
        MainsailLogo,
        TheSidebarPrinterMenu,
        TheSelectPrinterDialog

    }
})
export default class TheSidebar extends Mixins(BaseMixin) {

    get naviDrawer(): boolean {
        return this.$store.state.naviDrawer
    }

    set naviDrawer(newVal: boolean) {
        this.$store.dispatch("setNaviDrawer", newVal)
    }

    get logoColor(): string {
        return this.$store.state.gui.theme.logo
    }

    get sidebarLogo(): string {
        return this.$store.getters["files/getSidebarLogo"]
    }

    get sidebarBackground(): string {
        return this.$store.getters["files/getSidebarBackground"]
    }

    get mainsailVersion(): string {
        return this.$store.state.packageVersion
    }

    get klipperVersion():string {
        return this.$store.state.printer?.software_version ?? ""
    }

    get naviPoints(): AppRoute[] {
        return routes.filter((element) => element.showInNavi)
    }

    get printerName():string {
        if (this.$store.state.gui.general.printername.length)
            return this.$store.state.gui.general.printername

        return this.$store.state.printer.hostname
    }

    get klippy_state(): string {
        return this.$store.state.server.klippy_state
    }

    get boolNaviWebcam(): boolean {
        return this.$store.state.gui.webcam.boolNavi
    }

    get moonrakerComponents(): string[] {
        return this.$store.state.server.components
    }

    get registeredDirectories(): string[] {
        return this.$store.state.server.registered_directories
    }

    get klipperConfigfileSettings(): PrinterStateKlipperConfig[] {
        return this.$store.state.printer.configfile?.settings ?? {}
    }

    get currentPage(): string {
        return this.$route.fullPath
    }

    get isUpdateAvailable(): boolean {
        return this.$store.getters["server/updateManager/isUpdateAvailable"]
    }

    showInNavi(route: AppRoute): boolean {
        if (['shutdown', 'error', 'disconnected'].includes(this.klippy_state) && !route.alwaysShow) return false

        if (route.title === 'Webcam') return this.boolNaviWebcam

        if (route.moonrakerComponent) return this.moonrakerComponents.includes(route.moonrakerComponent)
        if (route.registeredDirectory) return this.registeredDirectories.includes(route.registeredDirectory)
        if (route.klipperComponent) return (route.klipperComponent in this.klipperConfigfileSettings)

        return true
    }

    mounted() {
        window.console.log("lg", this.$vuetify.breakpoint.lgAndUp)

        this.naviDrawer = this.$vuetify.breakpoint.lgAndUp
    }

    @Watch('naviDrawer')
    naviDrawerChanged(newVal: any) {
        window.console.log("naviDrawerChanged", newVal)
    }
}
</script>