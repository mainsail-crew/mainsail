<style scoped></style>

<template>
    <div>
        <v-dialog v-model="showDialog" width="400" persistent :fullscreen="isMobile">
            <panel
                :title="$t('Panels.StatusPanel.PauseAtLayer.PauseAtLayer').toString()"
                :icon="mdiLayersPlus"
                card-class="pause-at-layer-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="hideDialog">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row v-if="type === 'atLayer' && macroSettingsPauseAtLayerEnable">
                        <v-col>
                            <v-alert text type="warning" border="left">
                                {{
                                    $t('Panels.StatusPanel.PauseAtLayer.DescriptionPauseAtLayerActive', {
                                        layer: macroSettingsPauseAtLayerLayer,
                                        call: macroSettingsPauseAtLayerCall,
                                    })
                                }}
                            </v-alert>
                        </v-col>
                    </v-row>
                    <v-row v-if="type === 'nextLayer' && macroSettingsPauseNextLayerEnable">
                        <v-col>
                            <v-alert text type="warning" border="left">
                                {{
                                    $t('Panels.StatusPanel.PauseAtLayer.DescriptionPauseNextLayerActive', {
                                        call: macroSettingsPauseAtLayerCall,
                                    })
                                }}
                            </v-alert>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-select
                                v-model="type"
                                :items="itemsFiltered"
                                :label="$t('Panels.StatusPanel.PauseAtLayer.Type')"
                                outlined
                                hide-details />
                        </v-col>
                        <v-col v-if="type === 'atLayer'">
                            <v-text-field
                                v-model="layer"
                                :label="$t('Panels.StatusPanel.PauseAtLayer.Layer')"
                                outlined
                                hide-details />
                        </v-col>
                    </v-row>
                    <v-row class="mt-0">
                        <v-col>
                            <v-select
                                v-model="call"
                                :items="itemsCall"
                                :label="$t('Panels.StatusPanel.PauseAtLayer.Call')"
                                outlined
                                hide-details />
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="hideDialog">{{ $t('Panels.StatusPanel.PauseAtLayer.Abort') }}</v-btn>
                    <v-btn color="primary" text @click="sendCommand">
                        {{ $t('Panels.StatusPanel.PauseAtLayer.Accept') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import StatusPanelExcludeObjectDialogMap from '@/components/panels/Status/ExcludeObjectDialogMap.vue'
import StatusPanelExcludeObjectDialogList from '@/components/panels/Status/ExcludeObjectDialogList.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiLayersPlus } from '@mdi/js'
import { PrinterStateMacro } from '@/store/printer/types'
@Component({
    components: { Panel, StatusPanelExcludeObjectDialogList, StatusPanelExcludeObjectDialogMap },
})
export default class StatusPanelPauseAtLayerDialog extends Mixins(BaseMixin) {
    mdiLayersPlus = mdiLayersPlus
    mdiCloseThick = mdiCloseThick

    @Prop({ required: true }) declare readonly showDialog: boolean

    private type: 'nextLayer' | 'atLayer' = 'atLayer'
    private layer: number = 0
    private call: 'PAUSE' | 'M600' = 'PAUSE'

    hideDialog() {
        this.$emit('update:showDialog', false)
    }

    get items() {
        return [
            {
                text: this.$t('Panels.StatusPanel.PauseAtLayer.AtLayer'),
                value: 'atLayer',
                status: this.existsSetPauseAtLayer,
            },
            {
                text: this.$t('Panels.StatusPanel.PauseAtLayer.NextLayer'),
                value: 'nextLayer',
                status: this.existsSetPauseNextLayer,
            },
        ]
    }

    get itemsFiltered() {
        return this.items.filter((entry) => entry.status)
    }

    get itemsCall() {
        return [
            {
                text: 'PAUSE',
                value: 'PAUSE',
            },
            {
                text: 'M600',
                value: 'M600',
            },
        ]
    }

    get current_layer() {
        return this.$store.state.printer.print_stats?.info?.current_layer ?? 0
    }

    get total_layer() {
        return this.$store.state.printer.print_stats?.info?.total_layer ?? 0
    }

    get macros() {
        return this.$store.getters['printer/getMacros'] ?? []
    }

    get existsSetPauseAtLayer() {
        return this.macros.findIndex((macro: PrinterStateMacro) => macro.name === 'SET_PAUSE_AT_LAYER') !== -1
    }

    get existsSetPauseNextLayer() {
        return this.macros.findIndex((macro: PrinterStateMacro) => macro.name === 'SET_PAUSE_NEXT_LAYER') !== -1
    }

    get macroSetPrintStatsInfo() {
        return this.$store.state.printer['gcode_macro SET_PRINT_STATS_INFO'] ?? {}
    }

    get macroSettingsPauseAtLayer() {
        return this.macroSetPrintStatsInfo.pause_at_layer ?? {}
    }

    get macroSettingsPauseAtLayerEnable() {
        return this.macroSettingsPauseAtLayer.enable ?? false
    }

    get macroSettingsPauseAtLayerCall() {
        return this.macroSettingsPauseAtLayer.call ?? 'PAUSE'
    }

    get macroSettingsPauseAtLayerLayer() {
        return this.macroSettingsPauseAtLayer.layer ?? 0
    }

    get macroSettingsPauseNextLayer() {
        return this.macroSetPrintStatsInfo.pause_next_layer ?? {}
    }

    get macroSettingsPauseNextLayerEnable() {
        return this.macroSettingsPauseNextLayer.enable ?? false
    }

    get macroSettingsPauseNextLayerCall() {
        return this.macroSettingsPauseNextLayer.call ?? 'PAUSE'
    }

    sendCommand() {
        if (this.type === 'atLayer') {
            this.doSend(`SET_PAUSE_AT_LAYER ENABLE=1 LAYER=${this.layer} MACRO=${this.call}`)
            this.hideDialog()
            return
        }

        this.doSend(`SET_PAUSE_NEXT_LAYER ENABLE=1 MACRO=${this.call}`)
        this.hideDialog()
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    @Watch('showDialog')
    showDialogChanged(newVal: boolean) {
        if (newVal) {
            this.layer = this.current_layer + 1
            this.type = 'atLayer'

            if (!this.existsSetPauseAtLayer) this.type = 'nextLayer'
        }
    }

    @Watch('type')
    typeChanged(newVal: string) {
        if (newVal === 'atLayer') {
            this.call = this.macroSettingsPauseAtLayerCall
        } else if (newVal === 'nextLayer') {
            this.call = this.macroSettingsPauseNextLayerCall
        }
    }
}
</script>
