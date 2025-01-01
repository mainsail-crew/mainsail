<template>
    <div>
        <div class="spool-card-header">
            <v-menu :offset-y="true" :close-on-content-click="true" left>
                <template #activator="{ on: onMenu, attrs }">
                    <v-tooltip top>
                        <template #activator="{ on: onTooltip }">
                            <span
                                :class="laneStatusClass"
                                :style="{ cursor: laneReady ? 'pointer' : 'default' }"
                                v-bind="attrs"
                                v-on="{ ...onMenu, ...onTooltip }">
                                {{ lane.laneName }}
                            </span>
                        </template>
                        <span>{{ laneStatus }}</span>
                    </v-tooltip>
                </template>
                <v-list v-if="laneReady" dense>
                    <v-list-item v-if="!toolLoaded" @click="handleLaneAction($event, 'load')">
                        <v-list-item-title>{{ $t('Panels.AfcPanel.Load') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="toolLoaded" @click="handleLaneAction($event, 'unload')">
                        <v-list-item-title>{{ $t('Panels.AfcPanel.Unload') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="!toolLoaded" @click="handleLaneAction($event, 'eject')">
                        <v-list-item-title>{{ $t('Panels.AfcPanel.Eject') }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <div class="spacer"></div>
            <v-menu :offset-y="true" :close-on-content-click="true" left>
                <template #activator="{ on: onMenu, attrs }">
                    <v-tooltip top>
                        <template #activator="{ on: onTooltip }">
                            <span v-bind="attrs" v-on="{ ...onMenu, ...onTooltip }">
                                {{ lane.map }}
                            </span>
                        </template>
                        <span>{{ $t('Panels.AfcPanel.LaneMap') }}</span>
                    </v-tooltip>
                </template>
                <v-list dense>
                    <v-list-item v-for="option in mapList" :key="option" @click="handleMapChange($event, option)">
                        <v-list-item-title>{{ option }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </div>
        <div class="spool-card-body">
            <div class="filament-reel" @click="openChangeSpoolDialog(lane)">
                <FilamentReelIcon
                    :color="lane.prep ? lane.spool.color : 'transparent'"
                    style="width: 100%; height: 100%; max-width: inherit; max-height: inherit" />
            </div>
            <div class="spool-card-info">
                <div class="infinite-spool">
                    <v-menu :offset-y="true" :close-on-content-click="true" left>
                        <template #activator="{ on: onMenu, attrs }">
                            <v-tooltip top>
                                <template #activator="{ on: onTooltip }">
                                    <span v-bind="attrs" v-on="{ ...onMenu, ...onTooltip }">
                                        {{ lane.runout_lane }}
                                    </span>
                                </template>
                                <span>{{ $t('Panels.AfcPanel.InfiniteSpool') }}</span>
                            </v-tooltip>
                        </template>
                        <v-list dense>
                            <v-list-item
                                v-for="option in laneList.filter((option) => option !== lane.laneName)"
                                :key="option"
                                @click="handleMapChange($event, option)">
                                <v-list-item-title>{{ option }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <infinity-icon
                        id="Capa_1"
                        :color="lane.runout_lane === 'NONE' ? 'red' : 'green'"
                        class="infinity-icon"
                        version="1.1"
                        viewBox="0 0 60 60"
                        xml:space="preserve" />
                </div>
                <div class="spool-info-container">
                    <div v-if="lane.spool.material" class="spool-info material">{{ lane.spool.material }}</div>
                    <div v-if="lane.spool.weight" class="spool-info weight">{{ spoolWeight(lane.spool) }}</div>
                </div>
            </div>
        </div>
        <afc-change-spool-dialog
            v-if="selectedLane"
            :show-dialog="showChangeSpoolDialog"
            :index="lane.laneName"
            :lane-data="selectedLane"
            @close="showChangeSpoolDialog = false" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { PrinterStateMacro } from '@/store/printer/types'
import AfcChangeSpoolDialog from '@/components/dialogs/AfcChangeSpoolDialog.vue'
import InfinityIcon from '@/components/ui/InfinityIcon.vue'
import FilamentReelIcon from '@/components/ui/FilamentReelIcon.vue'
import { Lane, Spool } from '@/store/server/afc/types'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

@Component({
    components: { AfcChangeSpoolDialog, InfinityIcon, FilamentReelIcon },
})
export default class AfcUnits extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly lane!: Lane

    selectedLane: Lane | null = null // This will hold data of the clicked lane
    showChangeSpoolDialog: boolean = false

    get laneList(): string[] {
        return this.$store.getters['server/afc/getLaneList']
    }

    get mapList(): string[] {
        return this.$store.getters['server/afc/getMapList']
    }

    get activeSpoolWeight() {
        return this.$store.state.server.spoolman.active_spool
    }

    get laneReady() {
        return this.lane.load && this.lane.prep
    }

    get toolLoaded() {
        return this.lane.tool_loaded
    }

    get laneStatusClass() {
        return this.laneReady && this.toolLoaded
            ? 'primary--text'
            : this.laneReady
              ? 'success--text'
              : this.lane.prep
                ? 'warning--text'
                : 'error--text'
    }

    get laneStatus() {
        switch (true) {
            case this.laneReady && this.toolLoaded:
                return this.$t('Panels.AfcPanel.LaneCommands')
            case this.laneReady:
                return this.$t('Panels.AfcPanel.LaneCommands')
            case this.lane.prep:
                return this.$t('Panels.AfcPanel.LaneErrorLoad')
            default:
                return this.$t('Panels.AfcPanel.LaneEmpty')
        }
    }

    openChangeSpoolDialog(lane: Lane) {
        this.selectedLane = lane
        this.showChangeSpoolDialog = true
    }

    @Watch('activeSpoolWeight')
    onActiveSpoolWeightChange(newVal: ServerSpoolmanStateSpool, oldVal: ServerSpoolmanStateSpool) {
        if (newVal && newVal !== oldVal && newVal.id === Number(this.lane.spool.spool_id)) {
            this.updateSpoolInfo(newVal.remaining_weight)
        }
    }

    updateSpoolInfo(weight: any) {
        console.log('Active spool weight changed:', weight)

        const gcode = `SET_WEIGHT LANE=${this.lane.laneName} WEIGHT=${weight}`

        try {
            this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'macro_' + gcode })
            console.log('G-code sent successfully')
        } catch (error) {
            console.error('Failed to send G-code:', error)
        }
    }

    @Watch('lane.tool_loaded')
    onToolLoadedChange(newVal: boolean, oldVal: boolean) {
        if (newVal && !oldVal) {
            this.handleToolLoaded()
        } else if (!newVal && oldVal) {
            this.handleToolUnloaded()
        }
    }

    handleToolLoaded() {
        this.$store.dispatch('server/afc/setActiveLane', this.lane.laneName)
        this.$store.dispatch('server/afc/setActiveUnit', this.lane.unitName)
    }

    handleToolUnloaded() {
        this.$store.dispatch('server/afc/setActiveLane', null)
        this.$store.dispatch('server/afc/setActiveUnit', null)
    }

    handleRunoutChange(event: Event, lane: Lane) {
        const selectedValue = (event.target as HTMLSelectElement).value
        console.log(`Selected value for ${lane.laneName}: ${selectedValue}`)

        const gcode = `SET_RUNOUT LANE=${lane.laneName} RUNOUT=${selectedValue}`
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

    handleMapChange(event: Event, option: string) {
        console.log(`Selected value for ${this.lane.laneName}: ${option}`)

        //Example G-Code Call for you
        const gcode = `SET_MAP LANE=${this.lane.laneName} MAP=${option}`
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

    handleLaneAction(event: Event, action: string) {
        console.log(`Selected action for ${this.lane.laneName}: ${action}`)

        let gcode = ''
        switch (action) {
            case 'load':
                gcode = `CHANGE_TOOL LANE=${this.lane.laneName}`
                break
            case 'unload':
                gcode = `TOOL_UNLOAD LANE=${this.lane.laneName}`
                break
            case 'eject':
                gcode = `LANE_UNLOAD LANE=${this.lane.laneName}`
                break
            default:
                console.warn(`Unknown action: ${action}`)
                return
        }

        this.$nextTick(async () => {
            try {
                await this.$store.dispatch('printer/sendGcode', gcode)
                console.log('G-code sent successfully')
            } catch (error) {
                console.error('Failed to send G-code:', error)
            }
        })
    }

    get macros() {
        return this.$store.getters['printer/getMacros']
    }

    get setFilamentWeightMacro(): PrinterStateMacro | undefined {
        const macros = ['SET_WEIGHT']

        return this.macros.find((macro: PrinterStateMacro) => macros.includes(macro.name.toUpperCase()))
    }

    spoolWeight(spool: Spool) {
        const weight = Math.round(spool.weight)
        return weight ? `${weight} g` : ''
    }
}
</script>

<style scoped>
.spool-card-header {
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin-bottom: 5px;
}

.spool-card-body {
    display: flex;
    justify-content: space-between;
    padding: 5px;
    margin-bottom: 5px;
    padding-top: 0;
}

.spool-card-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    min-width: 74px;
}

.spool-info-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
    margin-top: auto;
    gap: 5px;
}

.spool-info.material {
    text-align: right;
    font-weight: bold;
}

.spool-info.weight {
    text-align: right;
    font-size: 0.9em;
}

.theme--dark .spool-info.weight {
    color: #aaa;
}

.theme--light .spool-info.weight {
    color: #333;
}

.infinity-icon {
    float: right;
    width: 20px;
    height: 20px;
}

.filament-reel {
    bottom: 5px;
    min-width: 30px;
    max-width: 40px;
    width: 100%;
    flex: 1 1 auto;
    cursor: pointer;
}

.filament-reel-base {
    stroke: black;
    stroke-width: 2px;
}

.spacer {
    flex-grow: 1;
}
</style>
