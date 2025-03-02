<template>
    <div v-if="!isToolDisabled || showUnusedTools">
        <div class="lane-item">
            <v-menu :offset-y="true" :close-on-content-click="true" left>
                <template #activator="{ on: onMenu, attrs }">
                    <v-tooltip top>
                        <template #activator="{ on: onTooltip }">
                            <span v-bind="attrs" class="map" v-on="{ ...onMenu, ...onTooltip }">
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
            <v-tooltip top>
                <template #activator="{ on: onTooltip }">
                    <div
                        class="lane-details"
                        :class="{ disabled: isToolDisabled }"
                        v-on="onTooltip"
                        @click="handleToolClick">
                        <div class="left-column">
                            <ColorBox v-if="fileColor" :color="fileColor" />
                            <div class="filament-info">
                                <span :class="getClassForType" flex>
                                    {{ fileFilamentType }}
                                </span>
                                <span v-if="weightVisible" :class="getClassForWeight" flex>
                                    {{ fileWeight }}
                                </span>
                            </div>
                        </div>
                        <div class="right-column">
                            {{ lane.name }}
                            <ColorBox :color="spoolColor" />
                            <div class="filament-info">
                                <span :class="getClassForType" flex>
                                    {{ spoolMaterial }}
                                </span>
                                <span v-if="spoolWeight" :class="getClassForWeight" flex>
                                    {{ spoolWeight }}
                                </span>
                            </div>
                            <span class="match-status">
                                <v-icon
                                    :style="{ visibility: isToolDisabled ? 'hidden' : 'visible' }"
                                    :color="toolStatus.color">
                                    {{ toolStatus.icon }}
                                </v-icon>
                            </span>
                        </div>
                    </div>
                </template>
                <span>{{ isToolDisabled ? $t('Panels.AfcPanel.ToolDisabled') : $t('Panels.AfcPanel.SpoolMap') }}</span>
            </v-tooltip>
        </div>
        <v-divider class="mt-0 mb-0" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import { Lane } from '@/store/server/afc/types'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { FileStateGcodefile } from '@/store/files/types'
import { mdiCheck, mdiAlertOutline } from '@mdi/js'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import ColorBox from '@/components/ui/ColorBox.vue'

@Component({
    components: { ColorBox },
})
export default class AfcStartPrintItem extends Mixins(AfcMixin, BaseMixin) {
    @Prop({ required: true }) lane!: Lane
    @Prop({ required: true }) showUnusedTools!: boolean
    @Prop({ required: true }) file!: FileStateGcodefile

    mdiCheck = mdiCheck
    mdiAlertOutline = mdiAlertOutline

    currentMap = ''
    currentSpoolId = ''

    @Watch('lane.map')
    @Watch('lane.spool.spool_id')
    onLaneInfoChange() {
        if (this.lane.map !== this.currentMap || this.lane.spool.spool_id !== this.currentSpoolId) {
            this.currentMap = this.lane.map
            this.currentSpoolId = this.lane.spool.spool_id
            this.updateMatchInfo()
        }
    }

    mounted() {
        this.updateMatchInfo()
    }

    get isToolDisabled() {
        if (!this.fileFilamentType) return true
        if (!this.file.filament_weights) return false

        return this.fileWeight === '0 g'
    }

    get weightVisible() {
        return !!this.file.filament_weights
    }

    get tIndex() {
        const match = this.lane.map.match(/T(\d+)/)
        return match ? parseInt(match[1], 10) : -1
    }

    get fileFilamentType() {
        const types = this.file.filament_type ? this.file.filament_type.split(';') : []
        return types[this.tIndex] || ''
    }

    get fileColor() {
        return this.file.extruder_colors?.[this.tIndex] ?? ''
    }

    get fileWeight() {
        return this.file.filament_weights?.[this.tIndex] ? `${this.file.filament_weights[this.tIndex]} g` : '0 g'
    }

    get isTypeMatch() {
        if (!this.fileFilamentType) return true

        const laneMaterial = this.lane.spool.material.toLowerCase()
        return this.fileFilamentType.toLowerCase() === laneMaterial
    }

