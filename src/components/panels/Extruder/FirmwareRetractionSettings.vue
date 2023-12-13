<template>
    <div v-if="existsFirmwareRetraction">
        <v-container>
            <responsive
                :breakpoints="{
                    small: (el) => el.width <= 350,
                }">
                <template #default="{ el }">
                    <v-row>
                        <v-col :class="{ 'col-12': el.is.small }">
                            <number-input
                                :label="$t('Panels.ExtruderControlPanel.FirmwareRetractionSettings.RetractLength')"
                                param="RETRACT_LENGTH"
                                :target="retractLength"
                                :default-value="defaultRetractLength"
                                :output-error-msg="true"
                                :has-spinner="true"
                                :spinner-factor="10"
                                :step="0.01"
                                :min="0"
                                :max="null"
                                :dec="2"
                                unit="mm"
                                @submit="sendCmd" />
                        </v-col>
                        <v-col :class="{ 'col-12': el.is.small }">
                            <number-input
                                :label="$t('Panels.ExtruderControlPanel.FirmwareRetractionSettings.RetractSpeed')"
                                param="RETRACT_SPEED"
                                :target="retractSpeed"
                                :default-value="defaultRetractSpeed"
                                :output-error-msg="true"
                                :has-spinner="true"
                                :spinner-factor="5"
                                :step="1"
                                :min="1"
                                :max="null"
                                :dec="0"
                                unit="mm/s"
                                @submit="sendCmd" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col :class="{ 'col-12': el.is.small }">
                            <number-input
                                :label="
                                    $t('Panels.ExtruderControlPanel.FirmwareRetractionSettings.UnretractExtraLength')
                                "
                                param="UNRETRACT_EXTRA_LENGTH"
                                :target="unretractExtraLength"
                                :default-value="defaultUnretractExtraLength"
                                :output-error-msg="true"
                                :has-spinner="true"
                                :spinner-factor="10"
                                :step="0.01"
                                :min="0"
                                :max="null"
                                :dec="2"
                                unit="mm"
                                @submit="sendCmd" />
                        </v-col>
                        <v-col :class="{ 'col-12': el.is.small }">
                            <number-input
                                :label="$t('Panels.ExtruderControlPanel.FirmwareRetractionSettings.UnretractSpeed')"
                                param="UNRETRACT_SPEED"
                                :target="unretractSpeed"
                                :default-value="defaultUnretractSpeed"
                                :output-error-msg="true"
                                :has-spinner="true"
                                :spinner-factor="5"
                                :step="1"
                                :min="1"
                                :max="null"
                                :dec="0"
                                unit="mm/s"
                                @submit="sendCmd" />
                        </v-col>
                    </v-row>
                </template>
            </responsive>
        </v-container>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import NumberInput from '@/components/inputs/NumberInput.vue'
import Responsive from '@/components/ui/Responsive.vue'
import ControlMixin from '@/components/mixins/control'

@Component({
    components: { Panel, NumberInput, Responsive },
})
export default class FirmwareRetractionSettings extends Mixins(BaseMixin, ControlMixin) {
    get retractLength(): number {
        return Math.floor((this.$store.state.printer?.firmware_retraction?.retract_length ?? 0) * 100) / 100
    }

    get retractSpeed(): number {
        return Math.trunc(this.$store.state.printer?.firmware_retraction?.retract_speed ?? 20)
    }

    get unretractExtraLength(): number {
        return Math.floor((this.$store.state.printer?.firmware_retraction?.unretract_extra_length ?? 0) * 100) / 100
    }

    get unretractSpeed(): number {
        return Math.trunc(this.$store.state.printer?.firmware_retraction?.unretract_speed ?? 10)
    }

    get defaultRetractLength(): number {
        return (
            Math.floor(
                (this.$store.state.printer?.configfile?.settings?.firmware_retraction?.retract_length ?? 0) * 100
            ) / 100
        )
    }

    get defaultRetractSpeed(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.firmware_retraction?.retract_speed ?? 20)
    }

    get defaultUnretractExtraLength(): number {
        return (
            Math.floor(
                (this.$store.state.printer?.configfile?.settings?.firmware_retraction?.unretract_extra_length ?? 0) *
                    100
            ) / 100
        )
    }

    get defaultUnretractSpeed(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.firmware_retraction?.unretract_speed ?? 0)
    }

    @Debounce(500)
    sendCmd(params: { name: string; value: number }): void {
        const gcode = `SET_RETRACTION ${params.name}=${params.value}`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
