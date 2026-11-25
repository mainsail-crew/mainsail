<template>
    <panel
        ref="panel"
        :icon="mdiPrinter3d"
        :title="printerName"
        card-class="farmprinter-panel"
        :class="panelClass"
        :loading="printer.socket.isConnecting"
        :toolbar-color="isCurrentPrinter ? 'primary' : ''">
        <template #buttons>
            <v-menu v-if="showWebcamSwitch" :offset-y="true" title="Webcam">
                <template #activator="{ on, attrs }">
                    <v-btn text v-bind="attrs" v-on="on">
                        <v-icon small>{{ mdiWebcam }}</v-icon>
                        <v-icon small>{{ mdiMenuDown }}</v-icon>
                    </v-btn>
                </template>
                <v-list dense class="py-0">
                    <v-list-item link @click="currentCamName = 'off'">
                        <v-list-item-icon class="mr-2">
                            <v-icon small class="mt-1">{{ mdiWebcamOff }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{ $t('Panels.FarmPrinterPanel.WebcamOff') }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item
                        v-for="webcam of webcams"
                        :key="webcam.name"
                        link
                        @click="currentCamName = webcam.name">
                        <v-list-item-icon class="mr-2">
                            <v-icon small class="mt-1">{{ convertWebcamIcon(webcam.icon) }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title v-text="webcam.name" />
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
        <v-hover>
            <template #default="{ hover }">
                <div>
                    <v-img ref="imageDiv" :height="imageHeight" :src="image" class="d-flex align-end">
                        <div
                            v-if="
                                printer.socket.isConnected &&
                                currentCamName !== 'off' &&
                                currentWebcam &&
                                'service' in currentWebcam
                            "
                            class="webcamContainer">
                            <webcam-wrapper :webcam="currentWebcam" :printer-url="webUrl" :show-fps="false" />
                        </div>
                        <v-card-title
                            class="white--text py-2"
                            style="background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(3px)">
                            <v-row>
                                <v-col class="col-auto pr-0 d-flex align-center" style="width: 58px">
                                    <img v-if="logoUrl" :src="logoUrl" style="width: 100%" class="my-auto" alt="Logo" />
                                    <mainsail-logo v-else :color="logoColor" style="width: 100%" class="my-auto" />
                                </v-col>
                                <v-col class="col" style="width: 100px">
                                    <h3 class="font-weight-regular">{{ statusText }}</h3>
                                    <span
                                        v-if="currentFilename !== ''"
                                        class="subtitle-2 text-truncate px-0 text--disabled d-block">
                                        <v-icon small class="mr-1">{{ mdiFileOutline }}</v-icon>
                                        {{ currentFilename }}
                                    </span>
                                </v-col>
                            </v-row>
                        </v-card-title>
                    </v-img>
                    <v-card-text v-if="previewItems.length" class="px-0 py-2">
                        <v-container class="py-0">
                            <v-row>
                                <v-col
                                    v-for="item in previewItems"
                                    :key="item.name"
                                    :class="item.name === 'ETA' ? 'col-auto' : 'col' + ' px-2'">
                                    <strong class="d-block text-center">{{ item.name }}</strong>
                                    <span class="d-block text-center">{{ item.value }}</span>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-fade-transition>
                        <v-overlay v-if="hover" absolute :z-index="4">
                            <v-btn color="primary" @click="clickPrinter">
                                {{
                                    printer.socket.isConnected
                                        ? $t('Panels.FarmPrinterPanel.SwitchToPrinter')
                                        : $t('Panels.FarmPrinterPanel.ReconnectToPrinter')
                                }}
                            </v-btn>
                        </v-overlay>
                    </v-fade-transition>
                </div>
            </template>
        </v-hover>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Vue } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FarmPrinterState, FarmPrinterTemperature } from '@/store/farm/printer/types'
import { formatEta } from '@/plugins/helpers'
import MainsailLogo from '@/components/ui/MainsailLogo.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiPrinter3d, mdiWebcam, mdiMenuDown, mdiWebcamOff, mdiFileOutline } from '@mdi/js'
import { Debounce } from 'vue-debounce-decorator'
import WebcamMixin from '@/components/mixins/webcam'
import WebcamWrapper from '@/components/webcams/WebcamWrapper.vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import ThemeMixin from '@/components/mixins/theme'

@Component({
    components: {
        Panel,
        'webcam-wrapper': WebcamWrapper,
        'mainsail-logo': MainsailLogo,
    },
})
export default class FarmPrinterPanel extends Mixins(BaseMixin, ThemeMixin, WebcamMixin) {
    mdiPrinter3d = mdiPrinter3d
    mdiWebcam = mdiWebcam
    mdiMenuDown = mdiMenuDown
    mdiWebcamOff = mdiWebcamOff
    mdiFileOutline = mdiFileOutline

