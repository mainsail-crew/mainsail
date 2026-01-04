<template>
    <panel
        v-if="showPanel"
        :icon="mdiLedStrip"
        :title="$t('Panels.LedEffectsPanel.Headline')"
        :collapsible="true"
        card-class="led-effects-panel">
        <template #buttons>
            <v-tooltip left>
                <template #activator="{ on, attrs }">
                    <v-btn
                        v-bind="attrs"
                        icon
                        tile
                        :loading="isLoadingAllEffects"
                        :disabled="printerIsPrintingOnly"
                        v-on="on"
                        @click="stopAllEffects">
                        <v-icon>{{ mdiStop }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t('Panels.LedEffectsPanel.StopAll') }}</span>
            </v-tooltip>
        </template>
        <v-card-text class="py-2">
            <v-row>
                <v-col class="text-center">
                    <led-effect-button
                        v-for="name in ledEffects"
                        :key="'led_effect_' + name"
                        :name="name"
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

const STOP_LED_EFFECTS_COMMAND = 'STOP_LED_EFFECTS'

@Component({
    components: { LedEffectButton, Panel },
})
export default class LedEffectsPanel extends Mixins(BaseMixin) {
    mdiLedStrip = mdiLedStrip
    mdiStop = mdiStop

    get showPanel() {
        return this.klipperReadyForGui && this.ledEffects.length > 0
    }

    get ledEffects() {
        const prefix = 'led_effect '
        const prefixLength = prefix.length

        return Object.keys(this.$store.state.printer)
            .filter((prop) => prop.toLowerCase().startsWith(prefix))
            .map((prop) => prop.slice(prefixLength))
            .filter((name) => !name.startsWith('_'))
            .sort((a, b) => a.localeCompare(b))
    }

    get isLoadingAllEffects() {
        return this.loadings.includes(STOP_LED_EFFECTS_COMMAND)
    }

    stopAllEffects() {
        this.$store.dispatch('server/addEvent', { message: STOP_LED_EFFECTS_COMMAND, type: 'command' })
        this.$socket.emit(
            'printer.gcode.script',
            { script: STOP_LED_EFFECTS_COMMAND },
            { loading: STOP_LED_EFFECTS_COMMAND }
        )
    }
}
</script>
