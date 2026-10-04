<template>
    <v-dialog v-model="showDialog" width="900" :fullscreen="isMobile">
        <panel
            :title="$t('Panels.GcodePreviewPanel.Headline')"
            :icon="mdiVideo2d"
            card-class="gcode-preview-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="showDialog = false">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="gcode-preview-dialog-content">
                <div class="gcode-preview-dialog-toolbar">
                    <div class="gcode-preview-dialog-toggles">
                        <v-checkbox
                            :input-value="showPrintPreview"
                            :label="$t('Panels.GcodePreviewPanel.PrintPreview')"
                            hide-details
                            dense
                            @change="$emit('update:showPrintPreview', $event)" />
                        <v-checkbox
                            :input-value="showMovePath"
                            :label="$t('Panels.GcodePreviewPanel.ShowMovePath')"
                            hide-details
                            dense
                            @change="$emit('update:showMovePath', $event)" />
                    </div>
                    <div class="gcode-preview-dialog-layer">{{ layerLabel }}</div>
                </div>
                <div class="gcode-preview-dialog-chart">
                    <gcode-preview-chart
                        :runs="runs"
                        :show-remaining="showPrintPreview"
                        :travels="travels"
                        :progress-offset="progressOffset"
                        :tool-position="toolPosition"
                        :bed-min="bedMin"
                        :bed-max="bedMax"
                        :tool-on-layer="toolOnLayer" />
                </div>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, VModel } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import GcodePreviewChart from '@/components/charts/GcodePreviewChart.vue'
import { GcodePreviewRun } from '@/components/panels/GcodePreview/parser'
import { mdiCloseThick, mdiVideo2d } from '@mdi/js'

@Component({
    components: { Panel, GcodePreviewChart },
})
export default class GcodePreviewDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiVideo2d = mdiVideo2d

    @VModel({ type: Boolean }) showDialog!: boolean
    @Prop({ type: Array, required: true }) declare readonly runs: GcodePreviewRun[]
    @Prop({ type: Array, required: true }) declare readonly travels: GcodePreviewRun[]
    @Prop({ type: Number, required: true }) declare readonly progressOffset: number
    @Prop({ type: Array, default: null }) declare readonly toolPosition: [number, number] | null
    @Prop({ type: Array, required: true }) declare readonly bedMin: number[]
    @Prop({ type: Array, required: true }) declare readonly bedMax: number[]
    @Prop({ type: String, default: '' }) declare readonly layerLabel: string
    @Prop({ type: Boolean, default: true }) declare readonly showPrintPreview: boolean
    @Prop({ type: Boolean, default: false }) declare readonly showMovePath: boolean
    @Prop({ type: Boolean, default: false }) declare readonly toolOnLayer: boolean
}
</script>

<style scoped>
.gcode-preview-dialog-content {
    padding: 10px;
}

.gcode-preview-dialog-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    flex-wrap: nowrap;
    gap: 8px;
}

.gcode-preview-dialog-toggles {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
}

.gcode-preview-dialog-toolbar ::v-deep .v-input--checkbox {
    margin-top: 0;
    padding-top: 0;
}

.gcode-preview-dialog-toolbar ::v-deep .v-label {
    white-space: nowrap;
}

.gcode-preview-dialog-layer {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    flex: 0 0 auto;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
}

/* the chart keeps the bed's aspect ratio, so cap it to the viewport height
   instead of letting a tall bed push the dialog off screen */
.gcode-preview-dialog-chart {
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: calc(100vh - 220px);
}

.gcode-preview-dialog-chart ::v-deep svg {
    max-height: calc(100vh - 220px);
}
</style>
