<template>
    <div>
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
                        :name="'map-' + spool.laneName"
                        class="afclist"
                        v-on="on"
                        @change="handleMapChange($event, spool)">
                        <option
                            v-for="option in unit.mapList"
                            :key="option"
                            :value="option"
                            :selected="option === spool.map">
                            {{ option }}
                        </option>
                    </select>
                </template>
                <span>{{ $t('Panels.AfcPanel.LaneMap') }}</span>
            </v-tooltip>
        </div>
        <div class="spool-card-body">
            <div class="filament-reel" @click="openChangeSpoolDialog(spool)">
                <FilamentReelIcon
                    :color="spool.prep ? spool.color : 'transparent'"
                    style="width: 100%; height: 100%; max-width: inherit; max-height: inherit" />
            </div>
            <div class="spool-card-info">
                <div class="infinite-spool">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <select
                                v-bind="attrs"
                                :name="'run-' + spool.laneName"
                                class="afclist"
                                v-on="on"
                                @change="handleRunoutChange($event, spool)">
                                <option
                                    v-for="option in unit.laneList.filter((option) => option !== spool.laneName)"
                                    :key="option"
                                    :value="option"
                                    :selected="option === spool.runout_lane">
                                    {{ option }}
                                </option>
                            </select>
                        </template>
                        <span>{{ $t('Panels.AfcPanel.InfiniteSpool') }}</span>
                    </v-tooltip>
                    <infinity-icon
                        id="Capa_1"
                        :color="spool.runout_lane === 'NONE' ? 'red' : 'green'"
                        class="infinity-icon"
                        version="1.1"
                        viewBox="0 0 60 60"
                        xml:space="preserve" />
                </div>
                <div class="spool-info-container">
                    <div v-if="spool.material" class="spool-info material">{{ spool.material }}</div>
                    <div v-if="spool.weight" class="spool-info weight">{{ spoolWeight(spool) }}</div>
                </div>
            </div>
        </div>
        <afc-change-spool-dialog
            v-if="selectedLane"
            :show-dialog="showChangeSpoolDialog"
            :index="spool.laneName"
            :lane-data="selectedLane"
            @close="showChangeSpoolDialog = false" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcChangeSpoolDialog from '@/components/dialogs/AfcChangeSpoolDialog.vue'
import InfinityIcon from '@/components/ui/InfinityIcon.vue'
import FilamentReelIcon from '@/components/ui/FilamentReelIcon.vue'

@Component({
    components: { AfcChangeSpoolDialog, InfinityIcon, FilamentReelIcon },
})
export default class AfcUnits extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly spool!: Record<string, any>
    @Prop({ type: Object, required: true }) readonly unit!: Record<string, any>

    selectedLane: any = null // This will hold data of the clicked lane

    openChangeSpoolDialog(spool: any) {
        this.selectedLane = spool
        this.showChangeSpoolDialog = true
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

    spoolWeight(spool: any) {
        const weight = parseInt(spool.weight, 10)
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
