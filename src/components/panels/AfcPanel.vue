<template>
    <panel
        v-if="showPanel"
        :icon="mdiAdjust"
        :title="$t('Panels.AfcPanel.Headline')"
        :collapsible="true"
        :expanded="true"
        card-class="afc-control-panel">
        <div>
            <v-expansion-panels v-model="toolExpandedIndex">
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <strong>{{ $t('Panels.AfcPanel.ExtruderTools') }}</strong>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content style="padding: 0 5px 16px">
                        <afc-extruder-tools :tools="toolData" />
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </div>
        <v-expansion-panels v-model="unitExpandedIndex" multiple>
            <afc-units :units-data="unitsData" />
        </v-expansion-panels>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiRefresh, mdiDotsVertical } from '@mdi/js'
import SpoolIcon from '@/components/ui/SpoolIcon.vue'
import { AFCRoot } from '@/store/server/afc'

@Component({
    components: {
        Panel,
        SpoolIcon,
    },
})
export default class AfcPanel extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiRefresh = mdiRefresh
    mdiDotsVertical = mdiDotsVertical

    spoolData: any[] = []
    toolData: any[] = []
    mapList: any[] = []
    laneList: any[] = []
    intervalId: ReturnType<typeof setInterval> | null = null
    systemData: any = null
    unitsData: any = {}
    toolExpandedIndex: number | null = null
    unitExpandedIndex: number[] = []
    autoExpand: boolean = false

    get showPanel(): boolean {
        return this.klipperReadyForGui /* && Check if AFC is initialized */
    }

    async mounted() {
        this.fetchSpoolData()
        this.intervalId = setInterval(this.fetchSpoolData, 100)
    }

    beforeDestroy() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    get afc_Data(): AFCRoot | null {
        return this.$store.state.printer.AFC
    }

    fetchSpoolData() {
        const afcData = this.afc_Data ? JSON.parse(JSON.stringify(this.afc_Data)) : null

        if (!afcData) {
            this.resetSpoolData()
            return
        }

        this.spoolData = this.extractLaneData(afcData)
        this.unitsData = this.groupByUnit(this.spoolData)
        this.toolData = afcData.system?.extruders || {}
        this.systemData = afcData.system || {}

        Object.entries(afcData).forEach(([unitName, unit]) => {
            if (unitName !== 'system' && this.unitsData[unitName]) {
                const currentUnit = this.unitsData[unitName]
                currentUnit.system = unit.system || {}
                currentUnit.laneList = this.laneList || []
                currentUnit.mapList = this.mapList || []
            }
        })

        this.configureAutoExpand()
    }

    resetSpoolData() {
        this.spoolData = []
        this.unitsData = {}
        this.systemData = {}
    }

    configureAutoExpand() {
        if (Object.keys(this.toolData).length === 1 && this.toolExpandedIndex === null) {
            this.toolExpandedIndex = 0
        }
        if (Object.keys(this.unitsData).length === 1 && !this.autoExpand) {
            this.unitExpandedIndex = [0]
            this.autoExpand = true
        }
    }

    extractLaneData(spools: any) {
        if (!spools || typeof spools !== 'object') {
            this.laneList = []
            this.mapList = []
            return []
        }

        const lanes = []
        const mapSet = new Set<string>()
        const laneSet = new Set<string>()

        Object.entries(spools).forEach(([unitName, unit]) => {
            if (unitName === 'system' || typeof unit !== 'object') return

            Object.entries(unit).forEach(([laneKey, laneData]) => {
                if (laneKey !== 'system' && typeof laneData === 'object' && laneData !== null) {
                    laneData.unitName = unitName
                    laneData.laneName = laneKey
                    laneData.empty = '#2e2e2e'
                    laneData.material = laneData.material || ''
                    laneData.color = laneData.color || '#000000'
                    laneData.weight = laneData.weight || 0

                    lanes.push(laneData)
                    laneSet.add(laneKey)
                    if (laneData.map) {
                        mapSet.add(laneData.map)
                    }
                }
            })
        })

        this.laneList = Array.from(laneSet).sort()
        this.laneList.unshift('NONE')
        this.mapList = Array.from(mapSet).sort()
        return lanes
    }

    private groupByUnit(spoolData: any[]) {
        const units: any = {}
        spoolData.forEach((spool) => {
            const unitName = spool.unitName
            if (!units[unitName]) {
                units[unitName] = { spools: [] }
            }
            units[unitName].spools.push(spool)
        })
        return units
    }
}
</script>

<style scoped></style>