    get isWeightSufficient() {
        if (!this.fileWeight) return true

        const fileWeightValue = parseInt(this.fileWeight, 10)
        const spoolWeightValue = parseInt(this.spoolWeight, 10)
        return spoolWeightValue >= fileWeightValue
    }

    get isMatch() {
        return this.isTypeMatch && this.isWeightSufficient
    }

    get toolStatus() {
        if (this.isMatch) {
            return { icon: this.mdiCheck, color: 'success' }
        } else if (!this.lane.load && this.fileWeight) {
            return { icon: this.mdiAlertOutline, color: 'error' }
        } else {
            return { icon: this.mdiAlertOutline, color: 'warning' }
        }
    }

    get spoolmanSpool(): ServerSpoolmanStateSpool {
        if (!this.spoolManagerUrl) {
            return {} as ServerSpoolmanStateSpool
        }

        const spoolId = Number(this.lane?.spool?.spool_id)

        if (spoolId && this.$store.state.server.spoolman.spools) {
            const spool = this.$store.state.server.spoolman.spools.find(
                (spool: ServerSpoolmanStateSpool) => spool.id === spoolId
            )
            return spool || ({} as ServerSpoolmanStateSpool)
        }

        return {} as ServerSpoolmanStateSpool
    }

    get spoolColor() {
        let color = ``

        if (this.spoolManagerUrl && this.spoolmanSpool?.filament?.color_hex) {
            color = `#${this.spoolmanSpool.filament.color_hex}`
        } else {
            color = this.lane.spool?.color ?? '#000'
        }

        return color
    }

    get spoolMaterial() {
        let material = ''

        if (this.spoolManagerUrl && this.spoolmanSpool?.filament?.material) {
            material = this.spoolmanSpool.filament.material
        } else {
            material = this.lane.spool?.material ?? ''
        }

        return material
    }

    get spoolWeight() {
        let weight = 0
        if (this.spoolManagerUrl && this.spoolmanSpool?.remaining_weight) {
            weight = Math.round(this.spoolmanSpool.remaining_weight)
        } else {
            weight = Math.round(this.lane.spool?.weight) ?? 0
        }

        return `${weight} g`
    }

    get getClassForWeight() {
        if (this.isToolDisabled) return ''

        if (!this.lane.load && this.fileWeight) {
            return 'error--text'
        }

        return !this.isWeightSufficient ? 'warning--text' : ''
    }

    get getClassForType() {
        if (this.isToolDisabled) return ''

        if (!this.lane.load && this.fileWeight) {
            return 'error--text'
        }

        return !this.isTypeMatch ? 'warning--text' : ''
    }

    handleMapChange(event: Event, option: string) {
        const gcode = `SET_MAP LANE=${this.lane.name} MAP=${option}`

        this.$nextTick(async () => {
            try {
                await this.$store.dispatch('printer/sendGcode', gcode)
            } catch (error) {
                console.error('Failed to send G-code:', error)
            }

            this.updateMatchInfo()
        })
    }

    updateMatchInfo() {
        this.$emit('match-info', {
            tool: this.lane.map,
            load: this.lane.load,
            disabled: this.isToolDisabled,
            isTypeMatch: this.isTypeMatch,
            isWeightSufficient: this.isWeightSufficient,
        })
    }

    handleToolClick() {
        if (!this.isToolDisabled) {
            this.$emit('tool-clicked', this.lane)
        }
    }
}
</script>

<style scoped>
.lane-item {
    display: flex;
    align-items: center;
    padding: 10px;
}

.map {
    cursor: pointer;
    font-weight: bold;
    margin-right: 5px;
    min-width: 25px;
    max-width: 60px;
}

.lane-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    cursor: pointer;
}

.left-column,
.right-column {
    display: flex;
    align-items: center;
}

.filament-info {
    display: flex;
    flex-direction: column;
    min-width: 60px;
}

.match-status {
    margin-left: 10px;
    max-width: 20px;
    flex: 1;
}

.disabled {
    opacity: 0.5;
    cursor: default;
}
</style>
