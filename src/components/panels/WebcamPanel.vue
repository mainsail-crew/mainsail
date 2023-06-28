<style scoped></style>

<template>
    <panel
        v-if="socketIsConnected"
        :icon="mdiWebcam"
        :title="$t('Panels.WebcamPanel.Headline')"
        :collapsible="$route.fullPath !== '/cam'"
        card-class="webcam-panel"
        :margin-bottom="currentPage !== 'page'">
        <template v-if="webcams.length > 1" #buttons>
            <v-menu :offset-y="true" title="Webcam">
                <template #activator="{ on, attrs }">
                    <v-btn text tile v-bind="attrs" v-on="on">
                        <v-icon v-if="'icon' in currentCam" small class="mr-2">
                            {{ convertWebcamIcon(currentCam.icon) }}
                        </v-icon>
                        <span class="d-none d-md-block">{{ 'name' in currentCam ? currentCam.name : 'unknown' }}</span>
                        <v-icon small>{{ mdiMenuDown }}</v-icon>
                    </v-btn>
                </template>
                <v-list dense class="py-0">
                    <v-list-item link @click="currentCamId = 'all'">
                        <v-list-item-icon class="mr-2">
                            <v-icon small class="mt-1">{{ mdiViewGrid }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{ $t('Panels.WebcamPanel.All') }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item v-for="webcam of webcams" :key="webcam.name" link @click="currentCamId = webcam.name">
                        <v-list-item-icon class="mr-2">
                            <v-icon small class="mt-1">{{ convertWebcamIcon(webcam.icon) }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title v-text="webcam.name"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
        <v-card-text v-if="webcams.length" class="px-0 py-0 content d-inline-block">
            <v-row>
                <v-col class="pb-0" style="position: relative">
                    <webcam-wrapper :webcam="currentCam" />
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-text v-else>
            <p class="text-center mb-0 text--disabled">{{ $t('Panels.WebcamPanel.NoWebcam') }}</p>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { mdiMenuDown, mdiViewGrid, mdiWebcam } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'

@Component({
    components: {
        Panel,
    },
})
export default class WebcamPanel extends Mixins(BaseMixin, WebcamMixin) {
    @Prop({ default: 'dashboard' }) declare currentPage?: string

    mdiWebcam = mdiWebcam
    mdiMenuDown = mdiMenuDown
    mdiViewGrid = mdiViewGrid

    get webcams(): GuiWebcamStateWebcam[] {
        return this.$store.getters['gui/webcams/getWebcams']
    }

    // id changed to name with the refactoring of using moonraker webcam API
    get currentCamId(): string {
        if (this.webcams.length === 1) return this.webcams[0].name ?? 'all'

        let currentCamId = this.$store.state.gui.view.webcam.currentCam[this.currentPage ?? ''] ?? 'all'
        if (this.webcams.findIndex((webcam: GuiWebcamStateWebcam) => webcam.name === currentCamId) !== -1)
            return currentCamId
        else if (currentCamId !== undefined && this.webcams.length === 1) return this.webcams[0].name ?? ''
        else return 'all'
    }

    set currentCamId(newVal: string) {
        this.$store.dispatch('gui/setCurrentWebcam', { page: this.currentPage, value: newVal })
    }

    get currentCam(): any {
        const cam = this.webcams.find((cam: GuiWebcamStateWebcam) => cam.name === this.currentCamId)

        return (
            cam ?? {
                name: this.$t('Panels.WebcamPanel.All'),
                service: 'grid',
                icon: mdiViewGrid,
            }
        )
    }
}
</script>
