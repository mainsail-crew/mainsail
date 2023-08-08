<template>
    <v-app dark :style="cssVars">
        <template v-if="socketIsConnected && guiIsReady">
            <the-sidebar />
            <the-topbar />
            <v-main id="content" :style="mainStyle">
                <v-container id="page-container" fluid class="container px-3 px-sm-6 py-sm-6 mx-auto">
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
        </template>
        <the-select-printer-dialog v-else-if="instancesDB !== 'moonraker'" />
        <the-connecting-dialog v-else />
    </v-app>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import TheSidebar from '@/components/TheSidebar.vue'
import BaseMixin from '@/components/mixins/base'
import TheTopbar from '@/components/TheTopbar.vue'
import { Mixins, Watch } from 'vue-property-decorator'
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

Component.registerHooks(['metaInfo'])

@Component({
    components: {
        TheTimelapseRenderingSnackbar,
        TheEditor,
        TheSelectPrinterDialog,
        TheConnectingDialog,
        TheUpdateDialog,
        TheTopbar,
        TheSidebar,
        TheFullscreenUpload,
        TheUploadSnackbar,
        TheManualProbeDialog,
        TheBedScrewsDialog,
        TheScrewsTiltAdjustDialog,
    },
})
export default class App extends Mixins(BaseMixin) {
    public metaInfo(): any {
        let title = this.$store.getters['getTitle']

        if (this.isPrinterPowerOff) title = this.$t('App.Titles.PrinterOff')

        return {
            title,
            titleTemplate: '%s',
        }
    }

    get title(): string {
        return this.$store.getters['getTitle']
    }

    get mainBackground(): string {
        return this.$store.getters['files/getMainBackground']
    }

    get naviDrawer(): boolean {
        return this.$store.state.naviDrawer
    }

    get navigationStyle() {
        return this.$store.state.gui.uiSettings.navigationStyle
    }

    get mainStyle() {
        let style: any = {
            paddingLeft: '0',
        }

        if (this.mainBackground !== null) {
            style.backgroundImage = 'url(' + this.mainBackground + ')'
        }

        // overwrite padding left for the sidebar
        if (this.naviDrawer && this.navigationStyle === 'iconsAndText') style.paddingLeft = '220px'
        if (this.naviDrawer && this.navigationStyle === 'iconsOnly') style.paddingLeft = '56px'

        return style
    }

    get customStylesheet() {
        return this.$store.getters['files/getCustomStylesheet']
    }

    get customFavicons(): string | null {
        return this.$store.getters['files/getCustomFavicons'] ?? null
    }

    get language(): string {
        return this.$store.state.gui.general.language
    }

    get current_file(): string {
        return this.$store.state.printer.print_stats?.filename ?? ''
    }

    get logoColor(): string {
        return this.$store.state.gui.uiSettings.logo
    }

    get primaryColor(): string {
        return this.$store.state.gui.uiSettings.primary
    }

    get warningColor(): string {
        return this.$vuetify?.theme?.currentTheme?.warning?.toString() ?? '#ff8300'
    }

    get primaryTextColor(): string {
        let splits = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.primaryColor)
        if (splits) {
            const r = parseInt(splits[1], 16) * 0.2126
            const g = parseInt(splits[2], 16) * 0.7152
            const b = parseInt(splits[3], 16) * 0.0722
            const perceivedLightness = (r + g + b) / 255

            return perceivedLightness > 0.7 ? '#222' : '#fff'
        }

