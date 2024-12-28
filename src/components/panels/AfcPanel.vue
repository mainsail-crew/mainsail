<template>
    <div>
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
    </div>
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

    showChangeSpoolDialog = false
    selectedLane: any = null // This will hold data of the clicked lane

    spoolData: any[] = []
    toolData: any[] = []
    mapList: any[] = []
    laneList: any[] = []
    intervalId: ReturnType<typeof setInterval> | null = null
    systemData: any = null
    index: number = 0
    unitsData: any = {}
    toolExpandedIndex: number | null = null
    unitExpandedIndex: number[] = []
    autoExpand: boolean = false

    selectedStyle: number = 1
    styleIndex: number = 1

    get showPanel(): boolean {
        return this.klipperReadyForGui /* && Check if AFC is initialized */
    }

    async mounted() {
        const savedStyleIndex = localStorage.getItem('styleIndex')
        if (savedStyleIndex !== null) {
            this.styleIndex = parseInt(savedStyleIndex, 10)
        }
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
        if (afcData) {
            this.spoolData = this.extractLaneData(afcData)
            this.unitsData = this.groupByUnit(this.spoolData)
            this.toolData = afcData.system.extruders || {}
            this.systemData = afcData.system || {}
            for (const unitName in afcData) {
                if (afcData.hasOwnProperty(unitName) && unitName !== 'system') {
                    if (this.unitsData[unitName]) {
                        const unit = afcData[unitName]

                        // Add system data
                        this.unitsData[unitName].system = unit.system || {}

                        // Add lane list and map list
                        this.unitsData[unitName].laneList = this.laneList || []
                        this.unitsData[unitName].mapList = this.mapList || []
                    }
                }
            }

            if (Object.keys(this.toolData).length === 1 && this.toolExpandedIndex === null) {
                this.toolExpandedIndex = 0
            }
            if (Object.keys(this.unitsData).length === 1 && !this.autoExpand) {
                this.unitExpandedIndex = [0]
                this.autoExpand = true
            }
        } else {
            this.spoolData = []
            this.unitsData = {}
            this.systemData = {}
        }
    }

    extractLaneData(spools: any) {
        const lanes = []
        const mapList = []
        const laneList = []
        this.mapList = []
        this.laneList = []
        if (spools && typeof spools === 'object') {
            for (const unitName in spools) {
                if (spools.hasOwnProperty(unitName) && unitName !== 'system') {
                    const unit = spools[unitName]
                    for (const laneKey in unit) {
                        if (
                            unit.hasOwnProperty(laneKey) &&
                            typeof unit[laneKey] === 'object' &&
                            laneKey !== 'system' &&
                            unit[laneKey] !== null
                        ) {
                            const laneData = unit[laneKey]
                            laneData.unitName = unitName
                            laneData.laneName = laneKey
                            laneData.empty = '#2e2e2e'
                            laneData.material = laneData.material || ''
                            laneData.color = laneData.color || '#000000'
                            laneData.weight = laneData.weight || 0
                            lanes.push(laneData)
                            laneList.push(laneKey)
                            mapList.push(unit[laneKey]['map'])
                        }
                    }
                }
            }
        }
        this.laneList = laneList.sort()
        this.laneList.unshift('NONE')
        this.mapList = mapList.sort()
        return lanes
    }

    saveStyleIndex(changer: number) {
        this.styleIndex = changer
        localStorage.setItem('styleIndex', changer.toString())
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

    spoolWeight(spool: any) {
        const weight = parseInt(spool.weight, 10)
        return weight ? `${weight} g` : ''
    }
}
</script>

<style scoped></style>
