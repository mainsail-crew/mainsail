import Component from 'vue-class-component'
import routes, { AppRoute } from '@/routes'
import { Mixins, Watch } from 'vue-property-decorator'
import { mdiLinkVariant, mdiViewDashboardOutline } from '@mdi/js'
import BaseMixin from '@/components/mixins/base'
import { PrinterStateKlipperConfig } from '@/store/printer/types'

export interface NaviPoint {
    type: 'link' | 'route'
    title: string
    to?: string
    href?: string
    target?: string
    icon: string
    position: number
    visible: boolean
}

@Component
export default class NavigationMixin extends Mixins(BaseMixin) {
    private customNaviLinks: NaviPoint[] = []

    get countPrinters() {
        return this.$store.getters['farm/countPrinters']
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
                    type: 'route',
                    title: this.$t(`Router.${element.title}`),
                    icon: element.icon,
                    to: element.path,
                    position: element.position ?? 999,
                    visible: true,
                } as NaviPoint)
            })

        if (this.customNaviLinks.length) {
            this.customNaviLinks.forEach((element) => {
                points.push({
                    type: 'link',
                    title: element.title,
                    icon: element.icon,
                    href: element.href,
                    target: element.target,
                    position: element.position,
                    visible: true,
                })
            })
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

    get sidebarNaviFile(): string {
        return this.$store.getters['files/getCustomNaviPoints']
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
}
