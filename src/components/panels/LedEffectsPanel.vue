<template>
    <panel
        v-if="klipperReadyForGui && ledEffects.length > 0"
        :icon="mdiLedStrip"
        :title="$t('Panels.LedEffectsPanel.Headline')"
        :collapsible="true"
        card-class="led-effects-panel">
        <!-- Stop All Effects Button in header -->
        <template #buttons>
            <v-tooltip left>
                <template #activator="{ on, attrs }">
                    <v-btn
                        v-bind="attrs"
                        icon
                        tile
                        :loading="loadings.includes('STOP_LED_EFFECTS')"
                        :disabled="printerIsPrintingOnly"
                        v-on="on"
                        @click="stopAllEffects">
                        <v-icon>{{ mdiStop }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t('Panels.LedEffectsPanel.StopAll') }}</span>
            </v-tooltip>
        </template>
        <!-- LED Effect Buttons -->
        <v-card-text class="py-2">
            <v-row>
                <v-col class="text-center">
                    <led-effect-button
                        v-for="(effect, index) in ledEffects"
                        :key="'led_effect_' + index"
                        :effect="effect"
                        color="primary"
                        class="mx-1 my-1" />
                </v-col>
            </v-row>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import LedEffectButton from '@/components/inputs/LedEffectButton.vue'
import { mdiLedStrip, mdiStop } from '@mdi/js'

@Component({
    components: { LedEffectButton, Panel },
})
export default class LedEffectsPanel extends Mixins(BaseMixin) {
    mdiLedStrip = mdiLedStrip
    mdiStop = mdiStop

    get ledEffects() {
        return this.$store.getters['printer/getLedEffects'] ?? []
    }

    /**
     * Stops all LED effects by sending the STOP_LED_EFFECTS command
     */
    stopAllEffects() {
        this.$store.dispatch('server/addEvent', { message: 'STOP_LED_EFFECTS', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'STOP_LED_EFFECTS' }, { loading: 'STOP_LED_EFFECTS' })
    }
}
</script>