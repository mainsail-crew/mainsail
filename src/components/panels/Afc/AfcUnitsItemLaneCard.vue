<template>
    <div>
        <div class="spool-card-body">
            <v-tooltip v-if="spoolManagerUrl" top>
                <template #activator="{ on: onTooltip, attrs }">
                    <div class="filament-reel" v-bind="attrs" @click="openChangeSpoolDialog(lane)" v-on="onTooltip">
                        <FilamentReelIcon
                            :color="lane.prep ? spoolColor : 'transparent'"
                            :filament="filamentPercentage"
                            style="width: 100%; height: 100%; max-width: inherit; max-height: inherit" />
                    </div>
                </template>
                <span>#{{ lane.spool.spool_id }} | {{ spoolVendor }}</span>
            </v-tooltip>
            <div class="spool-card-info">
                <div v-if="showInfiniteSpool" class="infinite-spool">
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
                                v-for="option in laneList.filter((option) => option !== lane.name)"
                                :key="option"
                                @click="handleRunoutChange($event, option)">
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
                    <div class="spool-info material">
                        {{ spoolMaterial }}
                    </div>
                    <div class="spool-info weight">
                        {{ spoolWeight }}
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showSpoolName" class="spool-info name">{{ spoolName }}</div>
        <afc-change-spool-dialog
            v-if="selectedLane"
            :show-dialog="showChangeSpoolDialog"
            :index="lane.name"
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
import { Lane } from '@/store/server/afc/types'
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

    get showSpoolName(): boolean {
        return this.$store.state.gui.view.afc.showSpoolName ?? true
    }

    get showInfiniteSpool(): boolean {
        return this.$store.state.gui.view.afc.infiniteSpool ?? true
    }

    get spoolManagerUrl() {
        return this.$store.state.server.config.config?.spoolman?.server ?? null
    }

    get active_spool(): ServerSpoolmanStateSpool | null {
        return this.$store.state.server.spoolman.active_spool ?? null
    }

    get spoolmanSpool(): ServerSpoolmanStateSpool {
        if (!this.spoolManagerUrl) {
            return {} as ServerSpoolmanStateSpool
        }

        const spoolId = Number(this.lane?.spool?.spool_id)

        if (this.active_spool && this.active_spool.id === spoolId) {
            return this.active_spool
        }

        if (spoolId && this.$store.state.server.spoolman.spools) {
            const spool = this.$store.state.server.spoolman.spools.find(
                (spool: ServerSpoolmanStateSpool) => spool.id === spoolId
            )
            return spool || ({} as ServerSpoolmanStateSpool)
        }

        return {} as ServerSpoolmanStateSpool
    }

    get filamentPercentage() {
        if (!this.spoolManagerUrl) {
            return 100
        }

        return Math.round((this.spoolmanSpool?.remaining_weight / this.spoolmanSpool?.filament?.weight) * 100) ?? 100
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

    get spoolName() {
        let name = ''

        if (this.spoolManagerUrl && this.spoolmanSpool?.filament?.name) {
            name = this.spoolmanSpool.filament.name
        } else {
            name = ''
        }

        return name
    }

    get spoolVendor() {
        let vendor = ''

        if (this.spoolManagerUrl && this.spoolmanSpool?.filament?.vendor?.name) {
            vendor = this.spoolmanSpool.filament.vendor.name
        } else {
            vendor = ''
        }

        return vendor
    }

    handleRunoutChange(event: Event, option: string) {
        console.log(`Selected value for ${this.lane.name}: ${option}`)

        const gcode = `SET_RUNOUT LANE=${this.lane.name} RUNOUT=${option}`
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

    openChangeSpoolDialog(lane: Lane) {
        this.selectedLane = lane
        this.showChangeSpoolDialog = true
    }
}
</script>
<style scoped>
.spool-card-body {
    display: flex;
    justify-content: space-between;
    padding: 5px;
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

.spool-info.name {
    padding: 0 5px 0 5px;
    text-align: center;
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

.spacer {
    flex-grow: 1;
}
</style>
