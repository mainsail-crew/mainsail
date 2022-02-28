<template>
    <v-card-text>
        <v-row>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.RetractLength').toString()"
                    param="retractLength"
                    :target="current_retract_length"
                    :default-value="config_retract_length"
                    :output-error-msg="true"
                    :has-spinner="true"
                    :spinner-factor="10"
                    :step="0.01"
                    :min="0"
                    :max="null"
                    :dec="2"
                    unit="mm"
                    @submit="sendCmd"
                    @target-changed="updateValue"></number-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.RetractSpeed').toString()"
                    param="retractSpeed"
                    :target="current_retract_speed"
                    :default-value="config_retract_speed"
                    :output-error-msg="true"
                    :has-spinner="true"
                    :spinner-factor="5"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s"
                    @submit="sendCmd"
                    @target-changed="updateValue"></number-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="
                        $t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.UnretractExtraLength').toString()
                    "
                    param="unretractExtraLength"
                    :target="current_unretract_extra_length"
                    :default-value="config_unretract_extra_length"
                    :output-error-msg="true"
                    :has-spinner="true"
                    :spinner-factor="10"
                    :step="0.01"
                    :min="0"
                    :max="null"
                    :dec="2"
                    unit="mm"
                    @submit="sendCmd"
                    @target-changed="updateValue"></number-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.UnretractSpeed').toString()"
                    param="unretractSpeed"
                    :target="current_unretract_speed"
                    :default-value="config_unretract_speed"
                    :output-error-msg="true"
                    :has-spinner="true"
                    :spinner-factor="5"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s"
                    @submit="sendCmd"
                    @target-changed="updateValue"></number-input>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import NumberInput from '@/components/inputs/NumberInput.vue'

@Component({
    components: { Panel, NumberInput },
})
export default class FirmwareRetractionSettings extends Mixins(BaseMixin) {
    private declare retractLength: number
    private declare retractSpeed: number
    private declare unretractExtraLength: number
    private declare unretractSpeed: number

    get current_retract_length(): number {
        this.retractLength =
            Math.floor((this.$store.state.printer?.firmware_retraction?.retract_length ?? 0) * 100) / 100
        return this.retractLength
    }

    get current_retract_speed(): number {
        this.retractSpeed = Math.trunc(this.$store.state.printer?.firmware_retraction?.retract_speed ?? 20)
        return this.retractSpeed
    }

    get current_unretract_extra_length(): number {
        this.unretractExtraLength =
            Math.floor((this.$store.state.printer?.firmware_retraction?.unretract_extra_length ?? 0) * 100) / 100
        return this.unretractExtraLength
    }

    get current_unretract_speed(): number {
        this.unretractSpeed = Math.trunc(this.$store.state.printer?.firmware_retraction?.unretract_speed ?? 10)
        return this.unretractSpeed
    }

    get config_retract_length(): number {
        return (
            Math.floor(
                (this.$store.state.printer?.configfile?.settings?.firmware_retraction?.retract_length ?? 0) * 100
            ) / 100
        )
    }

    get config_retract_speed(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.firmware_retraction?.retract_speed ?? 20)
    }

    get config_unretract_extra_length(): number {
        return (
            Math.floor(
                (this.$store.state.printer?.configfile?.settings?.firmware_retraction?.unretract_extra_length ?? 0) *
                    100
            ) / 100
        )
    }

    get config_unretract_speed(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.firmware_retraction?.unretract_speed ?? 0)
    }

    updateValue(param: string, newVal: number) {
        const params = ['retractLength', 'retractSpeed', 'unretractExtraLength', 'unretractSpeed']
        if (!params.includes(param)) return

        switch (param) {
            case 'retractLength':
                this.retractLength = newVal
                break
            case 'retractSpeed':
                this.retractSpeed = newVal
                break
            case 'unretractExtraLength':
                this.unretractExtraLength = newVal
                break
            case 'unretractSpeed':
                this.unretractSpeed = newVal
                break
        }
    }

    @Debounce(500)
    sendCmd(): void {
        let gcode = `SET_RETRACTION`
        gcode += ` RETRACT_LENGTH=${this.retractLength}`
        gcode += ` RETRACT_SPEED=${this.retractSpeed}`
        gcode += ` UNRETRACT_EXTRA_LENGTH=${this.unretractExtraLength}`
        gcode += ` UNRETRACT_SPEED=${this.unretractSpeed}`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
