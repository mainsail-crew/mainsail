<style lang="scss" scoped>
.btnHomeAxis {
    width: 36px;
    min-width: 36px !important;
}

.btnMinWidthAuto {
    min-width: auto !important;
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
    <div class="mt-6">
        <v-row>
            <v-col class="pa-0">
                <v-divider></v-divider>
            </v-col>
        </v-row>
        <v-row class="">
            <v-col class="col col-md-6 pt-2">
                <span class="text--disabled" style="font-size: 0.9em">
                    {{ $t('Panels.ControlPanel.FeedAmountIn') }} [mm]
                </span>
                <v-btn-toggle class="mt-1" dense no-gutters style="flex-wrap: nowrap; width: 100%">
                    <v-btn
                        v-for="amount in feedamountsSorted"
                        :key="amount"
                        dense
                        :class="
                            (amount === currentFeedAmount ? 'v-btn--active' : '') +
                            ' btnMinWidthAuto flex-grow-1 px-0 _btnFeedrate'
                        "
                        @click="setFeedAmount(amount)">
                        {{ amount }}
                    </v-btn>
                </v-btn-toggle>
            </v-col>
            <v-col class="col col-md-6 pt-2">
                <span class="text--disabled" style="font-size: 0.9em">
                    {{ $t('Panels.ControlPanel.FeedrateIn') }} [mm/s]
                </span>
                <v-btn-toggle class="mt-1" dense no-gutters style="flex-wrap: nowrap; width: 100%">
                    <v-tooltip v-for="rate in feedratesSorted" :key="rate" top color="panel">
                        <template #activator="{ on, attrs }">
                            <v-btn
                                v-bind="attrs"
                                dense
                                :class="
                                    (rate === currentFeedRate ? 'v-btn--active' : '') +
                                    ' btnMinWidthAuto flex-grow-1 px-0 _btnFeedrate'
                                "
                                v-on="on"
                                @click="setFeedrate(rate)">
                                {{ rate }}
                            </v-btn>
                        </template>
                        <span v-if="filamentDiameter">
                            {{ Math.round(Math.pow(filamentDiameter / 2, 2) * Math.PI * rate * 10) / 10 }} mm&sup3;/s
                        </span>
                    </v-tooltip>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="">
            <v-col class="col text-center pt-0">
                <v-tooltip top :disabled="boolExtrudePossible" color="panel">
                    <template #activator="{ on }">
                        <div class="d-inline-block" v-on="on">
                            <v-btn
                                small
                                class="mx-3"
                                :loading="loadings.includes('btnRetract')"
                                :disabled="!boolExtrudePossible"
                                @click="sendRetract()">
                                <v-icon small class="mr-1">{{ mdiArrowUpBold }}</v-icon>
                                {{ $t('Panels.ControlPanel.Retract') }}
                            </v-btn>
                        </div>
                    </template>
                    <span>{{ $t('Panels.ControlPanel.HotendTooCold') }} {{ minExtrudeTemp }} °C</span>
                </v-tooltip>
                <v-tooltip top :disabled="boolExtrudePossible" color="panel">
                    <template #activator="{ on }">
                        <div class="d-inline-block" v-on="on">
                            <v-btn
                                small
                                class="mx-3"
                                :loading="loadings.includes('btnDetract')"
                                :disabled="!boolExtrudePossible"
                                @click="sendDetract()">
                                <v-icon small class="mr-1">{{ mdiArrowDownBold }}</v-icon>
                                {{ $t('Panels.ControlPanel.Extrude') }}
                            </v-btn>
                        </div>
                    </template>
                    <span>{{ $t('Panels.ControlPanel.HotendTooCold') }} {{ minExtrudeTemp }} °C</span>
                </v-tooltip>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { mdiArrowDownBold, mdiArrowUpBold } from '@mdi/js'
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'

@Component
export default class ControlPanelExtruder extends Mixins(BaseMixin) {
    mdiArrowUpBold = mdiArrowUpBold
    mdiArrowDownBold = mdiArrowDownBold

    get filamentDiameter() {
        return this.$store.state.printer.configfile?.settings?.extruder?.filament_diameter ?? 1.75
    }

    get feedamounts() {
        return this.$store.state.gui.control.extruder?.feedamounts ?? []
    }

    get feedrates() {
        return this.$store.state.gui.control.extruder?.feedrates ?? []
    }

    get feedamountsSorted() {
        return [...this.feedamounts].sort((a, b) => {
            return b - a
        })
    }

    get feedratesSorted() {
        return [...this.feedrates].sort((a, b) => {
            return b - a
        })
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

    setFeedAmount(value: number) {
        this.currentFeedAmount = value
    }

    setFeedrate(value: number) {
        this.currentFeedRate = value
    }

    sendRetract() {
        const gcode = 'M83\nG1 E-' + this.currentFeedAmount + ' F' + this.currentFeedRate * 60
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'btnRetract' })
    }

    sendDetract() {
        const gcode = 'M83\nG1 E' + this.currentFeedAmount + ' F' + this.currentFeedRate * 60
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'btnDetract' })
    }
}
</script>
