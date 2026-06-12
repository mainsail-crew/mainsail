<template>
    <div>
        <template v-if="webcam.service === 'grid'">
            <v-container v-if="webcams" fluid class="pb-4">
                <v-row density="compact">
                    <v-col v-for="gridWebcam in webcams" :key="gridWebcam.name" cols="6">
                        <webcam-wrapper-item
                            :webcam="gridWebcam"
                            :printer-url="printerUrl"
                            :show-fps="showFps"
                            :page="page" />
                    </v-col>
                </v-row>
            </v-container>
        </template>
        <template v-else>
            <webcam-wrapper-item :webcam="webcam" :printer-url="printerUrl" :show-fps="showFps" :page="page" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamWrapperItem from '@/components/webcams/WebcamWrapperItem.vue'

const props = defineProps({
    webcam: { type: Object, required: true },
    showFps: { type: Boolean, default: true },
    printerUrl: { type: String, default: null },
    page: { type: String, default: null },
})

const store = useStore()

const webcams = computed<GuiWebcamStateWebcam[]>(() => store.getters['gui/webcams/getWebcams'])
</script>

<style scoped></style>
