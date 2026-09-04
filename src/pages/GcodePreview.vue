<template>
    <div>
        <v-row>
            <v-col col-12>
                <gcode-preview-panel />
            </v-col>
        </v-row>
    </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import GcodePreviewPanel from '@/components/panels/GcodePreviewPanel.vue'
@Component({
    components: { GcodePreviewPanel },
})
export default class PageGcodePreview extends Mixins(BaseMixin) {}
</script>