        return '#ffffff'
    }

    get cssVars(): { [key: string]: string } {
        return {
            '--v-btn-text-primary': this.primaryTextColor,
            '--color-primary': this.primaryColor,
            '--color-warning': this.warningColor,
            '--panel-toolbar-icon-btn-width': panelToolbarHeight + 'px',
            '--panel-toolbar-text-btn-height': panelToolbarHeight + 'px',
            '--topbar-icon-btn-width': topbarHeight + 'px',
            '--sidebar-menu-item-height': navigationItemHeight + 'px',
        }
    }

    get print_percent(): number {
        return Math.floor(this.$store.getters['printer/getPrintPercent'] * 100)
    }

    @Watch('language')
    languageChanged(newVal: string): void {
        this.$i18n.locale = newVal
    }

    @Watch('customStylesheet')
    customStylesheetChanged(newVal: string | null): void {
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
    }

    @Watch('current_file')
    current_fileChanged(newVal: string): void {
        if (newVal === '') return

        this.$socket.emit('server.files.metadata', { filename: newVal }, { action: 'files/getMetadataCurrentFile' })
    }

    @Watch('primaryColor')
    primaryColorChanged(newVal: string): void {
        this.$nextTick(() => {
            this.$vuetify.theme.currentTheme.primary = newVal
        })
    }

    drawFavicon(val: number): void {
        const favicon16: HTMLLinkElement | null = document.querySelector("link[rel*='icon'][sizes='16x16']")
        const favicon32: HTMLLinkElement | null = document.querySelector("link[rel*='icon'][sizes='32x32']")

        if (favicon16 && favicon32) {
            if (this.printerIsPrinting) {
                let faviconSize = 64

                let canvas = document.createElement('canvas')
                canvas.width = faviconSize
                canvas.height = faviconSize
                const context = canvas.getContext('2d')
                const centerX = canvas.width / 2
                const centerY = canvas.height / 2
                const radius = 32

                // draw the grey circle
                if (context) {
                    context.beginPath()
                    context.moveTo(centerX, centerY)
                    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
                    context.closePath()
                    context.fillStyle = '#ddd'
                    context.fill()
                    context.strokeStyle = 'rgba(200, 208, 218, 0.66)'
                    context.stroke()

                    // draw the green circle based on percentage
                    let startAngle = 1.5 * Math.PI
                    let endAngle = 0
                    let unitValue = (Math.PI - 0.5 * Math.PI) / 25
                    if (val >= 0 && val <= 25) endAngle = startAngle + val * unitValue
                    else if (val > 25 && val <= 50) endAngle = startAngle + val * unitValue
                    else if (val > 50 && val <= 75) endAngle = startAngle + val * unitValue
                    else if (val > 75 && val <= 100) endAngle = startAngle + val * unitValue

                    context.beginPath()
                    context.moveTo(centerX, centerY)
                    context.arc(centerX, centerY, radius, startAngle, endAngle, false)
                    context.closePath()
                    context.fillStyle = this.logoColor
                    context.fill()

                    favicon16.href = canvas.toDataURL('image/png')
                    favicon32.href = canvas.toDataURL('image/png')
                }
            } else if (this.customFavicons) {
                const [favicon16Path, favicon32Path] = this.customFavicons
                favicon16.href = favicon16Path
                favicon32.href = favicon32Path
            } else {
                const favicon =
                    'data:image/svg+xml;base64,' +
                    window.btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 599.38 523.11" xml:space="preserve">
                            <g>
                                <path style="fill:${this.logoColor};" d="M382.29,142.98L132.98,522.82L0,522.68L344.3,0l0,0C352.18,49.06,365.2,97.68,382.29,142.98"/>
                                <path style="fill:${this.logoColor};" d="M413.28,213.54L208.5,522.92l132.94,0.19l135.03-206.33l0,0C452.69,284.29,431.53,249.77,413.28,213.54 L413.28,213.54"/>
                                <path style="fill:${this.logoColor};" d="M599.38,447.69l-49.25,75.42L417,522.82l101.6-153.67l0,0C543.48,397.35,570.49,423.61,599.38,447.69 L599.38,447.69z"/>
                            </g>
                        </svg>
                    `)

                favicon16.href = favicon
                favicon32.href = favicon
            }
        }
    }

    @Watch('customFavicons')
    customFaviconsChanged(): void {
        this.drawFavicon(this.print_percent)
    }

    @Watch('logoColor')
    logoColorChanged(): void {
        this.drawFavicon(this.print_percent)
    }

    @Watch('print_percent')
    print_percentChanged(newVal: number): void {
        this.drawFavicon(newVal)
    }

    @Watch('printerIsPrinting')
    printerIsPrintingChanged(): void {
        this.drawFavicon(this.print_percent)
    }

    appHeight() {
        this.$nextTick(() => {
            const doc = document.documentElement
            doc.style.setProperty('--app-height', window.innerHeight + 'px')
        })
    }

    mounted(): void {
        this.drawFavicon(this.print_percent)
        this.appHeight()
        window.addEventListener('resize', this.appHeight)
        window.addEventListener('orientationchange', this.appHeight)
    }
}
</script>

<style>
@import './assets/styles/fonts.css';
@import './assets/styles/toastr.css';
@import './assets/styles/page.scss';
@import './assets/styles/sidebar.scss';
@import './assets/styles/utils.scss';
@import './assets/styles/updateManager.scss';

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
