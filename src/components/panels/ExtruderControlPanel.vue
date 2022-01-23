<style lang="scss" scoped>
._button-group {
    border-radius: 4px;
    display: inline-flex;
    margin-top: 14px;
    max-width: 100%;
}

._button-group > .v-btn {
    border-radius: 0;
    border-color: rgba(255, 255, 255, 0.12);
    border-style: solid;
    border-width: thin;
    box-shadow: none;
    height: 30px;
    opacity: 0.8;
    padding: 0 12px;
    min-width: auto !important;
}

._button-group > .v-btn:first-child {
    border-top-left-radius: inherit;
    border-bottom-left-radius: inherit;
}

._button-group > .v-btn:last-child {
    border-top-right-radius: inherit;
    border-bottom-right-radius: inherit;
}

._button-group > .v-btn:not(:first-child) {
  border-left-width: 0;
}

._spin_button_group {
        width: 24px;
        margin: -6px -6px 0 -6px;
    }

.btnHomeAxis {
    width: 36px;
    min-width: 36px !important;
}

.steps {
    width: 100%;
    > div {
        width: 100%;
        display: flex;
        > button {
            flex-grow: 1;
        }
    }
}
</style>

<template>
    <panel
        v-if="klipperReadyForGui && all_extruders.length > 0"
        icon="mdi-printer-3d-nozzle"
        :title="'Extruder Controls'"
        :collapsible="true"
        card-class="extruder-control-panel"
    >
        <v-container>
            <v-row class="pt-2" v-if="this.all_extruders.length > 1">
                <v-col>
                    <div class="d-flex align-center pb-4">
                        <v-select
                            v-model="selectedExtruder"
                            :label="'Extruder'"
                            :items="all_extruders"
                            :value="active_extruder"
                            hide-details
                            outlined
                            dense
                        ></v-select>
                    </div>
                    <v-divider></v-divider>
                </v-col>
            </v-row>

            <v-row>
                <v-col class="col col-md-6 pt-2">
                    <v-text-field
                        v-model="currentFeedAmount"
                        label="Feed Length"
                        suffix="mm"
                        type="number"
                        hide-spin-buttons
                        hide-details
                        outlined
                        dense
                    >
                        <template v-slot:append-outer>
                            <div class="_spin_button_group">
                                <v-btn
                                    class="mt-n3"
                                    icon plain small
                                >
                                    <v-icon>mdi-chevron-up</v-icon>
                                </v-btn>
                                <v-btn
                                    class="mb-n3"
                                    icon plain small
                                >
                                    <v-icon>mdi-chevron-down</v-icon>
                                </v-btn>
                            </div>
                        </template>
                    </v-text-field>
                    <v-item-group class="_button-group" style="flex-wrap: nowrap; width: 100%;" >
                        <v-btn
                            v-for="amount in feedamountsSorted"
                            @click="currentFeedAmount = amount"
                            :key="amount"
                            dense
                            class="flex-grow-1 px-0"
                        >
                            {{ amount }}
                        </v-btn>
                    </v-item-group>
                </v-col>
                <v-col class="col col-md-6 pt-2">
                    <v-text-field
                        v-model="currentFeedRate"
                        label="Extrusion Feedrate"
                        suffix="mm/s"
                        type="number"
                        hide-spin-buttons
                        hide-details
                        outlined
                        dense
                    >
                        <template v-slot:append-outer>
                            <div class="_spin_button_group">
                                <v-btn
                                    class="mt-n3"
                                    icon plain small
                                >
                                    <v-icon>mdi-chevron-up</v-icon>
                                </v-btn>
                                <v-btn
                                    class="mb-n3"
                                    icon plain small
                                >
                                    <v-icon>mdi-chevron-down</v-icon>
                                </v-btn>
                            </div>
                        </template>
                    </v-text-field>
                    <v-item-group class="_button-group" style="flex-wrap: nowrap; width: 100%;" >
                        <v-btn
                            v-for="rate in feedratesSorted"
                            :key="rate"
                            @click="currentFeedRate = rate"
                            dense
                            class="flex-grow-1 px-0"
                        >
                            {{ rate }}
                        </v-btn>
                    </v-item-group>
                </v-col>
            </v-row>

            <v-row class="mt-n4 mb-1" style="height: 24px;">
                <v-col class="text--disabled text-center">
                    <span v-if="filamentDiameter && nozzleDiameter" style="font-size: .9em;">
                        Expected extrusion: ~ {{ Math.round(currentFeedAmount * (filamentDiameter / nozzleDiameter)) }} mm @ {{ Math.round(Math.pow(filamentDiameter / 2, 2) * Math.PI * currentFeedRate * 10) / 10 }} mm&sup3;/s
                    </span>
                </v-col>
            </v-row>

            <v-row>
                <v-col class="col text-center">
                    <v-tooltip top :disabled="boolExtrudePossible" color="panel">
                        <template v-slot:activator="{ on }">
                            <div v-on="on" class="d-inline-block">
                                <v-btn
                                    :loading="loadings.includes('btnRetract')"
                                    :disabled="!boolExtrudePossible"
                                    @click="sendRetract()"
                                    class="mx-3"
                                    small
                                >
                                    <v-icon small class="mr-1">mdi-arrow-up-bold</v-icon> {{ $t('Panels.ControlPanel.Retract') }}
                                </v-btn>
                            </div>
                        </template>
                        <span>
                            {{ $t("Panels.ControlPanel.HotendTooCold") }} {{ minExtrudeTemp }} °C
                        </span>
                    </v-tooltip>
                    <v-tooltip top :disabled="boolExtrudePossible" color="panel">
                        <template v-slot:activator="{ on }">
                            <div v-on="on" class="d-inline-block">
                                <v-btn
                                    :loading="loadings.includes('btnDetract')"
                                    :disabled="!boolExtrudePossible"
                                    @click="sendExtrude()"
                                    class="mx-3"
                                    small
                                >
                                    <v-icon small class="mr-1">mdi-arrow-down-bold</v-icon> {{ $t('Panels.ControlPanel.Extrude') }}
                                </v-btn>
                            </div>
                        </template>
                        <span>
                            {{ $t("Panels.ControlPanel.HotendTooCold") }} {{ minExtrudeTemp }} °C
                        </span>
                    </v-tooltip>
                </v-col>
            </v-row>
        </v-container>
    </panel>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'

