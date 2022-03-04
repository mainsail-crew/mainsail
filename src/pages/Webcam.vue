<style scoped></style>

<template>
    <div>
        <v-row>
            <v-col col-12>
                <webcam-panel current-page="page"></webcam-panel>
            </v-col>
        </v-row>
    </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import WebcamPanel from '@/components/panels/WebcamPanel.vue'
@Component({
    components: { WebcamPanel },
})
export default class PageWebcam extends Mixins(BaseMixin) {}
</script>
