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
import { setCncCoolant, setCncSpindle } from '@/store/files/cncApi'

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

    async setSpindleOn() {
        await this.sendSpindle('cw')
    }

    async setSpindleOff() {
        await this.sendSpindle('off')
    }

    async setSpindleCwl() {
        await this.sendSpindle('cw')
    }

    async setSpindleCcwl() {
        await this.sendSpindle('ccw')
    }

    async setSpindleSpeed() {
        if (this.spindleSpeedInput !== null) {
            await this.sendSpindle(this.spindleSpeedInput > 0 ? 'cw' : 'off')
        }
    }

    async sendSpindle(state: 'off' | 'cw' | 'ccw') {
        const rpm = this.spindleSpeedInput ?? 0

        try {
            await setCncSpindle(this.$store.getters['socket/getUrl'], {
                state,
                rpm,
            })
            this.$store.dispatch('server/addEvent', {
                message: `CNC spindle ${state}${state === 'off' ? '' : ` ${rpm}`}`,
                type: 'command',
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update spindle'
            this.$toast.error(message)
        }
    }

    // Coolant control methods
    async setCoolantFloodOn() {
        await this.sendCoolant({ flood: true, mist: false })
    }

    async setCoolantFloodOff() {
        await this.sendCoolant({ flood: false, mist: false })
    }

    async setCoolantMistOn() {
        await this.sendCoolant({ flood: false, mist: true })
    }

    async setCoolantMistOff() {
        await this.sendCoolant({ flood: false, mist: false })
    }

    async sendCoolant(payload: { flood?: boolean; mist?: boolean }) {
        try {
            await setCncCoolant(this.$store.getters['socket/getUrl'], payload)
            const active = payload.flood ? 'flood on' : payload.mist ? 'mist on' : 'off'
            this.$store.dispatch('server/addEvent', {
                message: `CNC coolant ${active}`,
                type: 'command',
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update coolant'
            this.$toast.error(message)
        }
    }
}
</script>

<style scoped>
/* Add any specific styles for the SpindleCoolant Panel here */
</style>
