<template>
    <div>
        <template v-if="webcam.service === 'grid'">
            <v-container v-if="webcams" fluid class="pb-4">
                <v-row dense>
                    <v-col v-for="gridWebcam in webcams" :key="gridWebcam.name" cols="6">
                        <webcam-wrapper-item :webcam="gridWebcam" :printer-url="printerUrl" :show-fps="showFps" />
                    </v-col>
                </v-row>
            </v-container>
        </template>
        <template v-else>
            <webcam-wrapper-item :webcam="webcam" :printer-url="printerUrl" :show-fps="showFps" />
        </template>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamWrapperItem from '@/components/webcams/WebcamWrapperItem.vue'

@Component({
    components: {
        WebcamWrapperItem,
    },
})
export default class WebcamWrapper extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) webcam!: GuiWebcamStateWebcam
    @Prop({ type: Boolean, default: true }) showFps!: Boolean
    @Prop({ type: String, default: null }) printerUrl!: string | null

    get webcams(): GuiWebcamStateWebcam[] {
        return this.$store.getters['gui/webcams/getWebcams']
    }
}
</script>

<style scoped></style>
