<template>
    <responsive :breakpoints="{ large: (el) => el.width >= 640 }">
        <template #default="{ el }">
            <v-container>
                <v-row>
                    <v-col>
                        <number-input
                            :label="$t('Panels.ExtruderControlPanel.FilamentLength')"
                            param="feedamount"
                            :target="feedamount"
                            :disabled="printerIsPrintingOnly"
                            :output-error-msg="true"
                            :has-spinner="true"
                            :spinner-factor="100"
                            :step="0.01"
                            :min="0.01"
                            :max="maxExtrudeOnlyDistance"
                            :dec="2"
                            unit="mm"
                            :submit-on-blur="true"
                            @submit="setFeedamount" />
                        <v-item-group class="_btn-group pt-3">
                            <v-btn
                                v-for="value in feedamountsSorted"
                                :key="value"
                                :disabled="printerIsPrintingOnly"
                                dense
                                class="_btn-qs flex-grow-1 px-0"
                                @click="setFeedamount({ value })">
                                {{ value }}
                            </v-btn>
                        </v-item-group>
                    </v-col>
                    <v-col>
                        <number-input
                            :label="$t('Panels.ExtruderControlPanel.ExtrusionFeedrate')"
                            param="feedrate"
                            :target="feedrate"
                            :disabled="printerIsPrintingOnly"
                            :has-spinner="true"
                            :output-error-msg="true"
                            :spinner-factor="100"
                            :step="0.01"
                            :min="0.01"
                            :max="null"
                            :dec="2"
                            type="number"
                            unit="mm/s"
                            @submit="setFeedrate" />
                        <v-item-group class="_btn-group pt-3">
                            <v-btn
                                v-for="value in feedratesSorted"
                                :key="value"
                                :disabled="printerIsPrintingOnly"
                                dense
                                class="_btn-qs flex-grow-1 px-0"
                                @click="setFeedrate({ value })">
                                {{ value }}
                            </v-btn>
                        </v-item-group>
                    </v-col>
                    <!-- EXTRUDE AND RETRACT BUTTON LARGE SIZED PANEL -->
                    <v-col v-if="el.is.large" class="col-3 d-flex align-center flex-column justify-center">
                        <!-- RETRACT -->
                        <v-tooltip left :disabled="extrudePossible && !tooLargeExtrusion" color="secondary">
                            <template #activator="{ on }">
                                <div class="mb-4" v-on="on">
                                    <v-btn
                                        :loading="loadings.includes('btnRetract')"
                                        :disabled="!extrudePossible || tooLargeExtrusion || printerIsPrintingOnly"
                                        small
                                        class="_btn-extruder-cmd"
                                        @click="sendRetract()">
                                        <v-icon small class="mr-1">{{ mdiArrowUpBold }}</v-icon>
                                        {{ $t('Panels.ExtruderControlPanel.Retract') }}
                                    </v-btn>
                                </div>
                            </template>
                            <span v-show="!extrudePossible">
                                {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                                {{ minExtrudeTemp }} °C
                            </span>
                            <span v-show="tooLargeExtrusion">
                                {{ $t('Panels.ExtruderControlPanel.TooLargeExtrusion') }}
                                <br />
                                {{ $t('Panels.ExtruderControlPanel.Requested') }}: {{ feedamount * extrudeFactor }} mm
                                <br />
                                {{ $t('Panels.ExtruderControlPanel.Allowed') }}: {{ maxExtrudeOnlyDistance }} mm
                            </span>
                        </v-tooltip>
                        <!-- EXTRUDE  -->
                        <v-tooltip left :disabled="extrudePossible && !tooLargeExtrusion" color="secondary">
                            <template #activator="{ on }">
                                <div v-on="on">
                                    <v-btn
                                        :loading="loadings.includes('btnDetract')"
                                        :disabled="!extrudePossible || tooLargeExtrusion || printerIsPrintingOnly"
                                        small
                                        class="_btn-extruder-cmd"
                                        @click="sendExtrude()">
                                        <v-icon small class="mr-1">{{ mdiArrowDownBold }}</v-icon>
                                        {{ $t('Panels.ExtruderControlPanel.Extrude') }}
                                    </v-btn>
                                </div>
                            </template>
                            <span v-show="!extrudePossible">
                                {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                                {{ minExtrudeTemp }} °C
                            </span>
                            <span v-show="tooLargeExtrusion">
                                {{ $t('Panels.ExtruderControlPanel.TooLargeExtrusion') }}
                                <br />
                                {{ $t('Panels.ExtruderControlPanel.Requested') }}: {{ feedamount * extrudeFactor }} mm
                                <br />
                                {{ $t('Panels.ExtruderControlPanel.Allowed') }}: {{ maxExtrudeOnlyDistance }} mm
                            </span>
                        </v-tooltip>
                    </v-col>
                </v-row>
                <!-- EXTRUDE AND RETRACT BUTTON SMALL AND MEDIUM SIZED PANEL -->
                <v-row v-if="!el.is.large">
                    <v-col class="pa-0">
                        <div class="d-flex justify-space-around">
                            <div class="d-flex align-center">
                                <!-- RETRACT -->
                                <v-tooltip top :disabled="extrudePossible && !tooLargeExtrusion" color="secondary">
                                    <template #activator="{ on }">
                                        <div class="pt-1 pb-2 px-3" v-on="on">
                                            <v-btn
                                                :loading="loadings.includes('btnRetract')"
                                                :disabled="
                                                    !extrudePossible || tooLargeExtrusion || printerIsPrintingOnly
                                                "
                                                small
                                                class="_btn-extruder-cmd"
                                                @click="sendRetract()">
                                                <v-icon small class="mr-1">{{ mdiArrowUpBold }}</v-icon>
                                                {{ $t('Panels.ExtruderControlPanel.Retract') }}
                                            </v-btn>
                                        </div>
                                    </template>
                                    <span v-show="!extrudePossible">
                                        {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                                        {{ minExtrudeTemp }} °C
                                    </span>
                                    <span v-show="tooLargeExtrusion">
                                        {{ $t('Panels.ExtruderControlPanel.TooLargeExtrusion') }}
                                        <br />
                                        {{ $t('Panels.ExtruderControlPanel.Requested') }}:
                                        {{ feedamount * extrudeFactor }} mm
                                        <br />
                                        {{ $t('Panels.ExtruderControlPanel.Allowed') }}: {{ maxExtrudeOnlyDistance }} mm
                                    </span>
                                </v-tooltip>
                                <!-- EXTRUDE  -->
                                <v-tooltip top :disabled="extrudePossible && !tooLargeExtrusion" color="secondary">
                                    <template #activator="{ on }">
                                        <div class="pt-1 pb-2 px-3" v-on="on">
                                            <v-btn
                                                :loading="loadings.includes('btnDetract')"
                                                :disabled="
                                                    !extrudePossible || tooLargeExtrusion || printerIsPrintingOnly
                                                "
                                                small
                                                class="_btn-extruder-cmd"
                                                @click="sendExtrude()">
                                                <v-icon small class="mr-1">{{ mdiArrowDownBold }}</v-icon>
                                                {{ $t('Panels.ExtruderControlPanel.Extrude') }}
                                            </v-btn>
                                        </div>
                                    </template>
                                    <span v-show="!extrudePossible">
                                        {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                                        {{ minExtrudeTemp }} °C
                                    </span>
                                    <span v-show="tooLargeExtrusion">
                                        {{ $t('Panels.ExtruderControlPanel.TooLargeExtrusion') }}
                                        <br />
                                        {{ $t('Panels.ExtruderControlPanel.Requested') }}:
                                        {{ feedamount * extrudeFactor }} mm
                                        <br />
                                        {{ $t('Panels.ExtruderControlPanel.Allowed') }}: {{ maxExtrudeOnlyDistance }} mm
                                    </span>
                                </v-tooltip>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
            <!-- EXTRUSION ESTIMATION NOTE -->
            <estimated-extrusion-output />
        </template>
    </responsive>
</template>

<script lang="ts">
import { mdiArrowDownBold, mdiArrowUpBold, mdiPrinter3dNozzle } from '@mdi/js'
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import NumberInput from '@/components/inputs/NumberInput.vue'
import Responsive from '@/components/ui/Responsive.vue'
import ToolSlider from '@/components/inputs/ToolSlider.vue'
import ExtruderMixin from '@/components/mixins/extruder'

@Component({
    components: {
        NumberInput,
        Responsive,
        ToolSlider,
    },
})
export default class ExtruderControlPanel extends Mixins(BaseMixin, ExtruderMixin) {
    mdiArrowDownBold = mdiArrowDownBold
    mdiArrowUpBold = mdiArrowUpBold
    mdiPrinter3dNozzle = mdiPrinter3dNozzle

    get feedamounts(): number[] {
        return this.$store.state.gui.control.extruder?.feedamounts ?? []
    }

    get feedrates(): number[] {
        return this.$store.state.gui.control.extruder?.feedrates ?? []
    }

    get feedamountsSorted(): number[] {
        return [...this.feedamounts].sort((a, b) => {
            return b - a
        })
    }

    get feedratesSorted(): number[] {
        return [...this.feedrates].sort((a, b) => {
            return b - a
        })
    }

    setFeedamount(params: { value: number }): void {
        this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedamount', value: params.value })
    }

    setFeedrate(params: { value: number }): void {
        this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedrate', value: params.value })
    }

    get maxExtrudeOnlyDistance(): number {
        return this.activeExtruderSettings?.max_extrude_only_distance ?? 50
    }

    get tooLargeExtrusion(): boolean {
        return this.feedamount * this.extrudeFactor > this.maxExtrudeOnlyDistance
    }

    @Watch('maxExtrudeOnlyDistance', { immediate: true })
    onMaxExtrudeOnlyDistanceChange(): void {
        /**
         * If, while switching from ex. A to ex. B, the feedamount
         * from ex. an exceeds the maxExtrudeOnlyDistance of ex. B,
         * set the feedamount to maxExtrudeOnlyDistance of ex. B
         */
        if (this.feedamount > this.maxExtrudeOnlyDistance) {
            this.setFeedamount({ value: this.maxExtrudeOnlyDistance })
        }
    }

    sendRetract(): void {
        const gcode = `M83\nG1 E-${this.feedamount} F${this.feedrate * 60}`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'btnRetract' })
    }

    sendExtrude(): void {
        const gcode = `M83\nG1 E${this.feedamount} F${this.feedrate * 60}`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'btnDetract' })
    }
}
</script>

<style scoped>
._btn-group {
    border-radius: 4px;
    display: inline-flex;
    flex-wrap: nowrap;
    max-width: 100%;
    min-width: 100%;
    width: 100%;

    .v-btn {
        border-radius: 0;
        border-color: rgba(255, 255, 255, 0.12);
        border-style: solid;
        border-width: thin;
        box-shadow: none;
        height: 28px;
        opacity: 0.8;
        min-width: auto !important;
    }

    .v-btn:first-child {
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
    }

    .v-btn:last-child {
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .v-btn:not(:first-child) {
        border-left-width: 0;
    }
}

html.theme--light ._btn-group .v-btn {
    border-color: rgba(0, 0, 0, 0.12) !important;
}

._btn-qs {
    font-size: 0.8rem !important;
    max-height: 24px;
}

._btn-extruder-cmd {
    min-width: 135px !important;
}
</style>
