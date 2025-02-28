<template>
    <div :class="laneStateClass">
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
                                        (!extrudePossible && lane.spool.material === '') ||
                                        printerIsPrintingOnly ||
                                        bypassState
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
                                        (!extrudePossible && lane.spool.material === '') ||
                                        printerIsPrintingOnly ||
                                        bypassState
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
                    <v-list-item v-if="!toolLoaded && errorState" @click="handleLaneAction($event, 'setLoad')">
                        <v-list-item-title>{{ $t('Panels.AfcPanel.SetLoadState') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="toolLoaded && errorState" @click="handleLaneAction($event, 'unSetLoad')">
                        <v-list-item-title>{{ $t('Panels.AfcPanel.ClearLoadState') }}</v-list-item-title>
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
import AfcMixin from '@/components/mixins/afc'
import { Lane } from '@/store/server/afc/types'
import AfcUnitsItemLaneCard from '@/components/panels/Afc/AfcUnitsItemLaneCard.vue'
import AfcUnitsItemLaneCardEmpty from '@/components/panels/Afc/AfcUnitsItemLaneCardEmpty.vue'

@Component({
    components: { AfcUnitsItemLaneCard, AfcUnitsItemLaneCardEmpty },
})
export default class AfcUnits extends Mixins(AfcMixin, BaseMixin, ExtruderMixin) {
    @Prop({ type: Object, required: true }) readonly lane!: Lane

    get laneReady() {
        return this.lane.load && this.lane.prep
    }

    get lanePrep() {
        return this.lane.prep
    }

    get toolLoaded() {
        return this.lane.tool_loaded
    }

    get activeLane(): boolean {
        return this.currentLane?.name === this.lane.name || this.currentLoad?.name === this.lane.name
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

    get laneStateClass() {
        return this.activeLane && this.errorState ? 'error-load' : this.activeLane ? 'active-load' : ''
    }

    get laneStatus() {
        return this.lane.prep ? this.$t('Panels.AfcPanel.LaneErrorLoad') : this.$t('Panels.AfcPanel.LaneEmpty')
    }

    handleMapChange(event: Event, option: string) {
        const gcode = `SET_MAP LANE=${this.lane.name} MAP=${option}`

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
                } else if (action === 'unSetLoad') {
                    gcode = `UNSET_LANE_LOADED`
                    await this.$store.dispatch('printer/sendGcode', gcode)
                } else if (action === 'setLoad') {
                    gcode = `SET_LANE_LOADED LANE=${this.lane.name}`
                    await this.$store.dispatch('printer/sendGcode', gcode)
                } else {
                    console.warn('Unknown action:', action)
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

.active-load {
    border: 1px solid var(--v-primary-base);
    box-sizing: border-box;
}

.error-load {
    border: 1px solid var(--v-error-base);
    box-sizing: border-box;
}
</style>