@Component({components: {Panel}})
export default class ExtruderControlPanel extends Mixins(BaseMixin) {
    private extruders: string[] = []
    private selectedExtruder = ''

    resetToActiveExtruder(): void {
        this.selectedExtruder = this.$store.state.printer.toolhead?.extruder
    }

    get all_extruders(): string[] {
        Object.keys(this.$store.state.printer).forEach((e) => {
            if (e.startsWith('extruder') && !this.extruders.includes(e)) this.extruders.push(e)
        })
        this.extruders.length === 1 ? this.resetToActiveExtruder() : {}

        return this.extruders
    }

    get active_extruder(): string {
        this.resetToActiveExtruder()
        return this.$store.state.printer.toolhead?.extruder
    }

    get filamentDiameter() {
        return this.$store.state.printer.configfile?.settings?.[this.selectedExtruder]?.filament_diameter ?? 1.75
    }

    get nozzleDiameter() {
        return this.$store.state.printer.configfile?.settings?.[this.selectedExtruder]?.nozzle_diameter ?? 0.4
    }

    get feedamounts() {
        return this.$store.state.gui.control.extruder?.feedamounts ?? []
    }

    get feedrates() {
        return this.$store.state.gui.control.extruder?.feedrates ?? []
    }

    get feedamountsSorted() {
        return [...this.feedamounts].sort((a,b) => { return b-a })
    }

    get feedratesSorted () {
        return [...this.feedrates].sort((a,b) => { return b-a })
    }

    get currentFeedAmount() {
        return parseFloat(this.$store.state.gui.control.extruder.feedamount)
    }

    set currentFeedAmount(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedamount', value: newVal })
    }

    get currentFeedRate() {
        return parseFloat(this.$store.state.gui.control.extruder.feedrate)
    }

    set currentFeedRate(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedrate', value: newVal })
    }

    get boolExtrudePossible() {
        return this.$store.getters['printer/getExtrudePossible']
    }

    get minExtrudeTemp() {
        return this.$store.state.printer.configfile.settings.extruder.min_extrude_temp
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    sendRetract() {
        const gcode = 'M83\nG1 E-'+this.currentFeedAmount+' F'+(this.currentFeedRate * 60)
        console.log(gcode)
        //this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        //this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'btnRetract' })
    }

    sendExtrude() {
        const gcode = 'M83\nG1 E'+this.currentFeedAmount+' F'+(this.currentFeedRate * 60)
        console.log(gcode)
        //this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        //this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'btnDetract' })
    }
}
</script>
