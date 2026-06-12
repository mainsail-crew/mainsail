<template>
    <v-app :style="cssVars">
        <template v-if="socketIsConnected && guiIsReady">
            <the-sidebar />
            <the-topbar />
            <v-main id="content" :style="mainStyle">
                <v-container id="page-container" fluid :class="containerClasses">
                    <router-view />
                </v-container>
            </v-main>
            <the-service-worker />
            <the-update-dialog />
            <the-editor />
            <the-timelapse-rendering-snackbar />
            <the-fullscreen-upload />
            <the-upload-snackbar />
            <the-manual-probe-dialog />
            <the-bed-screws-dialog />
            <the-screws-tilt-adjust-dialog />
            <the-macro-prompt />
        </template>
        <the-select-printer-dialog v-else-if="instancesDB !== 'moonraker'" />
        <the-connecting-dialog v-else />
    </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useTheme as useVuetifyTheme } from 'vuetify'
import { useBase } from '@/composables/useBase'
import { useTheme } from '@/composables/useTheme'
import { useSocket } from '@/composables/useSocket'
import TheSidebar from '@/components/TheSidebar.vue'
import TheTopbar from '@/components/TheTopbar.vue'
import TheUpdateDialog from '@/components/TheUpdateDialog.vue'
import TheConnectingDialog from '@/components/TheConnectingDialog.vue'
import TheSelectPrinterDialog from '@/components/TheSelectPrinterDialog.vue'
import TheEditor from '@/components/TheEditor.vue'
import { panelToolbarHeight, topbarHeight, navigationItemHeight } from '@/store/variables'
import TheTimelapseRenderingSnackbar from '@/components/TheTimelapseRenderingSnackbar.vue'
import TheFullscreenUpload from '@/components/TheFullscreenUpload.vue'
import TheUploadSnackbar from '@/components/TheUploadSnackbar.vue'
import TheManualProbeDialog from '@/components/dialogs/TheManualProbeDialog.vue'
import TheBedScrewsDialog from '@/components/dialogs/TheBedScrewsDialog.vue'
import TheScrewsTiltAdjustDialog from '@/components/dialogs/TheScrewsTiltAdjustDialog.vue'
import { setAndLoadLocale } from './plugins/i18n'
import TheMacroPrompt from '@/components/dialogs/TheMacroPrompt.vue'
import type { AppRoute } from '@/routes'

const store = useStore()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const display = useDisplay()
const vuetifyTheme = useVuetifyTheme()
const { socketIsConnected, guiIsReady, isPrinterPowerOff, printerIsPrinting, instancesDB } = useBase()
const { mainBgImage, themeObj, sidebarLogo, themeCss } = useTheme()
const logoColor = computed(() => store.state.gui.uiSettings.logo)
const socket = useSocket()

const title = computed((): string => {
    let titleValue = store.getters['getTitle']
    if (isPrinterPowerOff.value) titleValue = t('App.Titles.PrinterOff')
    return titleValue
})

const naviDrawer = computed((): boolean => store.state.naviDrawer)

const navigationStyle = computed(() => store.state.gui.uiSettings.navigationStyle)

const mainStyle = computed(() => {
    const style: Record<string, string> = { paddingLeft: '0' }
    if (mainBgImage.value !== null) {
        style.backgroundImage = 'url(' + mainBgImage.value + ')'
    }
    if (naviDrawer.value && !display.mdAndDown.value) {
        if (navigationStyle.value === 'iconsAndText') style.paddingLeft = '220px'
        if (navigationStyle.value === 'iconsOnly') style.paddingLeft = '56px'
    }
    return style
})

const customStylesheet = computed(() => store.getters['files/getCustomStylesheet'])
const customFavicons = computed((): string | null => store.getters['files/getCustomFavicons'] ?? null)
const language = computed(() => store.state.gui.general.language)
const current_file = computed(() => store.state.printer.print_stats?.filename ?? '')
const mode = computed(() => store.state.gui.uiSettings.mode)
const primaryColor = computed(() => store.state.gui.uiSettings.primary)
const warningColor = computed((): string =>
    vuetifyTheme.global.current.value.colors?.warning?.toString() ?? '#ff8300'
)

