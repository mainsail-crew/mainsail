<template>
    <div>
        <h3 class="text-h5 mb-3 mt-5">{{ title }}</h3>

        <settings-row
            :title="$t('Panels.AfcPanel.SettingsDialog.DistHub')"
            :sub-title="$t('Panels.AfcPanel.SettingsDialog.DistHubDescription')">
            <number-input
                label="dist_hub"
                param="LENGTH"
                :target="currentDistHub"
                :default-value="settingsDistHub"
                :output-error-msg="true"
                :has-spinner="true"
                :spinner-factor="1"
                :step="1"
                :min="0"
                :max="null"
                :dec="0"
                unit="mm"
                class="w-100"
                @submit="setHubDist" />
        </settings-row>
        <v-divider class="my-3" />
        <settings-row
            :title="$t('Panels.AfcPanel.SettingsDialog.SaveHubDist')"
            :sub-title="$t('Panels.AfcPanel.SettingsDialog.SaveHubDistDescription')">
            <v-btn :disabled="!enableSaveButton" color="primary" @click="saveHubDist">
                {{ $t('Panels.AfcPanel.SettingsDialog.WriteToFile') }}
            </v-btn>
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
export default class AfcSettingsDialogLane extends Mixins(BaseMixin, AfcMixin) {
    @Prop({ type: String, required: true }) readonly name!: string

    changedValue = false

    get title() {
        const name = convertName(this.name)

        return this.$t('Panels.AfcPanel.SettingsDialog.SettingsForTitle', { name })
    }

    get afcSettingsLane() {
        return this.getAfcLaneSettings(this.name)
    }

    get afcLane() {
        return this.getAfcLaneObject(this.name)
    }

    get settingsDistHub() {
        return this.afcSettingsLane.dist_hub || 0
    }

    get currentDistHub() {
        return this.afcLane.dist_hub || 0
    }

    get enableSaveButton() {
        if (!this.changedValue) return false

        return this.currentDistHub !== this.settingsDistHub
    }

    setHubDist(args: { name: string; value: number }) {
        this.changedValue = true
        this.doSend(`SET_HUB_DIST LANE=${this.name} ${args.name}=${args.value}`)
    }

    saveHubDist() {
        this.changedValue = false
        const gcode = `SAVE_HUB_DIST LANE=${this.name}`
        this.doSend(gcode)
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
