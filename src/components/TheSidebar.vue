<style>
    .nav-logo {
        height: 32px;
    }

    .small-list-item {
        height: var(--sidebar-menu-item-height);
    }

    .no-text-decoration {
        text-decoration: none;
        background-color: transparent;
    }

    .no-background:before {
        background-color: rgba(255, 255, 255, 0) !important;
    }

    .no-border {
        border: 0 !important;
    }
</style>
<style scoped>
    .active-nav-item {
        border-right: 4px solid var(--v-primary-base);
    }

    .menu-item-icon {
        opacity: .85;
    }

    .menu-item-title {
        line-height: 30px;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        opacity: .85;
    }

    .nav-scrollbar {
        height: 100%;
    }
</style>
<template>
    <v-navigation-drawer v-model="naviDrawer" :src="sidebarBackground" :mini-variant="(navigationStyle === 'iconsOnly')" :key="navigationStyle" :width="navigationWidth" :temporary="boolNaviTemp" clipped app :style="sidebarCssVars"> 
        <overlay-scrollbars class="nav-scrollbar">
            <v-list class="pr-0 pt-0 ml-0">
                <v-list-item-group active-class="active-nav-item">
                    <v-list-item
                        router to="/"
                        :class="'sidebar-logo no-text-decoration no-background no-border ' + ((navigationStyle === 'iconsOnly') ? 'pa-0 justify-center' : '')"
                        :style="'height: ' + topbarHeight + 'px'"
                        :ripple="false"
                        v-if="isMobile"
                    >
                        <template v-if="sidebarLogo">
                            <img :src="sidebarLogo" :style="logoCssVars" class="nav-logo" alt="Logo" />
                        </template>
                        <template v-else>
                            <mainsail-logo :color="logoColor" :style="logoCssVars" class="nav-logo" :ripple="false"></mainsail-logo>
                        </template>
                        <template v-if="navigationStyle !== 'iconsOnly'">
                            <span class="text-h6 font-weight-regular text-truncate"> {{ printerName }} </span> 
                        </template>
                    </v-list-item>
                    <template v-if="countPrinters">
                        <v-tooltip right :open-delay="500" :disabled="navigationStyle !== 'iconsOnly'">
                            <template v-slot:activator="{ on, attrs }">
                                <v-list-item
                                    router to="/allPrinters"
                                    class="small-list-item mt-1"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-list-item-icon class="my-3 mr-3 menu-item-icon">
                                        <v-icon>mdi-view-dashboard-outline</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>
                                        <v-list-item-title tile class="menu-item-title">{{ $t("App.Printers") }}</v-list-item-title>
                                    </v-list-item-content>

                                </v-list-item>
                            </template>
                            <span>{{ $t("App.Printers") }}</span>
                        </v-tooltip>
                        <v-divider class="my-1"></v-divider>
                    </template>
                    <div v-for="(category, index) in naviPoints" :key="index">
                        <v-tooltip right :open-delay="500" :disabled="navigationStyle !== 'iconsOnly'">
                            <template v-slot:activator="{ on, attrs }">
                                <v-list-item
                                    router :to="category.path"
                                    class="small-list-item"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-list-item-icon class="my-3 mr-3 menu-item-icon">
                                        <v-icon>mdi-{{ category.icon }}</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>
                                        <v-list-item-title tile class="menu-item-title">{{ $t(`Router.${category.title}`) }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </template>
                            <span>{{ $t(`Router.${category.title}`) }}</span>
                        </v-tooltip>
                    </div>
                </v-list-item-group>
            </v-list>
        </overlay-scrollbars>
        <template v-slot:append>
            <v-list-item class="small-list-item mb-2">
                <v-list-item-icon class="menu-item-icon">
                    <about-modal></about-modal>
                </v-list-item-icon>
            </v-list-item>
        </template>
    </v-navigation-drawer>  
</template>

<script lang="ts">
import Component from 'vue-class-component'
import routes, {AppRoute} from '@/routes'
import {Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {PrinterStateKlipperConfig} from '@/store/printer/types'
import TheSelectPrinterDialog from '@/components/TheSelectPrinterDialog.vue'
import AboutModal from '@/components/modals/AboutModal.vue'
import {navigationWidth, topbarHeight} from '@/store/variables'
import MainsailLogo from '@/components/ui/MainsailLogo.vue'

@Component({
    components: {
        TheSelectPrinterDialog,
        AboutModal,
        MainsailLogo
    }
})

export default class TheSidebar extends Mixins(BaseMixin) {
    navigationWidth = navigationWidth
    topbarHeight = topbarHeight

    get naviDrawer(): boolean {
        return this.$store.state.naviDrawer
    }

    set naviDrawer(newVal: boolean) {
        this.$store.dispatch('setNaviDrawer', newVal)
    }

    get navigationStyle() {
        return this.$store.state.gui.uiSettings.navigationStyle
    }

    get sidebarBackground(): string {
        return this.$store.getters['files/getSidebarBackground']
    }

    get naviPoints(): AppRoute[] {
        return routes.filter((element) => {
            return element.showInNavi && this.showInNavi(element)
        })
    }

    get klippy_state(): string {
        return this.$store.state.server.klippy_state
    }

    get boolNaviWebcam(): boolean {
        return this.$store.state.gui.uiSettings.boolWebcamNavi
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

    get countPrinters() {
        return this.$store.getters['farm/countPrinters']
    }

    get boolNaviTemp(): boolean {
        if(!this.isMobile && this.$vuetify.breakpoint.mdAndDown) {
            return true
        }
        return false
    }

    get sidebarCssVars(): any {
        if(this.boolNaviTemp){
            return {
                'top': `${topbarHeight}px !important`,
                'padding-bottom': `${topbarHeight}px`
            }
        }
        return {}
    }

    get sidebarLogo(): string {
        return this.$store.getters['files/getSidebarLogo']
    }

    get logoColor(): string {
        return this.$store.state.gui.uiSettings.logo
    }

    get printerName():string {
        if (this.$store.state.gui.general.printername.length)
            return this.$store.state.gui.general.printername

        return this.$store.state.printer.hostname
    }

    get logoCssVars() {
        if(this.navigationStyle !== 'iconsOnly'){
            return {
                'margin-right': '16px'
            }
        }
        return {}
    }

    showInNavi(route: AppRoute): boolean {
        if (['shutdown', 'error', 'disconnected'].includes(this.klippy_state) && !route.alwaysShow) return false
        else if (route.title === 'Webcam' && !this.boolNaviWebcam) return false
        else if (route.moonrakerComponent && !this.moonrakerComponents.includes(route.moonrakerComponent)) return false
        else if (route.registeredDirectory  && !this.registeredDirectories.includes(route.registeredDirectory)) return false
        else if (route.klipperComponent && !(route.klipperComponent in this.klipperConfigfileSettings)) return false
        else if (route.klipperIsConnected && !this.klippyIsConnected) return false

        return true
    }

    mounted() {
        this.naviDrawer = this.$vuetify.breakpoint.lgAndUp
    }
}
</script>