const primaryTextColor = computed((): string => {
    const splits = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(primaryColor.value)
    if (splits) {
        const r = parseInt(splits[1], 16) * 0.2126
        const g = parseInt(splits[2], 16) * 0.7152
        const b = parseInt(splits[3], 16) * 0.0722
        const perceivedLightness = (r + g + b) / 255
        return perceivedLightness > 0.7 ? '#222' : '#fff'
    }
    return '#ffffff'
})

const cssVars = computed((): { [key: string]: string } => ({
    '--v-btn-text-primary': primaryTextColor.value,
    '--color-logo': logoColor.value,
    '--color-primary': primaryColor.value,
    '--color-warning': warningColor.value,
    '--panel-toolbar-icon-btn-width': panelToolbarHeight + 'px',
    '--panel-toolbar-text-btn-height': panelToolbarHeight + 'px',
    '--topbar-icon-btn-width': topbarHeight + 'px',
    '--sidebar-menu-item-height': navigationItemHeight + 'px',
}))

const print_percent = computed((): number =>
    Math.floor(store.getters['printer/getPrintPercent'] * 100)
)

const containerClasses = computed(() => {
    const currentRouteOptions = router.options.routes?.find(
        (r) => r.name === route.name
    ) as AppRoute
    return {
        'px-3': true,
        'px-sm-6': true,
        'py-sm-6': true,
        'mx-auto': true,
        fullscreen: currentRouteOptions?.fullscreen ?? false,
    }
})

const progressAsFavicon = computed(() => store.state.gui.uiSettings.progressAsFavicon)

watch(title, (newVal: string): void => {
    document.title = newVal
}, { immediate: true })

watch(language, async (newVal: string): Promise<void> => {
    await setAndLoadLocale(newVal)
})

watch(customStylesheet, (newVal: string | null): void => {
    const style = document.getElementById('customStylesheet')
    if (newVal !== null && style === null) {
        const newStyle = document.createElement('link')
        newStyle.id = 'customStylesheet'
        newStyle.type = 'text/css'
        newStyle.rel = 'stylesheet'
        newStyle.href = newVal
        document.head.appendChild(newStyle)
    } else if (newVal !== null && style) {
        style.setAttribute('href', newVal)
    } else if (style) style.remove()
})

watch(current_file, (newVal: string): void => {
    if (newVal === '') return
    socket.emit('server.files.metadata', { filename: newVal }, { action: 'files/getMetadataCurrentFile' })
})

watch(primaryColor, (newVal: string): void => {
    nextTick(() => {
        const themeName = vuetifyTheme.global.name.value
        vuetifyTheme.themes.value[themeName].colors.primary = newVal
    })
})

watch(mode, (newVal: string): void => {
    const dark = newVal !== 'light'
    vuetifyTheme.global.name.value = dark ? 'dark' : 'light'
    const doc = document.documentElement
    doc.className = dark ? 'theme--dark' : 'theme--light'
})

