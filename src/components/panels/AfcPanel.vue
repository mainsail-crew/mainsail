<template>
    <panel
        v-if="showPanel"
        :title="$t('Panels.AfcPanel.Headline')"
        :collapsible="true"
        :expanded="true"
        card-class="afc-control-panel">
        <template #title>
            <span>{{ $t('Panels.AfcPanel.Headline') }}</span>
        </template>
        <template #icon>
            <AFCLogo class="panel-icon" />
        </template>
        <template #buttons>
            <div v-if="showAFC" style="height: 100%">
                <v-btn
                    v-if="AFCCalibrate"
                    icon
                    tile
                    :disabled="printerIsPrintingOnly"
                    :title="$t('Panels.AfcPanel.Calibrate')"
                    @click="calibrateAFC">
                    <v-icon small>{{ mdiWrench }}</v-icon>
                </v-btn>
                <v-menu v-if="showAfcMacros" :offset-y="true" :close-on-content-click="false" left>
                    <template #activator="{ on, attrs }">
                        <v-btn icon tile v-bind="attrs" v-on="on">
                            <v-icon>{{ mdiDotsVertical }}</v-icon>
                        </v-btn>
                    </template>
                    <v-list dense>
                        <!-- NOZZLE CLEAN -->
                        <v-list-item v-if="brushMacroEnabled">
                            <macro-button
                                :macro="afcBrushMacro"
                                :alias="$t('Panels.AfcPanel.BrushNozzle')"
                                :disabled="printerIsPrintingOnly"
                                color="#272727" />
                        </v-list-item>
                        <!-- PARK NOZZLE -->
                        <v-list-item v-if="parkMacroEnabled">
                            <macro-button
                                :macro="afcParkMacro"
                                :alias="$t('Panels.AfcPanel.ParkNozzle')"
                                :disabled="printerIsPrintingOnly"
                                color="#272727" />
                        </v-list-item>
                    </v-list>
                </v-menu>
                <afc-panel-settings :units="unitsData" />
            </div>
        </template>
        <template v-if="display_message.message !== ''">
            <v-container>
                <v-row class="flex-nowrap">
                    <v-col class="py-2" style="min-width: 0">
                        <span :class="`${messageType.color}--text subtitle-2 px-0`">
                            <v-icon class="mr-2 mt-1 float-left" :color="messageType.color" small>
                                {{ messageType.icon }}
                            </v-icon>
                            {{ display_message.message }}
                        </span>
                    </v-col>
                    <v-col class="col-auto py-2">
                        <v-icon class="text--disabled cursor-pointer" small @click="clearDisplayMessage">
                            {{ mdiCloseCircle }}
                        </v-icon>
                    </v-col>
                </v-row>
            </v-container>
            <v-divider class="mt-0 mb-0" />
        </template>
        <div v-if="showAFC">
            <v-expansion-panels v-model="toolExpandedIndex">
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <strong>
                            {{ $t('Panels.AfcPanel.ExtruderTools') }}
                            <span v-if="toolExpandedIndex !== 0" class="text-caption text--disabled pl-1">
                                ( {{ toolCount }} )
                            </span>
                        </strong>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <afc-extruder-tools :tools="toolData" />
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>

            <v-expansion-panels v-model="unitExpandedIndex" multiple>
                <afc-units :units="unitsData" />
            </v-expansion-panels>
        </div>
        <div v-else>
            <v-card-text class="text-center error--text py-10">{{ $t('Panels.AfcPanel.LoadError') }}</v-card-text>
        </div>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import AfcMixin from '@/components/mixins/afc'
import { PrinterStateMacro } from '@/store/printer/types'
import Panel from '@/components/ui/Panel.vue'
import AFCLogo from '@/components/ui/AFCLogo.vue'
import { mdiDotsVertical, mdiCloseCircle, mdiMessageProcessingOutline, mdiAlertOutline, mdiWrench } from '@mdi/js'
import { Message } from '@/store/server/afc/types'

