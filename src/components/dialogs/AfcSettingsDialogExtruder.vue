<template>
    <div>
        <h3 class="text-h5 mb-3 mt-5">{{ title }}</h3>
        <settings-row
            :title="$t('Panels.AfcPanel.SettingsDialog.LoadUnloadLane')"
            :sub-title="$t('Panels.AfcPanel.SettingsDialog.LoadUnloadLaneDescription')">
            <div class="d-flex flex-wrap">
                <v-btn
                    v-for="lane in lanes"
                    :key="lane"
                    :disabled="!filledLanes.includes(lane)"
                    small
                    class="ma-1"
                    :color="lane_loaded === lane ? 'primary' : ''"
                    @click="toggleLane(lane)">
                    {{ lane }}
                </v-btn>
            </div>
        </settings-row>
        <v-divider class="my-3" />
        <settings-row :title="$t('Panels.AfcPanel.SettingsDialog.ToolStn')" :sub-title="toolStnSubTitle">
            <number-input
                label="tool_stn"
                param="TOOL_STN"
                :target="currentToolStn"
                :default-value="settingsToolStn"
                :output-error-msg="true"
                :has-spinner="true"
                :spinner-factor="1"
                :step="1"
                :min="0"
                :max="null"
                :dec="0"
                unit="mm"
                class="w-100"
                @submit="updateToolheadSensors" />
        </settings-row>
        <v-divider class="my-3" />
        <settings-row
            :title="$t('Panels.AfcPanel.SettingsDialog.ToolStnUnload')"
            :sub-title="$t('Panels.AfcPanel.SettingsDialog.ToolStnUnloadDescription')">
            <number-input
                label="tool_stn_unload"
                param="TOOL_STN_UNLOAD"
                :target="currentToolStnUnload"
                :default-value="settingsToolStnUnload"
                :output-error-msg="true"
                :has-spinner="true"
                :spinner-factor="1"
                :step="1"
                :min="0"
                :max="null"
                :dec="0"
                unit="mm"
                class="w-100"
                @submit="updateToolheadSensors" />
        </settings-row>
        <template v-if="existsToolEndSensor">
            <v-divider class="my-3" />
            <settings-row
                :title="$t('Panels.AfcPanel.SettingsDialog.ToolSensorAfterExtruder')"
                :sub-title="$t('Panels.AfcPanel.SettingsDialog.ToolSensorAfterExtruderDescription')">
                <number-input
                    label="tool_sensor_after_extruder"
                    param="TOOL_AFTER_EXTRUDER"
                    :target="currentToolSensorAfterExtruder"
                    :default-value="settingsToolSensorAfterExtruder"
                    :output-error-msg="true"
                    :has-spinner="true"
                    :spinner-factor="1"
                    :step="1"
                    :min="0"
                    :max="null"
                    :dec="0"
                    unit="mm"
                    class="w-100"
                    @submit="updateToolheadSensors" />
            </settings-row>
        </template>
        <v-divider class="my-3" />
        <settings-row
            :title="$t('Panels.AfcPanel.SettingsDialog.SaveExtruderValues')"
            :sub-title="$t('Panels.AfcPanel.SettingsDialog.SaveExtruderValuesDescription')">
            <v-btn :disabled="!enableSaveButton" color="primary" @click="saveExtruderValues">
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
export default class AfcSettingsDialogExtruder extends Mixins(BaseMixin, AfcMixin) {
    @Prop({ type: String, required: true }) readonly name!: string

    changedValue = false

    get title() {
        const name = convertName(this.name)

        return this.$t('Panels.AfcPanel.SettingsDialog.SettingsForTitle', { name })
    }

    get afcSettingsExtruder() {
        return this.getAfcExtruderSettings(this.name)
    }

    get settingsToolStn() {
        return this.afcSettingsExtruder.tool_stn || 0
    }

    get settingsToolStnUnload() {
        return this.afcSettingsExtruder.tool_stn_unload || 0
    }

    get settingsToolSensorAfterExtruder() {
        return this.afcSettingsExtruder.tool_sensor_after_extruder || 0
    }

    get printerObject() {
        return this.getAfcExtruderObject(this.name)
    }

    get currentToolStn() {
        return this.printerObject.tool_stn || 0
    }

    get currentToolStnUnload() {
        return this.printerObject.tool_stn_unload || 0
    }

    get currentToolSensorAfterExtruder() {
        return this.printerObject.tool_sensor_after_extruder || 0
    }

    get lanes() {
        return this.printerObject.lanes ?? []
    }

    get lane_loaded() {
        return this.printerObject.lane_loaded ?? ''
    }

    get filledLanes() {
        const filledLanes = []

        for (const lane of this.lanes) {
            const laneObject = this.getAfcLaneObject(lane)

            if (laneObject?.load && laneObject?.prep) {
                filledLanes.push(lane)
            }
        }

        return filledLanes
    }

    get existsToolEndSensor() {
        return 'pin_tool_end' in this.afcSettingsExtruder
    }

    get toolStnSubTitle() {
        if (this.existsToolEndSensor) {
            return this.$t('Panels.AfcPanel.SettingsDialog.ToolStnDescriptionWithEndSensor')
        }

        if (this.afcSettingsExtruder.pin_tool_start === 'buffer') {
            return this.$t('Panels.AfcPanel.SettingsDialog.ToolStnDescriptionWithRamming')
        }

        return this.$t('Panels.AfcPanel.SettingsDialog.ToolStnDescriptionWithoutEndSensor')
    }

    get enableSaveButton() {
        if (!this.changedValue) return false

        return (
            this.currentToolStn !== this.settingsToolStn ||
            this.currentToolStnUnload !== this.settingsToolStnUnload ||
            this.currentToolSensorAfterExtruder !== this.settingsToolSensorAfterExtruder
        )
    }

    toggleLane(lane: string) {
        if (this.lane_loaded === lane) {
            this.doSend(`TOOL_UNLOAD LANE=${lane}`)

            return
        }

        this.doSend(`CHANGE_TOOL LANE=${lane}`)
    }

    updateToolheadSensors(args: { name: string; value: number }) {
        this.changedValue = true
        this.doSend(`UPDATE_TOOLHEAD_SENSORS EXTRUDER=${this.name} ${args.name}=${args.value}`)
    }

    saveExtruderValues() {
        this.changedValue = false
        const gcode = `SAVE_EXTRUDER_VALUES EXTRUDER=${this.name}`
        this.doSend(gcode)
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