async function drawFavicon(val: number): Promise<void> {
    const favicon16: HTMLLinkElement | null = document.querySelector("link[rel*='icon'][sizes='16x16']")
    const favicon32: HTMLLinkElement | null = document.querySelector("link[rel*='icon'][sizes='32x32']")

    if (!favicon16 || !favicon32) return

    if (progressAsFavicon.value && printerIsPrinting.value) {
        const faviconSize = 64
        const canvas = document.createElement('canvas')
        canvas.width = faviconSize
        canvas.height = faviconSize
        const context = canvas.getContext('2d')
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const radius = 32

        if (!context) return

        context.beginPath()
        context.moveTo(centerX, centerY)
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
        context.closePath()
        context.fillStyle = '#ddd'
        context.fill()
        context.strokeStyle = 'rgba(200, 208, 218, 0.66)'
        context.stroke()

        const startAngle = 1.5 * Math.PI
        let endAngle = 0
        const unitValue = (Math.PI - 0.5 * Math.PI) / 25
        if (val >= 0 && val <= 25) endAngle = startAngle + val * unitValue
        else if (val > 25 && val <= 50) endAngle = startAngle + val * unitValue
        else if (val > 50 && val <= 75) endAngle = startAngle + val * unitValue
        else if (val > 75 && val <= 100) endAngle = startAngle + val * unitValue

        context.beginPath()
        context.moveTo(centerX, centerY)
        context.arc(centerX, centerY, radius, startAngle, endAngle, false)
        context.closePath()
        context.fillStyle = logoColor.value
        context.fill()

        favicon16.href = canvas.toDataURL('image/png')
        favicon32.href = canvas.toDataURL('image/png')
        return
    }

    if (customFavicons.value) {
        const [favicon16Path, favicon32Path] = customFavicons.value
        favicon16.href = favicon16Path
        favicon32.href = favicon32Path
        return
    }

    if ((themeObj.value?.logo?.show ?? false) && sidebarLogo.value.endsWith('.svg')) {
        const response = await fetch(sidebarLogo.value)
        if (!response.ok) return

        const text = await response.text()
        const modifiedSvg = text.replace(/fill="var\(--color-logo, #[0-9a-fA-F]{6}\)"/g, `fill="${logoColor.value}"`)

        const blob = new Blob([modifiedSvg], { type: 'image/svg+xml' })
        const reader = new FileReader()

        reader.onloadend = () => {
            const base64data = reader.result as string
            favicon16.href = base64data
            favicon32.href = base64data
        }

        reader.readAsDataURL(blob)
        return
    }

    const favicon =
        'data:image/svg+xml;base64,' +
        window.btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 599.38 523.11" xml:space="preserve">
            <g>
                <path style="fill:${logoColor.value};" d="M382.29,142.98L132.98,522.82L0,522.68L344.3,0l0,0C352.18,49.06,365.2,97.68,382.29,142.98"/>
                <path style="fill:${logoColor.value};" d="M413.28,213.54L208.5,522.92l132.94,0.19l135.03-206.33l0,0C452.69,284.29,431.53,249.77,413.28,213.54 L413.28,213.54"/>
                <path style="fill:${logoColor.value};" d="M599.38,447.69l-49.25,75.42L417,522.82l101.6-153.67l0,0C543.48,397.35,570.49,423.61,599.38,447.69 L599.38,447.69z"/>
            </g>
        </svg>
    `)

    favicon16.href = favicon
    favicon32.href = favicon
}

watch(customFavicons, (): void => {
    drawFavicon(print_percent.value)
})

watch(progressAsFavicon, (): void => {
    drawFavicon(print_percent.value)
})

watch(logoColor, (): void => {
    drawFavicon(print_percent.value)
})

watch(themeCss, (newVal: string | null): void => {
    const style = document.getElementById('theme-css')
    if (style) style.remove()

    if (newVal === null) return

    fetch(newVal)
        .then((response) => response.text())
        .then((css) => {
            const newStyle = document.createElement('style')
            newStyle.id = 'theme-css'
            newStyle.innerHTML = css
            document.head.appendChild(newStyle)
        })
})

watch(print_percent, (newVal: number): void => {
    drawFavicon(newVal)
})

watch(printerIsPrinting, (): void => {
    drawFavicon(print_percent.value)
})

function appHeight() {
    nextTick(() => {
        const doc = document.documentElement
        doc.style.setProperty('--app-height', window.innerHeight + 'px')
    })
}

onMounted((): void => {
    drawFavicon(print_percent.value)
    appHeight()
    window.addEventListener('resize', appHeight)
    window.addEventListener('orientationchange', appHeight)
})
</script>

<style>
@import './assets/styles/fonts.css';
@import './assets/styles/toastr.css';
@import './assets/styles/page.css';
@import './assets/styles/sidebar.css';
@import './assets/styles/utils.css';
@import './assets/styles/updateManager.css';

:root {
    --app-height: 100%;
}

#content {
    background-attachment: fixed;
    background-size: cover;
    background-repeat: no-repeat;
}

/*noinspection CssUnusedSymbol*/
.v-btn:not(.v-btn--outlined).primary {
    /*noinspection CssUnresolvedCustomProperty*/
    color: var(--v-btn-text-primary);
}
</style>
