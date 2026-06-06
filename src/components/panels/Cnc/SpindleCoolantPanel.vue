<template>
    <panel v-if="klipperReadyForGui" :icon="mdiFan" title="Spindle & Coolant" :collapsible="true" card-class="spindle-coolant-panel">
        <v-container class="py-2">
            <!-- Spindle Control -->
            <v-row dense class="mb-3">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Spindle Control:</span>
                </v-col>
                <v-col cols="4">
                    <v-btn small block color="success" @click="setSpindleOn">
                        <v-icon left>{{ mdiPlay }}</v-icon>
                        ON
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn small block color="error" @click="setSpindleOff">
                        <v-icon left>{{ mdiStop }}</v-icon>
                        OFF
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn small block color="info" @click="setSpindleCcwl">
                        <v-icon left>{{ mdiRotate3dVariant }}</v-icon>
                        CCW
                    </v-btn>
                </v-col>
            </v-row>

            <v-row dense class="mb-3">
                <v-col cols="8">
                    <v-text-field
                        v-model.number="spindleSpeedInput"
                        label="Spindle Speed (RPM)"
                        type="number"
                        dense
                        outlined
                        hide-details
                        :min="0"
                        :max="24000"
                    ></v-text-field>
                </v-col>
                <v-col cols="4">
                    <v-btn small block color="primary" :disabled="!spindleSpeedInput" @click="setSpindleSpeed">
                        SET
                    </v-btn>
                </v-col>
            </v-row>

            <v-divider class="my-3"></v-divider>

            <!-- Coolant Control -->
            <v-row dense class="mb-3">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Coolant Control:</span>
                </v-col>
                <v-col cols="6">
                    <v-btn small block color="success" @click="setCoolantFloodOn">
                        <v-icon left>{{ mdiWater }}</v-icon>
                        Flood ON
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn small block color="error" @click="setCoolantFloodOff">
                        <v-icon left>{{ mdiStop }}</v-icon>
                        Flood OFF
                    </v-btn>
                </v-col>
            </v-row>
             <v-row dense class="mb-3">
                <v-col cols="6">
                    <v-btn small block color="success" @click="setCoolantMistOn">
                        <v-icon left>{{ mdiSpray }}</v-icon>
                        Mist ON
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn small block color="error" @click="setCoolantMistOff">
                        <v-icon left>{{ mdiStop }}</v-icon>
                        Mist OFF
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { mdiFan, mdiPlay, mdiStop, mdiRotate3dVariant, mdiWater, mdiSpray } from '@mdi/js'

@Component({
    components: {
        Panel,
    },
})
export default class SpindleCoolantPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiFan = mdiFan
    mdiPlay = mdiPlay
    mdiStop = mdiStop
    mdiRotate3dVariant = mdiRotate3dVariant
    mdiWater = mdiWater
    mdiSpray = mdiSpray

    spindleSpeedInput: number | null = null

    // Spindle control methods
    setSpindleOn() {
        this.doSend(`M3 S${this.spindleSpeedInput || 0}`) // Default to 0 RPM if not set
    }

    setSpindleOff() {
        this.doSend('M5')
    }

    setSpindleCwl() {
        this.doSend(`M3 S${this.spindleSpeedInput || 0}`) // M3 is Clockwise
    }

    setSpindleCcwl() {
        this.doSend(`M4 S${this.spindleSpeedInput || 0}`) // M4 is Counter-Clockwise
    }

    setSpindleSpeed() {
        if (this.spindleSpeedInput !== null) {
            this.doSend(`S${this.spindleSpeedInput}`)
        }
    }

    // Coolant control methods
    setCoolantFloodOn() {
        this.doSend('M8')
    }

    setCoolantFloodOff() {
        this.doSend('M9')
    }

    setCoolantMistOn() {
        this.doSend('M7')
    }

    setCoolantMistOff() {
        this.doSend('M9')
    }
}
</script>

<style scoped>
/* Add any specific styles for the SpindleCoolant Panel here */
</style>
