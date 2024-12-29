<template>
    <div>
        <div class="spool-card-header">
            <span
                :class="
                    lane.load && lane.prep && lane.tool_loaded
                        ? 'primary--text'
                        : lane.load && lane.prep
                          ? 'success--text'
                          : lane.prep
                            ? 'warning--text'
                            : 'error--text'
                ">
                <h3>{{ lane.laneName }}</h3>
            </span>
            <div class="spacer"></div>
            <v-tooltip top>
                <template #activator="{ on, attrs }">
                    <select
                        v-bind="attrs"
                        :name="'map-' + lane.laneName"
                        class="afclist"
                        v-on="on"
                        @change="handleMapChange($event, lane)">
                        <option v-for="option in mapList" :key="option" :value="option" :selected="option === lane.map">
                            {{ option }}
                        </option>
                    </select>
                </template>
                <span>{{ $t('Panels.AfcPanel.LaneMap') }}</span>
            </v-tooltip>
        </div>
        <div class="spool-card-body">
            <div class="filament-reel" @click="openChangeSpoolDialog(lane)">
                <FilamentReelIcon
                    :color="lane.prep ? lane.spool.color : 'transparent'"
                    style="width: 100%; height: 100%; max-width: inherit; max-height: inherit" />
            </div>
            <div class="spool-card-info">
                <div class="infinite-spool">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <select
                                v-bind="attrs"
                                :name="'run-' + lane.laneName"
                                class="afclist"
                                v-on="on"
                                @change="handleRunoutChange($event, lane)">
                                <option
                                    v-for="option in laneList.filter((option) => option !== lane.laneName)"
                                    :key="option"
                                    :value="option"
                                    :selected="option === lane.runout_lane">
                                    {{ option }}
                                </option>
                            </select>
                        </template>
                        <span>{{ $t('Panels.AfcPanel.InfiniteSpool') }}</span>
                    </v-tooltip>
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
        this.$nextTick(async () => {
            try {
                await this.$store.dispatch('printer/sendGcode', gcode)
                console.log('G-code sent successfully')
            } catch (error) {
                console.error('Failed to send G-code:', error)
            }
        })
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

    handleMapChange(event: Event, lane: Lane) {
        const selectedValue = (event.target as HTMLSelectElement).value
        console.log(`Selected value for ${lane.laneName}: ${selectedValue}`)

        //Example G-Code Call for you
        const gcode = `SET_MAP LANE=${lane.laneName} MAP=${selectedValue}`
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

.theme--dark .spool-card .afclist {
    color: white;
    background-color: #2e2e2e;
}

.theme--light .spool-card .afclist {
    background-color: #ebebeb;
}

.spacer {
    flex-grow: 1;
}

.afclist {
    cursor: pointer;
    padding-left: 5px;
    padding-right: 1px;
}
</style>
