<template>
    <div>
        <div class="spool-card-header">
            <v-menu v-if="lanePrep" :offset-y="true" :close-on-content-click="true" left>
                <template #activator="{ on: onMenu, attrs }">
                    <v-tooltip top>
                        <template #activator="{ on: onTooltip }">
                            <span :class="laneStatusClass" v-bind="attrs" v-on="{ ...onMenu, ...onTooltip }">
                                {{ lane.name }}
                            </span>
                        </template>
                        <span>{{ $t('Panels.AfcPanel.LaneCommands') }}</span>
                    </v-tooltip>
                </template>
                <v-list dense>
                    <v-tooltip top :disabled="extrudePossible || lane.spool.material !== ''" color="secondary">
                        <template #activator="{ on: onExtruderTemp }">
                            <div v-on="onExtruderTemp">
                                <v-list-item
                                    v-if="!toolLoaded && laneReady"
                                    :disabled="
                                        (!extrudePossible && lane.spool.material === '') || printerIsPrintingOnly
                                    "
                                    @click="handleLaneAction($event, 'load')">
                                    <v-list-item-title>{{ $t('Panels.AfcPanel.Load') }}</v-list-item-title>
                                </v-list-item>
                            </div>
                        </template>
                        <span>
                            {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                            {{ minExtrudeTemp }} °C
                        </span>
                    </v-tooltip>
                    <v-tooltip top :disabled="extrudePossible || lane.spool.material !== ''" color="secondary">
                        <template #activator="{ on: onExtruderTemp }">
                            <div v-on="onExtruderTemp">
                                <v-list-item
                                    v-if="toolLoaded"
                                    :disabled="
                                        (!extrudePossible && lane.spool.material === '') || printerIsPrintingOnly
                                    "
                                    @click="handleLaneAction($event, 'unload')">
                                    <v-list-item-title>{{ $t('Panels.AfcPanel.Unload') }}</v-list-item-title>
                                </v-list-item>
                            </div>
                        </template>
                        <span>
                            {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                            {{ minExtrudeTemp }} °C
                        </span>
                    </v-tooltip>
                    <v-list-item v-if="!toolLoaded" @click="handleLaneAction($event, 'eject')">
                        <v-list-item-title>{{ $t('Panels.AfcPanel.Eject') }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <span v-else :class="laneStatusClass" :style="{ cursor: 'default' }">
                {{ lane.name }}
            </span>
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
        <v-divider />
        <afc-units-item-lane-card v-if="laneReady" :lane="lane" />
        <afc-units-item-lane-card-empty v-else :lane-status="laneStatus" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ExtruderMixin from '@/components/mixins/extruder'
import { Lane } from '@/store/server/afc/types'
import AfcUnitsItemLaneCard from '@/components/panels/Afc/AfcUnitsItemLaneCard.vue'
import AfcUnitsItemLaneCardEmpty from '@/components/panels/Afc/AfcUnitsItemLaneCardEmpty.vue'

@Component({
    components: { AfcUnitsItemLaneCard, AfcUnitsItemLaneCardEmpty },
})
export default class AfcUnits extends Mixins(BaseMixin, ExtruderMixin) {
    @Prop({ type: Object, required: true }) readonly lane!: Lane

    get mapList(): string[] {
        return this.$store.getters['server/afc/getMapList']
    }

    get laneReady() {
        return this.lane.load && this.lane.prep
    }

    get lanePrep() {
        return this.lane.prep
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
        return this.lane.prep ? this.$t('Panels.AfcPanel.LaneErrorLoad') : this.$t('Panels.AfcPanel.LaneEmpty')
    }

    handleMapChange(event: Event, option: string) {
        console.log(`Selected value for ${this.lane.name}: ${option}`)

        //Example G-Code Call for you
        const gcode = `SET_MAP LANE=${this.lane.name} MAP=${option}`
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
        if (!this.lane.name) {
            console.warn('Lane name is empty, cannot perform action')
            return
        }

        let gcode = ''

        this.$nextTick(async () => {
            try {
                if (action === 'load') {
                    gcode = `CHANGE_TOOL LANE=${this.lane.name}`
                    await this.$store.dispatch('printer/sendGcode', gcode)
                } else if (action === 'unload') {
                    gcode = `TOOL_UNLOAD LANE=${this.lane.name}`
                    await this.$store.dispatch('printer/sendGcode', gcode)
                } else if (action === 'eject') {
                    gcode = `LANE_UNLOAD LANE=${this.lane.name}`
                    await this.$store.dispatch('printer/sendGcode', gcode)
                }
            } catch (error) {
                console.error('Failed to send G-code:', error)
            }
        })
    }
}
</script>

<style scoped>
.spool-card-header {
    padding: 10px;
    padding-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
}
</style>
