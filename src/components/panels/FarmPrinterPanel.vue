<template>
    <panel
        :icon="mdiPrinter3d"
        :title="printer_name"
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
                        v-for="webcam of printer_webcams"
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
                    <v-img ref="imageDiv" :height="imageHeight" :src="printer_image" class="d-flex align-end">
                        <div
                            v-if="
                                printer.socket.isConnected &&
                                currentCamName !== 'off' &&
                                currentWebcam &&
                                'service' in currentWebcam
                            "
                            class="webcamContainer">
                            <webcam-wrapper :webcam="currentWebcam" :printer-url="printerUrl" :show-fps="false" />
                        </div>
                        <v-card-title
                            class="white--text py-2"
                            style="background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(3px)">
                            <v-row>
                                <v-col class="col-auto pr-0 d-flex align-center" style="width: 58px">
                                    <template v-if="printer_logo">
                                        <img :src="printer_logo" style="width: 100%" class="my-auto" alt="Logo" />
                                    </template>
                                    <template v-else>
                                        <mainsail-logo
                                            :color="printerLogoColor"
                                            style="width: 100%"
                                            class="my-auto"></mainsail-logo>
                                    </template>
                                </v-col>
                                <v-col class="col" style="width: 100px">
                                    <h3 class="font-weight-regular">{{ printer_status }}</h3>
                                    <span
                                        v-if="printer_current_filename !== ''"
                                        class="subtitle-2 text-truncate px-0 text--disabled d-block">
                                        <v-icon small class="mr-1">{{ mdiFileOutline }}</v-icon>
                                        {{ printer_current_filename }}
                                    </span>
                                </v-col>
                            </v-row>
                        </v-card-title>
                    </v-img>
                    <v-card-text v-if="printer_preview.length" class="px-0 py-2">
                        <v-container class="py-0">
                            <v-row>
                                <v-col
                                    v-for="object in printer_preview"
                                    :key="object.name"
                                    :class="object.name === 'ETA' ? 'col-auto' : 'col' + ' px-2'">
                                    <strong class="d-block text-center">{{ object.name }}</strong>
                                    <span class="d-block text-center">{{ object.value }}</span>
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
        <resize-observer @notify="handleResize" />
    </panel>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Vue } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FarmPrinterState } from '@/store/farm/printer/types'
import MainsailLogo from '@/components/ui/MainsailLogo.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiPrinter3d, mdiWebcam, mdiMenuDown, mdiWebcamOff, mdiFileOutline } from '@mdi/js'
import { Debounce } from 'vue-debounce-decorator'
import WebcamMixin from '@/components/mixins/webcam'
import WebcamWrapper from '@/components/webcams/WebcamWrapper.vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

@Component({
    components: {
        Panel,
        'webcam-wrapper': WebcamWrapper,
        'mainsail-logo': MainsailLogo,
    },
})
export default class FarmPrinterPanel extends Mixins(BaseMixin, WebcamMixin) {
    mdiPrinter3d = mdiPrinter3d
    mdiWebcam = mdiWebcam
    mdiMenuDown = mdiMenuDown
    mdiWebcamOff = mdiWebcamOff
    mdiFileOutline = mdiFileOutline

    private imageHeight = 200

    @Prop({ type: Object, required: true }) declare printer: FarmPrinterState
    @Ref() declare readonly imageDiv: Vue

    get printerUrl() {
        const thisUrl = window.location.href.split('/')
        const protocol = thisUrl[0]

        let url = protocol + '//' + this.printer.socket.hostname
        if (80 !== this.printer.socket.webPort) url += ':' + this.printer.socket.webPort

        return url
    }

    get isCurrentPrinter() {
        return this.$store.getters['farm/' + this.printer._namespace + '/isCurrentPrinter']
    }

    get currentCamName() {
        return this.$store.getters['farm/' + this.printer._namespace + '/getSetting']('currentCamName', 'off')
    }

    set currentCamName(newVal) {
        this.$store.dispatch('farm/' + this.printer._namespace + '/setSettings', { currentCamName: newVal })
    }

    get printer_name() {
        return this.$store.getters['farm/' + this.printer._namespace + '/getPrinterName']
    }

    get printer_status() {
        return this.$store.getters['farm/' + this.printer._namespace + '/getStatus']
    }

    get printer_current_filename() {
        return this.$store.getters['farm/' + this.printer._namespace + '/getCurrentFilename']
    }

    get printer_image() {
        if (this.currentWebcam) return '/img/sidebar-background.svg'

        return this.$store.getters['farm/' + this.printer._namespace + '/getImage']
    }

    get printer_logo() {
        return this.$store.getters['farm/' + this.printer._namespace + '/getLogo']
    }

    get printerLogoColor() {
        return this.$store.getters['farm/' + this.printer._namespace + '/getLogoColor']
    }

    get printer_position() {
        return this.$store.getters['farm/' + this.printer._namespace + '/getPosition']
    }

    get printer_preview() {
        return this.$store.getters['farm/' + this.printer._namespace + '/getPrinterPreview']
    }

    get showWebcamSwitch() {
        if (this.printer_webcams.length == 0) return false

        return this.printer.socket.isConnected
    }

    get printer_webcams(): GuiWebcamStateWebcam[] {
        return this.$store.getters['farm/' + this.printer._namespace + '/getPrinterWebcams']
    }

    get currentWebcam(): GuiWebcamStateWebcam | null {
        const currentCam = this.printer_webcams?.find(
            (webcam: GuiWebcamStateWebcam) => webcam.name === this.currentCamName
        )
        if (currentCam) return currentCam

        return null
    }

    get panelClass(): string[] {
        let output = []

        if (!this.printer.socket.isConnected && !this.printer.socket.isConnecting) output.push('disabledPrinter')

        return output
    }

    clickPrinter() {
        if (this.printer.socket.isConnected) this.$store.dispatch('changePrinter', { printer: this.printer._namespace })
        else this.$store.dispatch('farm/' + this.printer._namespace + '/reconnect')
    }

    mounted() {
        this.calcImageHeight()
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
