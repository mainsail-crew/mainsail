import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import routes from '@/routes'
import type { AppRoute } from '@/routes'
import { mdiLinkVariant, mdiViewDashboardOutline } from '@mdi/js'
import { PrinterStateKlipperConfig } from '@/store/printer/types'
import { GuiNavigationStateEntry } from '@/store/gui/navigation/types'

export interface NaviPoint {
    type: 'link' | 'route'
    title: string
    orgTitle?: string
    to?: string
    href?: string
    target?: string
    icon: string
    position: number
    visible: boolean
}

export function useNavigation() {
    const store = useStore()
    const { t } = useI18n()
    const base = useBase()

    const customNaviLinks = ref<NaviPoint[]>([])

    const countPrinters = computed(() => store.getters['farm/countPrinters'])

    const routesNaviPoints = computed<NaviPoint[]>(() => {
        const points: NaviPoint[] = []

        if (countPrinters.value) {
            points.push({
                title: t('App.Printers'),
                icon: mdiViewDashboardOutline,
                to: '/allPrinters',
                position: 0,
                visible: true,
            } as NaviPoint)
        }

        routes
            .filter((element) => {
                return element.showInNavi && showInNavi(element)
            })
            .forEach((element) => {
                const [position, visible] = getUiSettings({
                    type: 'route',
                    title: element.title ?? 'unknown',
                    visible: true,
                    position: element.position ?? 999,
                })

                points.push({
                    type: 'route',
                    title: t(`Router.${element.title}`),
                    orgTitle: element.title,
                    icon: element.icon,
                    to: element.path,
                    position,
                    visible,
                } as NaviPoint)
            })

        if (customNaviLinks.value.length) {
            customNaviLinks.value.forEach((element) => {
                const [position, visible] = getUiSettings({
                    type: 'link',
                    title: element.title ?? 'unknown',
                    visible: element.visible ?? true,
                    position: element.position ?? 999,
                })

                points.push({
                    type: 'link',
                    title: element.title,
                    icon: element.icon,
                    href: element.href,
                    target: element.target,
                    position,
                    visible,
                })
            })
        }

        return points
    })

    const naviPoints = computed<NaviPoint[]>(() =>
        routesNaviPoints.value.sort((a, b) => a.position - b.position)
    )

    const visibleNaviPoints = computed<NaviPoint[]>(() =>
        naviPoints.value.filter((entry) => entry.visible)
    )

    const uiSettings = computed<GuiNavigationStateEntry[]>(
        () => store.state.gui.navigation.entries
    )

    const klippy_state = computed(() => store.state.server.klippy_state)

    const boolNaviWebcam = computed(() => store.state.gui.uiSettings.boolWebcamNavi)

    const moonrakerComponents = computed<string[]>(() => store.state.server.components)

    const registeredDirectories = computed<string[]>(() => store.state.server.registered_directories)

    const klipperConfigfileSettings = computed<PrinterStateKlipperConfig[]>(
        () => store.state.printer.configfile?.settings ?? {}
    )

    const sidebarNaviFile = computed(() => store.getters['files/getCustomNaviPoints'])

    const webcamCount = computed(() => store.getters['gui/webcams/getWebcams'].length)

    watch(
        sidebarNaviFile,
        async (newVal: string) => {
            customNaviLinks.value = []

            if (!newVal) return

            const content = await fetch(newVal)
                .then((res) => res.json())
                .catch((err) => {
                    window.console.error('Unable to parse .theme/navi.json.')
                    throw err
                })

            content.forEach((item: NaviPoint) => {
                customNaviLinks.value.push({
                    title: item.title ?? 'Unknown',
                    icon: item.icon ?? mdiLinkVariant,
                    href: item.href ?? '#',
                    target: item.target ?? undefined,
                    position: item.position ?? 999,
                } as NaviPoint)
            })
        },
        { immediate: true }
    )

    function showInNavi(route: AppRoute): boolean {
        if (['shutdown', 'error', 'disconnected'].includes(klippy_state.value) && !route.alwaysShow)
            return false
        else if (route.title === 'Webcam' && webcamCount.value === 0) return false
        else if (route.moonrakerComponent && !moonrakerComponents.value.includes(route.moonrakerComponent))
            return false
        else if (
            route.registeredDirectory &&
            !registeredDirectories.value.includes(route.registeredDirectory)
        )
            return false
        else if (
            route.klipperComponent &&
            !(route.klipperComponent in klipperConfigfileSettings.value)
        )
            return false
        else if (route.klipperIsConnected && !base.klippyIsConnected.value) return false

        return true
    }

    function getUiSettings(entry: GuiNavigationStateEntry): [number, boolean] {
        const index = uiSettings.value.findIndex((point) => {
            return point.title === entry.title && point.type === entry.type
        })

        if (index === -1) return [entry.position, entry.visible]

        return [uiSettings.value[index].position, uiSettings.value[index].visible]
    }

    return {
        ...base,
        countPrinters,
        routesNaviPoints,
        naviPoints,
        visibleNaviPoints,
        uiSettings,
        klippy_state,
        boolNaviWebcam,
        moonrakerComponents,
        registeredDirectories,
        klipperConfigfileSettings,
        sidebarNaviFile,
        webcamCount,
        showInNavi,
        getUiSettings,
    }
}
