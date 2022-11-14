<template>
    <div class="d-flex align-center">
        <form @submit.prevent="setTemps">
            <v-text-field
                v-model="value"
                suffix="°C"
                type="number"
                dense
                outlined
                hide-details
                hide-spin-buttons
                class="_temp-input pr-1"
                @blur="value = target"
                @focus="$event.target.select()"></v-text-field>
        </form>
        <v-menu v-if="presets" :offset-y="true" left title="Preheat">
            <template #activator="{ on, attrs }">
                <v-btn
                    :disabled="['printing', 'paused'].includes(printer_state)"
                    tabindex="-1"
                    x-small
                    plain
                    v-bind="attrs"
                    class="pa-0"
                    style="min-width: 24px"
                    v-on="on">
                    <v-icon>{{ mdiMenuDown }}</v-icon>
                </v-btn>
            </template>
            <v-list dense class="py-0">
                <v-list-item
                    v-for="preset of presets"
                    :key="preset.index"
                    link
                    style="min-height: 32px"
                    @click="doSend(`${command} ${attributeName}=${name} TARGET=${preset.value}`)">
                    <div class="_preset">
                        <v-icon v-if="preset.value === 0" else color="primary" small class="_preset-icon">
                            {{ mdiSnowflake }}
                        </v-icon>
                        <v-icon v-else small class="_preset-icon">{{ mdiFire }}</v-icon>
                        <span style="padding-top: 2px">{{ preset.value }}°C</span>
                    </div>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { mdiSnowflake, mdiFire, mdiMenuDown } from '@mdi/js'

@Component
export default class TemperatureInput extends Mixins(BaseMixin, ControlMixin) {
    mdiSnowflake = mdiSnowflake
    mdiFire = mdiFire
    mdiMenuDown = mdiMenuDown

    private value: any = 0

    @Prop({ type: String, required: true }) declare readonly name: string
    @Prop({ type: Number, required: true, default: 0 }) declare readonly target: number
    @Prop({ type: Number, required: true }) declare readonly min_temp: number
    @Prop({ type: Number, required: true }) declare readonly max_temp: number
    @Prop({ type: String, required: true }) declare readonly command: string
    @Prop({ type: String, required: true }) declare readonly attributeName: string
    @Prop({ type: Array, default: [] }) declare presets: number[]

    setTemps(): void {
        if (typeof this.value === 'object') this.value = this.value.value ?? 0
        if (this.value === null) this.value = 0

        if (this.value > this.max_temp) {
            this.value = { value: this.target, text: this.target }
            this.$toast.error(
                this.$t('Panels.TemperaturePanel.TempTooHigh', { name: this.name, max: this.max_temp }) + ''
            )
        } else if (this.value < this.min_temp && this.value != 0) {
            this.value = { value: this.target, text: this.target }
            this.$toast.error(
                this.$t('Panels.TemperaturePanel.TempTooLow', { name: this.name, min: this.min_temp }) + ''
            )
        } else if (this.target !== parseFloat(this.value)) {
            const gcode = this.command + ' ' + this.attributeName + '=' + this.name + ' TARGET=' + this.value
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        }
    }

    mounted() {
        this.value = this.target
    }

    @Watch('target')
    targetChanged(newVal: number): void {
        this.value = newVal
    }
}
</script>

<style scoped>
._temp-input {
    min-width: 4.2rem;
    max-width: 5rem;
}

._temp-input >>> .v-input__slot {
    min-height: 1rem !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
}

._temp-input >>> .v-text-field__slot input {
    padding-top: 4px;
    padding-bottom: 4px;
}

._preset {
    font-size: 0.875rem;
}

._preset-icon {
    margin-top: -1px;
    margin-right: 4px;
}
</style>
