import { computed } from 'vue'
import { useStore } from 'vuex'
import { useTheme as useVuetifyTheme } from 'vuetify'

export function useTheme() {
    const store = useStore()
    const vuetifyTheme = useVuetifyTheme()

    const isDark = computed(() => vuetifyTheme.global.current.value.dark)

    function fgColor(alpha: number = 1, dark: boolean = isDark.value): string {
        const base = dark ? 255 : 0
        return `rgba(${base}, ${base}, ${base}, ${alpha})`
    }

    function bgColor(alpha: number = 1) {
        return fgColor(alpha, !isDark.value)
    }

    const themeName = computed(() => store.getters['gui/theme'])

    const themeObj = computed(() => store.getters['gui/getTheme'])

    const themeMode = computed(() => store.state.gui.uiSettings.mode ?? 'dark')

    const fgColorHi = computed(() => fgColor(0.8))

    const fgColorMid = computed(() => fgColor(0.5))

    const fgColorLow = computed(() => fgColor(0.2))

    const fgColorFaint = computed(() => fgColor(0.1))

    const machineButtonCol = computed(() =>
        isDark.value ? 'grey darken-3' : 'grey lighten-1'
    )

    const draggableBgStyle = computed(() => {
        const col = isDark.value ? '#282828' : '#e7e7e7'
        return `background-color: ${col}`
    })

    const progressBarColor = computed(() => (isDark.value ? 'white' : 'primary'))

    const sidebarBgImage = computed(() => {
        if (themeObj.value.sidebarBackground?.show) {
            if (themeObj.value.sidebarBackground?.light && themeMode.value === 'light')
                return `/img/themes/sidebarBackground-${themeName.value}-light.png`
            return `/img/themes/sidebarBackground-${themeName.value}.png`
        }
        return isDark.value ? '/img/sidebar-background.svg' : '/img/sidebar-background-light.svg'
    })

    const sidebarLogo = computed((): string => {
        const url = store.getters['files/getSidebarLogo']
        if (url !== '' || themeName.value === 'mainsail') return url
        if (!(themeObj.value.logo?.show ?? false)) return ''
        if (themeObj.value.logo?.light && themeMode.value === 'light')
            return `/img/themes/sidebarLogo-${themeName.value}-light.svg`
        return `/img/themes/sidebarLogo-${themeName.value}.svg`
    })

    const mainBgImage = computed(() => {
        const url = store.getters['files/getMainBackground']
        if (url || themeName.value === 'mainsail') return url
        if (!themeObj.value.mainBackground?.show) return null
        if (themeObj.value.mainBackground?.light && themeMode.value === 'light')
            return `/img/themes/mainBackground-${themeName.value}-light.png`
        return `/img/themes/mainBackground-${themeName.value}.png`
    })

    const themeCss = computed(() => {
        if (!(themeObj.value.css ?? false)) return null
        return `/css/themes/${themeName.value}.css`
    })

    return {
        fgColor,
        bgColor,
        themeName,
        themeObj,
        themeMode,
        fgColorHi,
        fgColorMid,
        fgColorLow,
        fgColorFaint,
        machineButtonCol,
        draggableBgStyle,
        progressBarColor,
        sidebarBgImage,
        sidebarLogo,
        mainBgImage,
        themeCss,
    }
}
