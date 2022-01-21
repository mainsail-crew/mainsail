<style scoped>
    .v-card.disabledPrinter {
        opacity: 0.6;
        filter: grayscale(70%);
    }

    .webcamContainer,
    .webcamContainer .vue-load-image,
    .webcamContainer>div,
    .webcamContainer img {
        position: absolute !important;
        top: 0; left: 0; right: 0; bottom: 0;
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
</style>

<template>
    <panel
        icon="mdi-printer-3d"
        :title="printer_name"
        :card-class="'farmprinter-panel '+(!printer.socket.isConnected && !printer.socket.isConnecting ? 'disabledPrinter' : '')"
        :loading="printer.socket.isConnecting"
        :toolbar-color="isCurrentPrinter ? 'primary' : ''"
    >
        <template v-slot:buttons>
            <v-menu :offset-y="true" title="Webcam" v-if="showWebcamSwitch">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn text v-bind="attrs" v-on="on">
                        <v-icon small>mdi-webcam</v-icon>
                        <v-icon small>mdi-menu-down</v-icon>
                    </v-btn>
                </template>
                <v-list dense class="py-0">
                    <v-list-item link @click="currentCamId = 'off'">
                        <v-list-item-icon class="mr-0">
                            <v-icon small>mdi-webcam-off</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{ $t('Panels.FarmPrinterPanel.WebcamOff') }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item v-for="webcam of printer_webcams" v-bind:key="webcam.index" link @click="currentCamId = webcam.id">
                        <v-list-item-icon class="mr-0">
                            <v-icon small>{{ webcam.icon }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title v-text="webcam.name"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
        <v-hover>
            <template v-slot:default="{ hover }">
                <div>
                    <v-img
                        :height="imageHeight"
                        :src="printer_image"
                        class="d-flex align-end"
                        ref="imageDiv"
                    >
                        <div v-if="printer.socket.isConnected && currentCamId !== 'off' && currentWebcam" class="webcamContainer">
                            <template v-if="'service' in currentWebcam && currentWebcam.service === 'mjpegstreamer'">
                                <webcam-mjpegstreamer :cam-settings="currentWebcam" :printer-url="printerUrl" :show-fps="false"></webcam-mjpegstreamer>
                            </template>
                            <template v-if="'service' in currentWebcam && currentWebcam.service === 'mjpegstreamer-adaptive'">
                                <webcam-mjpegstreamer-adaptive :cam-settings="currentWebcam" :printer-url="printerUrl" :show-fps="false"></webcam-mjpegstreamer-adaptive>
                            </template>
                        </div>
                        <v-card-title class="white--text py-2" style="background-color: rgba(0,0,0,0.3); backdrop-filter: blur(3px);">
                            <v-row>
                                <v-col class="col-auto pr-0 d-flex align-center" style="width: 58px">
                                    <template v-if="printer_logo">
                                        <img :src="printer_logo" style="width: 100%;" class="my-auto" alt="Logo" />
                                    </template>
                                    <template v-else>
                                        <mainsail-logo :color="printerLogoColor" style="width: 100%;" class="my-auto"></mainsail-logo>
                                    </template>
                                </v-col>
                                <v-col class="col" style="width: 100px">
                                    <h3 class="font-weight-regular">{{ printer_status }}</h3>
                                    <span class="subtitle-2 text-truncate px-0 text--disabled d-block" v-if="printer_current_filename !== ''"><v-icon small class="mr-1">mdi-file-outline</v-icon>{{ printer_current_filename }}</span>
                                </v-col>
                            </v-row>
                        </v-card-title>
                    </v-img>
                    <v-card-text class="px-0 py-2" v-if="printer_preview.length">
                        <v-container class="py-0">
                            <v-row>
                                <v-col :class="object.name === 'ETA' ? 'col-auto' : 'col' + ' px-2'" v-for="object in printer_preview" v-bind:key="object.name">
                                    <strong class="d-block text-center">{{ object.name }}</strong>
                                    <span class="d-block text-center">{{ object.value }}</span>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-fade-transition>
                        <v-overlay v-if="hover" absolute :z-index="4" >
                            <v-btn color="primary" @click="clickPrinter">{{ printer.socket.isConnected ? $t("Panels.FarmPrinterPanel.SwitchToPrinter") : $t("Panels.FarmPrinterPanel.ReconnectToPrinter") }}</v-btn>
                        </v-overlay>
                    </v-fade-transition>
                </div>
            </template>
        </v-hover>
    </panel>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Ref, Vue} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FarmPrinterState } from '@/store/farm/printer/types'