    imageHeight = 200
    resizeObserver: ResizeObserver | null = null

    @Prop({ type: Object, required: true }) declare printer: FarmPrinterState
    @Ref() readonly imageDiv!: Vue
    @Ref() readonly panel!: Vue

    get farmNamespace(): string {
        return `farm/${this.printer.id}`
    }

    get webUrl(): string {
        return this.$store.getters[`${this.farmNamespace}/webUrl`]
    }

    get isCurrentPrinter(): boolean {
        return this.$store.getters[`${this.farmNamespace}/isCurrentPrinter`]
    }

    get currentCamName(): string {
        return this.$store.getters[`${this.farmNamespace}/currentCamName`]
    }

    set currentCamName(newVal: string) {
        this.$store.dispatch(`${this.farmNamespace}/saveSettings`, { currentCamName: newVal })
    }

    get printerName(): string {
        return this.$store.getters[`${this.farmNamespace}/printerName`]
    }

    get statusText(): string {
        return this.$store.getters[`${this.farmNamespace}/statusText`]
    }

    get currentFilename(): string {
        return this.$store.getters[`${this.farmNamespace}/currentFilename`]
    }

    get image(): string {
        if (this.currentWebcam) return this.sidebarBgImage

        return this.$store.getters[`${this.farmNamespace}/thumbnailUrl`] ?? this.sidebarBgImage
    }

    get logoUrl(): string | null {
        return this.$store.getters[`${this.farmNamespace}/logoUrl`]
    }

    get logoColor(): string {
        return this.$store.getters[`${this.farmNamespace}/logoColor`]
    }

    get temperatures(): FarmPrinterTemperature[] {
        return this.$store.getters[`${this.farmNamespace}/temperatures`]
    }

    get showEta(): boolean {
        return (
            this.$store.getters[`${this.farmNamespace}/isPrinting`] &&
            this.$store.getters[`${this.farmNamespace}/progress`] > 0
        )
    }

    get previewItems(): { name: string; value: string }[] {
        const items = this.temperatures.map((item) => ({
            name: item.name,
            value:
                item.target === null
                    ? `${item.temperature.toFixed(0)}°`
                    : `${item.temperature.toFixed(0)}° / ${item.target.toFixed(0)}°`,
        }))

        if (this.showEta) {
            const eta = this.$store.getters[`${this.farmNamespace}/eta`]
            items.push({ name: 'ETA', value: formatEta(eta, this.hours12Format) })
        }

        return items
    }

    get showWebcamSwitch(): boolean {
        if (this.webcams.length === 0) return false

        return this.printer.socket.isConnected
    }

    get webcams(): GuiWebcamStateWebcam[] {
        return this.$store.getters[`${this.farmNamespace}/webcams`]
    }

    get currentWebcam(): GuiWebcamStateWebcam | null {
        return this.webcams.find((webcam) => webcam.name === this.currentCamName) ?? null
    }

    get panelClass(): string[] {
        const output = []

        if (!this.printer.socket.isConnected && !this.printer.socket.isConnecting) output.push('disabledPrinter')

        return output
    }

    clickPrinter() {
        // If the printer is already connected, just switch to it
        if (this.printer.socket.isConnected) {
            this.$store.dispatch('changePrinter', { printer: this.printer.id })
            return
        }

        // Otherwise, reconnect to the printer
        this.$store.dispatch(`${this.farmNamespace}/connect`)
    }

    mounted() {
        this.calcImageHeight()

        this.resizeObserver = new ResizeObserver(() => this.handleResize())
        this.resizeObserver.observe(this.panel.$el)
    }

    beforeDestroy() {
        this.resizeObserver?.disconnect()
    }

    calcImageHeight() {
        if (this.imageDiv?.$el?.clientWidth) {
            this.imageHeight = Math.round((this.imageDiv.$el.clientWidth / 3) * 2)
            return
        }

        this.imageHeight = 200
    }

    @Debounce(200)
    handleResize() {
        this.$nextTick(() => {
            this.calcImageHeight()
        })
    }
}
</script>

<style scoped>
.v-card.disabledPrinter {
    opacity: 0.6;
    filter: grayscale(70%);
}

.webcamContainer,
.webcamContainer .vue-load-image,
.webcamContainer > div,
.webcamContainer img {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.webcamContainer img {
    height: 100%;
}

.webcamContainer .webcamFpsOutput {
    display: none;
}

.v-overlay {
    top: 48px;
}

::v-deep .farmprinter-panel {
    position: relative;
}
</style>