@Component({
    components: {
        Panel,
        AFCLogo,
    },
})
export default class AfcPanel extends Mixins(AfcMixin, BaseMixin, ControlMixin) {
    mdiDotsVertical = mdiDotsVertical
    mdiCloseCircle = mdiCloseCircle
    mdiWrench = mdiWrench

    intervalId: ReturnType<typeof setInterval> | null = null
    toolExpandedIndex: number | null = null
    unitExpandedIndex: number[] = []
    autoExpand: boolean = false
    display_message: Message = { message: '', type: '' }
    old_message: Message = { message: '', type: '' }

    showCalibrateDialog = false

    get showAFC(): boolean {
        return this.unitsData.length > 0
    }

    get showPanel(): boolean {
        return this.klipperReadyForGui && this.existsAfc
    }

    get toolCount(): number {
        return Object.keys(this.toolData).length
    }

    get AFCCalibrate(): boolean {
        return this.validMacro('AFC_CALIBRATION')
    }

    get messageType(): { color: string; icon: string } {
        switch (this.display_message.type) {
            case 'error':
                return { color: 'error', icon: mdiAlertOutline }
            case 'warning':
                return { color: 'warning', icon: mdiAlertOutline }
            default:
                return { color: '', icon: mdiMessageProcessingOutline }
        }
    }

    get parkMacroEnabled(): boolean {
        return (
            this.$store.state.printer.configfile?.config?.AFC?.park?.toLowerCase() === 'true' &&
            this.afcParkMacro !== undefined
        )
    }

    get brushMacroEnabled(): boolean {
        return (
            this.$store.state.printer.configfile?.config?.AFC?.wipe?.toLowerCase() === 'true' &&
            this.afcBrushMacro !== undefined
        )
    }

    get afcParkMacro(): PrinterStateMacro | undefined {
        const macros = this.$store.state.printer.configfile?.config?.AFC?.park_cmd ?? 'AFC_PARK'

        return this.macros.find((macro: PrinterStateMacro) => macros.includes(macro.name.toUpperCase()))
    }

    get afcBrushMacro(): PrinterStateMacro | undefined {
        const macros = this.$store.state.printer.configfile?.config?.AFC?.wipe_cmd ?? 'AFC_BRUSH'

        return this.macros.find((macro: PrinterStateMacro) => macros.includes(macro.name.toUpperCase()))
    }

    get showAfcMacros(): boolean {
        return this.parkMacroEnabled || this.brushMacroEnabled
    }

    validMacro(command: string): boolean {
        return this.$store.state.printer.gcode.commands[command.toUpperCase()] !== undefined
    }

    infoMessage() {
        if (this.afcMessage.message !== this.old_message.message) {
            this.display_message = this.afcMessage
        }
    }

    calibrateAFC() {
        const gcode = `AFC_CALIBRATION`

        if (this.validMacro(gcode)) {
            this.$nextTick(async () => {
                try {
                    this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'macro_' + gcode })
                } catch (error) {
                    console.error('Failed to send G-code:', error)
                }
            })
        }
    }

    clearDisplayMessage() {
        this.old_message = this.display_message
        this.display_message = { message: '', type: '' }
    }

    async fetchAFCData() {
        await this.$store.dispatch('server/afc/fetchAFCData')
        if (!this.autoExpand) {
            this.configureAutoExpand()
        }

        this.infoMessage()
    }

    async mounted() {
        this.fetchAFCData()

        this.intervalId = setInterval(this.fetchAFCData, 100)
    }

    beforeDestroy() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    configureAutoExpand() {
        if (Object.keys(this.toolData).length === 1 && this.toolExpandedIndex === null) {
            this.toolExpandedIndex = 0
        }
        if (Object.keys(this.unitsData).length === 1) {
            this.unitExpandedIndex = [0]
            this.autoExpand = true
        }
    }
}
</script>

<style scoped>
.panel-icon {
    width: 24px;
    height: 24px;
    fill: currentColor;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    user-select: none;
    margin-right: 8px;
}
</style>