import Mjpegstreamer from '@/components/webcams/Mjpegstreamer.vue'
import MjpegstreamerAdaptive from '@/components/webcams/MjpegstreamerAdaptive.vue'
import MainsailLogo from '@/components/ui/MainsailLogo.vue'
import Panel from '@/components/ui/Panel.vue'

@Component({
    components: {
        Panel,
        'webcam-mjpegstreamer': Mjpegstreamer,
        'webcam-mjpegstreamer-adaptive': MjpegstreamerAdaptive,
        'mainsail-logo': MainsailLogo
    }
})
export default class FarmPrinterPanel extends Mixins(BaseMixin) {
    private imageHeight = 200;

    @Prop({ type: Object, required: true }) printer!: FarmPrinterState
    @Ref() readonly imageDiv!: Vue

    get printerUrl() {
        const thisUrl = window.location.href.split('/')
        const protocol = thisUrl[0]

        let url = protocol+'//'+this.printer.socket.hostname
        if (80 !== this.printer.socket.webPort) url += ':'+this.printer.socket.webPort

        return url
    }

    get isCurrentPrinter() {
        return this.$store.getters['farm/'+this.printer._namespace+'/isCurrentPrinter']
    }

    get currentCamId() {
        return this.$store.getters['farm/'+this.printer._namespace+'/getSetting']('currentCamId', 'off')
    }

    set currentCamId(newVal) {
        this.$store.dispatch('farm/'+this.printer._namespace+'/setSettings', { currentCamId: newVal })
    }

    get printer_name() {
        return this.$store.getters['farm/'+this.printer._namespace+'/getPrinterName']
    }

    get printer_status() {
        return this.$store.getters['farm/'+this.printer._namespace+'/getStatus']
    }

    get printer_current_filename() {
        return this.$store.getters['farm/'+this.printer._namespace+'/getCurrentFilename']
    }

    get printer_image() {
        return this.$store.getters['farm/'+this.printer._namespace+'/getImage']
    }

    get printer_logo() {
        return this.$store.getters['farm/'+this.printer._namespace+'/getLogo']
    }

    get printerLogoColor() {
        return this.$store.getters['farm/'+this.printer._namespace+'/getLogoColor']
    }

    get printer_position() {
        return this.$store.getters['farm/'+this.printer._namespace+'/getPosition']
    }

    get printer_preview() {
        return this.$store.getters['farm/'+this.printer._namespace+'/getPrinterPreview']
    }

    get showWebcamSwitch() {
        return (this.printer.socket.isConnected && this.printer_webcams.length > 0)
    }

    get printer_webcams() {
        return this.$store.getters['farm/'+this.printer._namespace+'/getPrinterWebcams']
    }

    get currentWebcam() {
        const currentCam = this.printer_webcams.find((webcam: any) => webcam.id === this.currentCamId)
        if (currentCam) return currentCam

        return false
    }

    clickPrinter() {
        if (this.printer.socket.isConnected)
            this.$store.dispatch('changePrinter', { printer: this.printer._namespace })
        else
            this.$store.dispatch('farm/'+this.printer._namespace+'/reconnect')
    }

    mounted() {
        window.addEventListener('resize', this.resize)
        this.resize()
    }

    beforeDestroy() {
        window.removeEventListener('resize', this.resize)
    }

    resize() {
        if (this.imageDiv?.$el?.clientWidth) {
            this.imageHeight = Math.round(this.imageDiv.$el.clientWidth / 3 * 2)
        } else this.imageHeight = 200
    }

}
</script>