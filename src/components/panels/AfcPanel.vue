<template>
    <div>
        <panel
            :icon="mdiAdjust"
            :title="'Automated Filament Control'"
            :collapsible="true"
            :expanded="true"
            card-class="afc-control-panel">
            <div>
                <v-expansion-panels v-model="toolExpandedIndex">
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <strong>Extruder Tools</strong>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 0 5px 16px">
                            <div class="tool-container">
                                <div
                                    v-for="(tool, toolName) in toolData"
                                    :key="toolName"
                                    class="tool-card rounded-lg shadow-md">
                                    <div class="extruder-container">
                                        <v-tooltip top>
                                            <template #activator="{ on, attrs }">
                                                <span
                                                    v-bind="attrs"
                                                    v-on="on"
                                                    :class="{
                                                        'status-light': true,
                                                        success: tool.tool_start_sensor,
                                                        error: !tool.tool_start_sensor,
                                                    }"></span>
                                            </template>
                                            <span>Pre-Extruder Sensor</span>
                                        </v-tooltip>
                                        {{ toolName }}
                                        <v-tooltip top>
                                            <template #activator="{ on, attrs }">
                                                <span
                                                    v-if="tool.tool_end_sensor !== null"
                                                    v-bind="attrs"
                                                    v-on="on"
                                                    :class="{
                                                        'status-light': true,
                                                        success: tool.tool_end_sensor,
                                                        error: !tool.tool_end_sensor,
                                                    }"></span>
                                            </template>
                                            <span>Post-Extruder Sensor</span>
                                        </v-tooltip>
                                    </div>
                                    <div class="buffer-info">{{ tool.buffer }}: {{ tool.buffer_status }}</div>
                                    <div class="lane-status">
                                        Loaded:
                                        <span :class="tool.lane_loaded !== '' ? 'primary--text' : 'error--text'">
                                            {{ tool.lane_loaded !== '' ? tool.lane_loaded : 'NONE' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </div>
            <v-expansion-panels v-model="unitExpandedIndex" multiple>
                <v-expansion-panel v-for="(unit, unitName) in unitsData" :key="unitName" class="unit-section">
                    <v-expansion-panel-header>
                        <div class="unit-header" style="display: flex; align-items: center; gap: 10px">
                            <BoxTurtleIcon
                                v-if="unitsData[unitName]?.system?.type === 'Box_Turtle'"
                                class="box-turtle-icon" />
                            <h2 class="unit-title" style="margin: 0">{{ String(unitName).replace(/_/g, ' ') }} |</h2>
                            <span class="hub-container">
                                <strong>Hub</strong>
                                <span
                                    :class="{
                                        'status-light': true,
                                        success: getHubStatus({ unitName }),
                                        error: !getHubStatus({ unitName }),
                                    }"></span>
                            </span>
                        </div>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <div class="spool-container">
                            <div
                                v-for="(spool, index) in unit.spools"
                                :key="index"
                                class="spool-card rounded-lg shadow-md overflow-hidden">
                                <div class="spool-card-header">
                                    <span
                                        :class="
                                            spool.load && spool.prep && spool.tool_loaded
                                                ? 'primary--text'
                                                : spool.load && spool.prep
                                                  ? 'success--text'
                                                  : spool.prep
                                                    ? 'warning--text'
                                                    : 'error--text'
                                        ">
                                        <h3>{{ spool.laneName }}</h3>
                                    </span>
                                    <div class="spacer"></div>
                                    <v-tooltip top>
                                        <template #activator="{ on, attrs }">
                                            <select
                                                v-bind="attrs"
                                                v-on="on"
                                                :name="'map-' + spool.laneName"
                                                class="afclist"
                                                @change="handleMapChange($event, spool)">
                                                <option
                                                    v-for="option in mapList"
                                                    :key="option"
                                                    :value="option"
                                                    :selected="option === spool.map">
                                                    {{ option }}
                                                </option>
                                            </select>
                                        </template>
                                        <span>Remap current lane to selected T command</span>
                                    </v-tooltip>
                                </div>
                                <div class="spool-card-body">
                                    <div class="filament-reel" @click="openChangeSpoolDialog(spool)">
                                        <FilamentReelIcon :color="spool.prep ? spool.color : 'transparent'" />
                                    </div>
                                    <div class="spool-card-info">
                                        <div class="infinite-spool">
                                            <v-tooltip top>
                                                <template #activator="{ on, attrs }">
                                                    <select
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        :name="'run-' + spool.laneName"
                                                        class="afclist"
                                                        @change="handleRunoutChange($event, spool)">
                                                        <option
                                                            v-for="option in laneList"
                                                            :key="option"
                                                            :value="option"
                                                            :selected="option === spool.runout_lane"
                                                            v-if="option !== spool.laneName">
                                                            {{ option }}
                                                        </option>
                                                    </select>
                                                </template>
                                                <span>Next lane to load if the current lane runs out</span>
                                            </v-tooltip>
                                            <infinity-icon
                                                :color="spool.runout_lane === 'NONE' ? 'red' : 'green'"
                                                class="infinity-icon"
                                                version="1.1"
                                                id="Capa_1"
                                                viewBox="0 0 60 60"
                                                xml:space="preserve" />
                                        </div>
                                        <p v-if="spool.material">{{ spool.material }}</p>
                                        <p v-if="spool.weight">{{ spoolWeight(spool) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </panel>
        <afc-change-spool-dialog
            v-if="selectedLane"
            :show-dialog="showChangeSpoolDialog"
            :index="index"
            :lane-data="selectedLane"
            @close="showChangeSpoolDialog = false"
            @fetch-spool="fetchSpoolData" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiRefresh, mdiDotsVertical } from '@mdi/js'
import AfcChangeSpoolDialog from '@/components/dialogs/AfcChangeSpoolDialog.vue'
import FilamentReelIcon from '@/components/ui/FilamentReelIcon.vue'
import SpoolIcon from '@/components/ui/SpoolIcon.vue'
import { AFCRoot } from '@/store/server/afc'
import BoxTurtleIcon from '@/components/ui/BoxTurtleIcon.vue'
import InfinityIcon from '@/components/ui/InfinityIcon.vue'

@Component({
    components: {
        Panel,
        AfcChangeSpoolDialog,
        SpoolIcon,
        FilamentReelIcon,
        BoxTurtleIcon,
        InfinityIcon,
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

    async mounted() {
        const savedStyleIndex = localStorage.getItem('styleIndex')
        if (savedStyleIndex !== null) {
            this.styleIndex = parseInt(savedStyleIndex, 10)
        }
        this.fetchSpoolData()
        this.intervalId = setInterval(this.fetchSpoolData, 500)
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
            this.unitsData = this.groupByUnit(this.spoolData)
            this.spoolData = this.extractLaneData(afcData)
            this.toolData = afcData.system.extruders || {}
            this.systemData = afcData.system || {}
            for (const unitName in afcData) {
                if (afcData.hasOwnProperty(unitName) && unitName !== 'system') {
                    if (this.unitsData[unitName]) {
                        this.unitsData[unitName].system = afcData[unitName].system || {}
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

    openChangeSpoolDialog(spool: any) {
        this.selectedLane = spool
        this.showChangeSpoolDialog = true
    }

    bufferStatus() {
        return this.systemData?.extruders?.extruder?.buffer_status || false
    }

    getHubStatus({ unitName }: { unitName: any }) {
        if (this.unitsData[unitName]?.system?.hub_loaded !== undefined) {
            return this.unitsData[unitName].system.hub_loaded
        }
        return this.systemData?.hub_loaded || false
    }

    get toolStartSensorStatus() {
        return this.systemData?.extruders?.extruder?.tool_start_sensor || false
    }

    spoolWeight(spool: any) {
        const weight = parseInt(spool.weight, 10)
        return weight ? `${weight} g` : ''
    }

    handleRunoutChange(event: Event, spool: any) {
        const selectedValue = (event.target as HTMLSelectElement).value
        console.log(`Selected value for ${spool.laneName}: ${selectedValue}`)

        const gcode = `SET_RUNOUT LANE=${spool.laneName} RUNOUT=${selectedValue}`
        console.log('Dispatching G-code:', gcode)

        this.$nextTick(async () => {
            try {
                await this.$store.dispatch('printer/sendGcode', gcode)
                console.log('G-code sent successfully')
            } catch (error) {
                console.error('Failed to send G-code:', error)
            }
        })
    }

    handleMapChange(event: Event, spool: any) {
        const selectedValue = (event.target as HTMLSelectElement).value
        console.log(`Selected value for ${spool.laneName}: ${selectedValue}`)

        //Example G-Code Call for you
        const gcode = `SET_MAP LANE=${spool.laneName} MAP=${selectedValue}`
        console.log('Dispatching G-code:', gcode)

        this.$nextTick(async () => {
            try {
                await this.$store.dispatch('printer/sendGcode', gcode)
                console.log('G-code sent successfully')
            } catch (error) {
                console.error('Failed to send G-code:', error)
            }
        })
    }
}
</script>

<style scoped>
.spool-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    padding-top: 0px;
}

.tool-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    padding-top: 0px;
    margin-top: 0px;
}

.hub-container {
    text-align: left;
    margin: 20px 0;
}

.hub-container strong {
    margin-right: 5px;
}

.unit-title {
    font-size: 1.5em;
    margin-bottom: 16px;
    text-align: left;
}

.spool-card {
    transition: background-color 0.3s ease;
    padding-top: 0px;
    max-width: 150px;
    min-width: 110px;
    min-height: 150px;
    flex: 1 1 110px;
    position: relative;
    text-align: right;
    width: 100%;
}

.spool-card-header {
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin-bottom: 5px;
}

.spool-card-body {
    padding: 5px;
    padding-top: 0px;
    display: flex;
    justify-content: space-between;
}

.spool-card-body p {
    margin: 4px 0;
}

.tool-card {
    transition: background-color 0.3s ease;
    padding: 5px;
    padding-left: 10px;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-content: center;
    justify-content: space-between;
}

.theme--dark .spool-card,
.theme--dark .tool-card {
    background-color: #2e2e2e;
}

.theme--light .spool-card,
.theme--light .tool-card {
    background-color: #ebebeb;
}

.filament-reel {
    bottom: 5px;
    min-width: 30px;
    max-width: 40px;
    width: 100%;
    flex: 1 1 auto;
    cursor: pointer;
}

.infinite-spool {
    display: flex;
    justify-content: flex-start;
    flex-wrap: nowrap;
}
.spacer {
    flex-grow: 1;
}

.afclist {
    cursor: pointer;
    padding-left: 6px;
    padding-right: 1px;
    float: left;
}
.theme--dark .spool-card .afclist {
    color: white;
    background-color: #2e2e2e;
}

.theme--light .spool-card .afclist {
    background-color: #ebebeb;
}

.infinity-icon {
    float: right;
    width: 20px;
    height: 20px;
}

.status-light {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
    margin-left: 5px;
}

.box-turtle-icon {
    width: 70px;
    height: 70px;
    margin-left: 10px;
}

.lane-status {
    margin-right: 10px;
    margin-left: 5px;
}
</style>
