<template>
    <v-navigation-drawer
        :key="navigationStyle"
        v-model="naviDrawer"
        :src="sidebarBackground"
        :mini-variant="navigationStyle === 'iconsOnly'"
        :width="navigationWidth"
        :temporary="boolNaviTemp"
        clipped
        app
        :style="sidebarCssVars">
        <overlay-scrollbars class="nav-scrollbar">
            <v-list class="pr-0 pt-0 ml-0">
                <v-list-item-group active-class="active-nav-item">
                    <v-list-item
                        v-if="isMobile"
                        router
                        to="/"
                        :class="mobileLogoClass"
                        :style="'height: ' + topbarHeight + 'px'"
                        :ripple="false">
                        <template v-if="sidebarLogo">
                            <img :src="sidebarLogo" :style="logoCssVars" class="nav-logo" alt="Logo" />
                        </template>
                        <template v-else>
                            <mainsail-logo :color="logoColor" :style="logoCssVars" class="nav-logo" :ripple="false" />
                        </template>
                        <template v-if="navigationStyle !== 'iconsOnly'">
                            <span class="text-h6 font-weight-regular text-truncate">{{ printerName }}</span>
                        </template>
                    </v-list-item>
                    <sidebar-item v-for="(category, index) in naviPoints" :key="index" :item="category" />
                </v-list-item-group>
            </v-list>
        </overlay-scrollbars>
        <template #append>
            <v-list-item class="small-list-item mb-2">
                <v-list-item-icon class="menu-item-icon">
                    <about-dialog />
                </v-list-item-icon>
            </v-list-item>
        </template>
    </v-navigation-drawer>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import routes, { AppRoute } from '@/routes'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { PrinterStateKlipperConfig } from '@/store/printer/types'
import TheSelectPrinterDialog from '@/components/TheSelectPrinterDialog.vue'
import AboutDialog from '@/components/dialogs/AboutDialog.vue'
import { navigationWidth, topbarHeight } from '@/store/variables'
import MainsailLogo from '@/components/ui/MainsailLogo.vue'
import { mdiViewDashboardOutline, mdiLinkVariant } from '@mdi/js'
import SidebarItem, { NaviPoint } from '@/components/ui/SidebarItem.vue'

@Component({
    components: {
        SidebarItem,
        TheSelectPrinterDialog,
        AboutDialog,
        MainsailLogo,
    },
})
export default class TheSidebar extends Mixins(BaseMixin) {
    navigationWidth = navigationWidth
    topbarHeight = topbarHeight

    private customNaviLinks: NaviPoint[] = []

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

    get routesNaviPoints(): NaviPoint[] {
        const points: NaviPoint[] = []

        if (this.countPrinters) {
            points.push({
                title: this.$t('App.Printers'),
                icon: mdiViewDashboardOutline,
                to: '/allPrinters',
                position: 0,
            } as NaviPoint)
        }

        routes
            .filter((element) => {
                return element.showInNavi && this.showInNavi(element)
            })
            .forEach((element) => {
                points.push({
                    title: this.$t(`Router.${element.title}`),
                    icon: element.icon,
                    to: element.path,
                    position: element.position ?? 999,
                } as NaviPoint)
            })

        if (this.customNaviLinks.length) {
            points.push(...this.customNaviLinks)
        }

        return points
    }

    get naviPoints(): NaviPoint[] {
        return this.routesNaviPoints.sort((a, b) => a.position - b.position)
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
        return !this.isMobile && this.$vuetify.breakpoint.mdAndDown
    }

    get sidebarCssVars(): any {
        if (this.boolNaviTemp) {
            return {
                top: `${topbarHeight}px !important`,
                'padding-bottom': `${topbarHeight}px`,
            }
        }
        return {}
    }

    get sidebarLogo(): string {
        return this.$store.getters['files/getSidebarLogo']
    }

    get sidebarNaviFile(): string {
        const file = this.$store.getters['files/getCustomNaviPoints']

        window.console.log(file)

        return file
    }

    get logoColor(): string {
        return this.$store.state.gui.uiSettings.logo
    }

    get printerName(): string {
        if (this.$store.state.gui.general.printername.length) return this.$store.state.gui.general.printername

        return this.$store.state.printer.hostname
    }

    get logoCssVars() {
        if (this.navigationStyle !== 'iconsOnly') {
            return {
                'margin-right': '16px',
            }
        }
        return {}
    }

    get mobileLogoClass() {
        const output = ['sidebar-logo', 'no-text-decoration', 'no-background', 'no-border']

        if (this.navigationStyle === 'iconsOnly') {
            output.push('pa-0')
            output.push('justify-center')
        }

        return output
    }

    @Watch('sidebarNaviFile', { immediate: true })
    async sidebarNaviFileChanged(newVal: string) {
        this.customNaviLinks = []

        const content = await fetch(newVal)
            .then((res) => res.json())
            .catch((err) => {
                window.console.error('Unable to parse .theme/navi.json.')
                throw err
            })

        content.forEach((item: NaviPoint) => {
            this.customNaviLinks.push({
                title: item.title ?? 'Unknown',
                icon: item.icon ?? mdiLinkVariant,
                href: item.href ?? '#',
                target: item.target ?? undefined,
                position: item.position ?? 999,
            } as NaviPoint)
        })
    }

    showInNavi(route: AppRoute): boolean {
        if (['shutdown', 'error', 'disconnected'].includes(this.klippy_state) && !route.alwaysShow) return false
        else if (route.title === 'Webcam' && !this.boolNaviWebcam) return false
        else if (route.moonrakerComponent && !this.moonrakerComponents.includes(route.moonrakerComponent)) return false
        else if (route.registeredDirectory && !this.registeredDirectories.includes(route.registeredDirectory))
            return false
        else if (route.klipperComponent && !(route.klipperComponent in this.klipperConfigfileSettings)) return false
        else if (route.klipperIsConnected && !this.klippyIsConnected) return false

        return true
    }

    mounted() {
        this.naviDrawer = this.$vuetify.breakpoint.lgAndUp
    }
}
</script>

<style scoped>
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

.nav-logo {
    height: 32px;
}

.menu-item-icon {
    opacity: 0.85;
}

.menu-item-title {
    line-height: 30px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    opacity: 0.85;
}

.nav-scrollbar {
    height: 100%;
}
</style>
