<style>

</style>

<template>
    <v-card v-if="displayPanel" class="mb-6">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon class="mdi mdi-arrow-collapse-vertical" left></v-icon>{{ $t("Panels.ZOffsetPanel.ZBabyStepping") }}</span>
            </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="px-0 py-0">
            <v-container>
                <v-row class="py-0">
                    <v-col class="pb-0 text-center">
                        <p class="mb-0">{{ $t("Panels.ZOffsetPanel.CurrentOffset") }}: {{ homing_origin.length > 1 ? homing_origin[2].toFixed(3) : 0.000 }}mm</p>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="col text-center d-flex flex-column align-center flex-sm-row justify-center">
                        <v-btn-toggle dense no-gutters class="mx-2 mt-3 mt-sm-0 order-last flex-nowrap order-sm-first" >
                            <v-btn small @click="sendBabySteppingDownFine()" class="" :loading="loadings.includes('babySteppingDownFine')" ><v-icon small class="mr-2">mdi-arrow-collapse-down</v-icon> -0.01mm</v-btn>
                            <v-btn small @click="sendBabySteppingDown()" class="" :loading="loadings.includes('babySteppingDown')" >-0.05mm</v-btn>
                        </v-btn-toggle>
                        <v-btn-toggle dense no-gutters class="mx-2 order-first flex-nowrap order-sm-last" >
                            <v-btn small @click="sendBabySteppingUpFine()" class="" :loading="loadings.includes('babySteppingUpFine')" ><v-icon small class="mr-2">mdi-arrow-expand-up</v-icon> +0.01mm</v-btn>
                            <v-btn small @click="sendBabySteppingUp()" class="" :loading="loadings.includes('babySteppingUp')" >+0.05mm</v-btn>
                        </v-btn-toggle>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">

import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "../mixins/base";

@Component
export default class ZOffsetPanel extends Mixins(BaseMixin) {

    get displayPanel() {
        return (['printing', 'paused'].includes(this.printer_state)) || (this.displayZOffsetStandby && ['standby', 'complete', 'cancelled'].includes(this.printer_state))
    }

    get displayZOffsetStandby() {
        return this.$store.state.gui.general.displayZOffsetStandby ?? false
    }

    get homing_origin() {
        return this.$store.state.printer?.gcode_move?.homing_origin ?? []
    }

    get homed_axis() {
        return this.$store.state.printer.toolhead.homed_axes ?? ""
    }

    sendBabySteppingDownFine() {
        const gcode = "SET_GCODE_OFFSET Z_ADJUST=-0.01"+(this.homed_axis === "xyz" ? " MOVE=1" : "");
        this.$store.commit('socket/addLoading', { name: 'babySteppingDownFine' });
        this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
        this.$socket.emit('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'babySteppingDownFine' });
    }

    sendBabySteppingDown() {
        const gcode = "SET_GCODE_OFFSET Z_ADJUST=-0.05"+(this.homed_axis === "xyz" ? " MOVE=1" : "")
        this.$store.commit('socket/addLoading', { name: 'babySteppingDown' })
        this.$store.commit('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'babySteppingDown' })
    }

    sendBabySteppingUpFine() {
        const gcode = "SET_GCODE_OFFSET Z_ADJUST=0.01"+(this.homed_axis === "xyz" ? " MOVE=1" : "")
        this.$store.commit('socket/addLoading', { name: 'babySteppingUpFine' })
        this.$store.commit('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'babySteppingUpFine' })
    }

    sendBabySteppingUp() {
        const gcode = "SET_GCODE_OFFSET Z_ADJUST=0.05"+(this.homed_axis === "xyz" ? " MOVE=1" : "")
        this.$store.commit('socket/addLoading', { name: 'babySteppingUp' })
        this.$store.commit('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'babySteppingUp' })
    }
}
</script>