<template>
    <div>
        <h3 class="text-h5 mb-3">{{ title }}</h3>
        <settings-row
            :title="$t('Panels.AfcPanel.SettingsDialog.BowdenLength')"
            :sub-title="$t('Panels.AfcPanel.SettingsDialog.BowdenLengthDescription')">
            <number-input
                label="afc_bowden_length"
                param="LENGTH"
                :target="currentLength"
                :default-value="settingsLength"
                :output-error-msg="true"
                :has-spinner="true"
                :spinner-factor="1"
                :step="1"
                :min="0"
                :max="null"
                :dec="0"
                unit="mm"
                class="w-100"
                @submit="setBowdenLength" />
        </settings-row>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import AfcMixin from '@/components/mixins/afc'
import { convertName } from '@/plugins/helpers'

@Component({
    components: { Panel },
})
export default class AfcSettingsDialogHub extends Mixins(BaseMixin, AfcMixin) {
    @Prop({ type: String, required: true }) readonly name!: string

    get title() {
        const name = convertName(`Hub ${this.name}`)

        return this.$t('Panels.AfcPanel.SettingsDialog.SettingsForTitle', { name })
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    get afcSettingsHub() {
        const settings = this.$store.state.printer.configfile?.settings ?? {}
        const name = `AFC_hub ${this.name}`.toLowerCase()

        return settings[name] || {}
    }

    get settingsLength() {
        return this.afcSettingsHub.afc_bowden_length || 0
    }

    get printerObject() {
        const printer = this.$store.state.printer ?? {}
        const key = `AFC_hub ${this.name}`

        return printer[key] ?? {}
    }

    get currentLength() {
        return this.printerObject.afc_bowden_length || 0
    }

    setBowdenLength(args: { name: string; value: number }) {
        const gcode = `SET_BOWDEN_LENGTH HUB=${this.name} ${args.name}=${args.value}`
        this.doSend(gcode)
    }
}
</script>
