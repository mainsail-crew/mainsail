<style scoped>

</style>

<template>
    <panel
        v-if="socketIsConnected"
        icon="mdi-webcam"
        :title="$t('Panels.WebcamPanel.Headline')"
        :collapsible="true"
        card-class="webcam-panel"
    >
        <template v-slot:buttons>
            <v-item-group v-if="webcams.length > 1">
                <v-menu :offset-y="true" title="Webcam">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn small class="px-2 minwidth-0" color="primary" v-bind="attrs" v-on="on">
                            <v-icon small v-if="'icon' in currentCam" class="mr-2">{{ currentCam.icon }}</v-icon>
                            {{ 'name' in currentCam ? currentCam.name : "unknown" }}
                            <v-icon small>mdi-menu-down</v-icon>
                        </v-btn>
                    </template>
                    <v-list dense class="py-0">
                        <v-list-item link @click="currentCamName = 'all'">
                            <v-list-item-icon class="mr-0">
                                <v-icon small>mdi-view-grid</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ $t('Panels.WebcamPanel.All') }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item v-for="webcam of webcams" v-bind:key="webcam.name" link @click="currentCamName = webcam.name">
                            <v-list-item-icon class="mr-0">
                                <v-icon small>{{ webcam.icon }}</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title v-text="webcam.name"></v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-item-group>
        </template>
        <v-card-text class="px-0 py-0 content d-inline-block">
            <v-row>
                <v-col class="pb-0" style="position: relative;">
                    <template v-if="'service' in this.currentCam && this.currentCam.service === 'grid'">
                        <webcam-grid :webcams="this.webcams"></webcam-grid>
                    </template>
                    <template v-else-if="'service' in this.currentCam && this.currentCam.service === 'mjpegstreamer'">
                        <webcam-mjpegstreamer :cam-settings="this.currentCam"></webcam-mjpegstreamer>
                    </template>
                    <template v-else-if="'service' in this.currentCam && this.currentCam.service === 'mjpegstreamer-adaptive'">
                        <webcam-mjpegstreamer-adaptive :cam-settings="this.currentCam"></webcam-mjpegstreamer-adaptive>
                    </template>
                    <template v-else-if="'service' in this.currentCam && this.currentCam.service === 'uv4l-mjpeg'">
                        <webcam-uv4l-mjpeg :cam-settings="this.currentCam"></webcam-uv4l-mjpeg>
                    </template>
                    <template v-else-if="'service' in this.currentCam && this.currentCam.service === 'ipstream'">
                        <webcam-ipstreamer :cam-settings="this.currentCam"></webcam-ipstreamer>
                    </template>
                    <template v-else>
                        <p class="text-center py-3 font-italic">{{ $t('Panels.WebcamPanel.UnknownWebcamService') }}</p>
                    </template>
                </v-col>
            </v-row>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import Mjpegstreamer from '@/components/webcams/Mjpegstreamer.vue'
import MjpegstreamerAdaptive from '@/components/webcams/MjpegstreamerAdaptive.vue'
import Ipstreamer from '@/components/webcams/Ipstreamer.vue'
import Uv4lMjpeg from '@/components/webcams/Uv4lMjpeg.vue'
import WebcamGrid from '@/components/webcams/WebcamGrid.vue'
import Component from 'vue-class-component'
import {Mixins} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import {GuiStateWebcam} from '@/store/gui/types'
import Panel from '@/components/ui/Panel.vue'

@Component({
    components: {
        Panel,
        'webcam-mjpegstreamer': Mjpegstreamer,
        'webcam-mjpegstreamer-adaptive': MjpegstreamerAdaptive,
        'webcam-ipstreamer': Ipstreamer,
        'webcam-uv4l-mjpeg': Uv4lMjpeg,
        'webcam-grid': WebcamGrid,
    }
})
export default class WebcamPanel extends Mixins(BaseMixin) {

    get webcams(): GuiStateWebcam[] {
        return this.$store.getters['gui/getWebcams']
    }

    get currentCamName(): string {
        let currentCamName = this.$store.state.gui.webcam.selectedCam
        if (currentCamName !== undefined && this.webcams.findIndex((webcam: GuiStateWebcam) => webcam.name === currentCamName) !== -1)
            return currentCamName

        if (currentCamName !== undefined && Array.isArray(this.webcams) && this.webcams.length === 1)
            return this.webcams[0].name

        return 'all'
    }

    set currentCamName(newVal: string) {
        this.$store.dispatch('gui/saveSetting', { name: 'webcam.selectedCam', value: newVal })
    }

    get currentCam(): any {
        if (this.currentCamName === 'all') {
            return {
                name: this.$t('Panels.WebcamPanel.All'),
                service: 'grid',
                icon: 'mdi-view-grid',
            }
        } else {
            const currentCam = this.webcams.findIndex((webcam: GuiStateWebcam) => webcam.name === this.currentCamName)
            if (currentCam !== -1) return this.webcams[currentCam]
        }

        return {}
    }

    get nonExpandPanels() {
        return this.$store.state.gui.dashboard.nonExpandPanels
    }
}
</script>