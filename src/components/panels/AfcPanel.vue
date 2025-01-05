<template>
    <panel
        v-if="showPanel"
        :title="$t('Panels.AfcPanel.Headline')"
        :collapsible="true"
        :expanded="true"
        card-class="afc-control-panel">
        <template #icon>
            <AFCLogo class="panel-icon" />
        </template>
        <template #buttons>
            <v-menu v-if="showAfcMacros" :offset-y="true" :close-on-content-click="false" left>
                <template #activator="{ on, attrs }">
                    <v-btn icon tile v-bind="attrs" v-on="on">
                        <v-icon>{{ mdiDotsVertical }}</v-icon>
                    </v-btn>
                </template>
                <v-list dense>
                    <!-- NOZZLE CLEAN -->
                    <v-list-item v-if="afcBrushMacro">
                        <macro-button
                            :macro="afcBrushMacro"
                            :alias="$t('Panels.AfcPanel.BrushNozzle')"
                            :disabled="printerIsPrintingOnly"
                            color="#272727" />
                    </v-list-item>
                    <!-- PARK NOZZLE -->
                    <v-list-item v-if="afcParkMacro">
                        <macro-button
                            :macro="afcParkMacro"
                            :alias="$t('Panels.AfcPanel.ParkNozzle')"
                            :disabled="printerIsPrintingOnly"
                            color="#272727" />
                    </v-list-item>
                </v-list>
            </v-menu>
            <afc-panel-settings :units="unitsData" />
        </template>

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
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { PrinterStateMacro } from '@/store/printer/types'
import Panel from '@/components/ui/Panel.vue'
import AFCLogo from '@/components/ui/AFCLogo.vue'
import { mdiDotsVertical } from '@mdi/js'
import { Extruder, Unit, System } from '@/store/server/afc/types'

@Component({
    components: {
        Panel,
        AFCLogo,
    },
})
export default class AfcPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiDotsVertical = mdiDotsVertical

    intervalId: ReturnType<typeof setInterval> | null = null
    toolExpandedIndex: number | null = null
    unitExpandedIndex: number[] = []
    autoExpand: boolean = false

    get showPanel(): boolean {
        return this.klipperReadyForGui /* && Check if AFC is initialized */
    }

    get toolData(): Extruder[] {
        return this.$store.getters['server/afc/getExtruders']
    }

    get toolCount(): number {
        return Object.keys(this.toolData).length
    }

    get unitsData(): Unit[] {
        return this.$store.getters['server/afc/getUnits']
    }

    get systemData(): System | null {
        return this.$store.getters['server/afc/getSystemInfo']
    }

    get afcParkMacro(): PrinterStateMacro | undefined {
        const macros = ['AFC_PARK']

        return this.macros.find((macro: PrinterStateMacro) => macros.includes(macro.name.toUpperCase()))
    }

    get afcBrushMacro(): PrinterStateMacro | undefined {
        const macros = ['AFC_BRUSH']

        return this.macros.find((macro: PrinterStateMacro) => macros.includes(macro.name.toUpperCase()))
    }

    get showAfcMacros(): boolean {
        return this.afcParkMacro !== undefined || this.afcBrushMacro !== undefined
    }

    async fetchAFCData() {
        await this.$store.dispatch('server/afc/fetchAFCData')
        if (!this.autoExpand) {
            this.configureAutoExpand()
        }
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
