<template>
    <div>
        <v-dialog v-model="showDialog" width="800" persistent :fullscreen="isMobile">
            <panel
                :title="$t('Panels.AfcSpoolPanel.ChangeSpool')"
                :icon="mdiAdjust"
                card-class="afc-change-spool-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="close">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>

                <v-card-title>
                    <v-text-field
                        v-if="spoolManagerUrl"
                        v-model="search"
                        :append-icon="mdiMagnify"
                        :label="$t('Panels.AfcSpoolPanel.Search')"
                        outlined
                        dense
                        hide-details
                        style="max-width: 300px" />
                    <v-spacer />
                    <v-tooltip top>
                        <template #activator="{ on: onTooltip, attrs }">
                            <v-btn
                                v-bind="attrs"
                                class="px-2 minwidth-0 ml-3"
                                :loading="loadings.includes('ejectSpool')"
                                v-on="onTooltip"
                                @click="unloadSpool = true">
                                <v-icon>{{ mdiEject }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Panels.AfcSpoolPanel.SpoolEject') }}</span>
                    </v-tooltip>
                    <v-tooltip top>
                        <template #activator="{ on: onTooltip, attrs }">
                            <v-btn
                                v-if="spoolManagerUrl"
                                v-bind="attrs"
                                class="px-2 minwidth-0 ml-3"
                                :loading="loadings.includes('refreshSpools')"
                                v-on="onTooltip"
                                @click="refreshSpools">
                                <v-icon>{{ mdiRefresh }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Panels.AfcSpoolPanel.Refresh') }}</span>
                    </v-tooltip>
                    <v-tooltip top>
                        <template #activator="{ on: onTooltip, attrs }">
                            <v-btn
                                v-if="spoolManagerUrl"
                                v-bind="attrs"
                                class="px-2 minwidth-0 ml-3"
                                v-on="onTooltip"
                                @click="openSpoolManager">
                                <v-icon>{{ mdiDatabase }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Panels.AfcSpoolPanel.OpenSpoolManager') }}</span>
                    </v-tooltip>
                </v-card-title>
                <v-card-text class="px-0 pb-0">
                    <v-data-table
                        v-if="spoolManagerUrl"
                        :headers="headers"
                        :items="spools"
                        item-key="id"
                        :search="search"
                        sort-by="last_used"
                        :sort-desc="true"
                        :custom-filter="customFilter">
                        <template #no-data>
                            <div class="text-center">{{ $t('Panels.AfcSpoolPanel.NoSpools') }}</div>
                        </template>
                        <template #no-results>
                            <div class="text-center">{{ $t('Panels.AfcSpoolPanel.NoResults') }}</div>
                        </template>

                        <template #item="{ item }">
                            <AfcChangeSpoolDialogRow
                                :key="item.id"
                                :spool="item"
                                :max_id_digits="max_spool_id_digits"
                                :loaded_lane="checkLoadedSpool(item.id)"
                                @set-spool="setSpool"
                                @open-spool-details="openSpoolDetails" />
                        </template>
                    </v-data-table>

                    <div v-else>
                        <v-container>
                            <v-row align="center">
                                <!-- Color Picker with Label -->
                                <v-col cols="12" md="6" class="d-flex justify-center align-center">
                                    <div class="color-picker-container">
                                        <label class="color-picker-label">
                                            <h3>{{ $t('Panels.AfcSpoolPanel.SpoolColor') }}</h3>
                                        </label>
                                        <v-color-picker v-model="spoolColor" flat class="color-picker" />
                                    </div>
                                </v-col>

                                <!-- Right Aligned Text Boxes and Button -->
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12">
                                            <v-text-field
                                                v-model="spoolColor"
                                                :label="$t('Panels.AfcSpoolPanel.SpoolColor')"
                                                outlined />
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field
                                                v-model="filamentType"
                                                :label="$t('Panels.AfcSpoolPanel.FilamentType')"
                                                outlined />
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field
                                                v-model="remainingWeight"
                                                :label="$t('Panels.AfcSpoolPanel.RemainingWeight')"
                                                outlined
                                                type="number" />
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                            <v-row class="mt-4">
                                <v-col cols="12">
                                    <v-btn color="primary" block @click="updateSpool">
                                        {{ $t('Panels.AfcSpoolPanel.UpdateSpool') }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-container>
                    </div>
                </v-card-text>
            </panel>
        </v-dialog>

        <!-- UNLOAD SPOOL DIALOG -->
        <v-dialog v-model="unloadSpool" max-width="400">
            <panel
                :title="$t('Panels.AfcSpoolPanel.UnloadSpool')"
                card-class="afc-unload-spool-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="unloadSpool = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">
                        {{ $t('Panels.AfcSpoolPanel.UnloadSpoolQuestion') }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="clearSpoolmanSpool">
                        {{ $t('Panels.AfcSpoolPanel.No') }}
                    </v-btn>
                    <v-btn color="success" text @click="ejectSpool">
                        {{ $t('Panels.AfcSpoolPanel.Yes') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiAdjust, mdiDatabase, mdiMagnify, mdiRefresh, mdiEject } from '@mdi/js'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import AfcChangeSpoolDialogRow from '@/components/dialogs/SpoolmanChangeSpoolDialogRow.vue'
import { Lane } from '@/store/server/afc/types'

@Component({
    components: { AfcChangeSpoolDialogRow, Panel },
})
export default class AfcChangeSpoolDialog extends Mixins(AfcMixin, BaseMixin) {
    @Prop({ type: Object, required: true }) laneData!: Lane
    mdiAdjust = mdiAdjust
    mdiCloseThick = mdiCloseThick
    mdiDatabase = mdiDatabase
    mdiMagnify = mdiMagnify
    mdiRefresh = mdiRefresh
    mdiEject = mdiEject

    filamentType = ''
    remainingWeight = 0
    spoolColor = '#ffffff'
    unloadSpool = false

    @Prop({ required: true }) declare readonly showDialog: boolean

    search = ''

    get spools(): ServerSpoolmanStateSpool[] {
        return this.$store.state.server.spoolman.spools ?? []
    }

    get max_spool_id_digits(): number {
        const max_id = this.$store.state.server.spoolman.spools.reduce(
            (x: number, s: ServerSpoolmanStateSpool) => Math.max(x, s.id),
            0
        )

        return max_id.toString().length
    }

    get headers() {
        return [
            {
                text: ' ',
                align: 'start',
                sortable: false,
            },
            {
                text: this.$t('Panels.AfcSpoolPanel.Filament'),
                align: 'start',
                value: 'filament.name',
                sortable: false,
            },
            {
                text: this.$t('Panels.AfcSpoolPanel.Material'),
                align: 'center',
                value: 'filament.material',
            },
            {
                text: this.$t('Panels.AfcSpoolPanel.LastUsed'),
                align: 'end',
                value: 'last_used',
            },
            {
                text: this.$t('Panels.AfcSpoolPanel.Weight'),
                align: 'end',
                value: 'remaining_weight',
            },
            {
                text: this.$t('Panels.AfcSpoolPanel.SpoolInfo'),
                align: 'center',
                value: '',
                sortable: false,
            },
        ]
    }

    get spoolManagerUrl() {
        return this.$store.state.server.config.config?.spoolman?.server ?? null
    }

    checkLoadedSpool(spoolId: number): number {
        const lane = this.lanesData.find((lane) => lane.spool.spool_id === spoolId.toString())
        return lane ? lane.lane : -1
    }

    updateSpool() {
        console.log('Updating spool with the following data:')
        console.log('Filament Type:', this.filamentType)
        console.log('Remaining Weight:', this.remainingWeight)
        console.log('Spool Color:', this.spoolColor)

        if (this.laneData != null) {
            const cleanedColor = this.spoolColor.replace('#', '')

            const setColor = `SET_COLOR LANE=${this.laneData.name} COLOR=${cleanedColor}`
            const setWeight = `SET_WEIGHT LANE=${this.laneData.name}  WEIGHT=${this.remainingWeight}`
            const setMaterial = `SET_MATERIAL LANE=${this.laneData.name}  MATERIAL=${this.filamentType}`

            this.$nextTick(async () => {
                try {
                    this.$socket.emit('printer.gcode.script', { script: setColor }, { loading: 'macro_' + setColor })
                    this.$socket.emit('printer.gcode.script', { script: setWeight }, { loading: 'macro_' + setWeight })
                    this.$socket.emit(
                        'printer.gcode.script',
                        { script: setMaterial },
                        { loading: 'macro_' + setMaterial }
                    )
                } catch (error) {
                    console.error('Failed to send G-code:', error)
                }
            })

            this.close()
        }
    }

    manualyClearSpool() {
        if (this.laneData != null) {
            const setColor = `SET_COLOR LANE=${this.laneData.name} COLOR=000000`
            const setWeight = `SET_WEIGHT LANE=${this.laneData.name}  WEIGHT=0`
            const setMaterial = `SET_MATERIAL LANE=${this.laneData.name}  MATERIAL=`

            this.$nextTick(async () => {
                try {
                    this.$socket.emit('printer.gcode.script', { script: setColor }, { loading: 'macro_' + setColor })
                    this.$socket.emit('printer.gcode.script', { script: setWeight }, { loading: 'macro_' + setWeight })
                    this.$socket.emit(
                        'printer.gcode.script',
                        { script: setMaterial },
                        { loading: 'macro_' + setMaterial }
                    )
                } catch (error) {
                    console.error('Failed to send G-code:', error)
                }
            })
        }
    }

    openSpoolManager() {
        window.open(this.spoolManagerUrl, '_blank')
    }

    openSpoolDetails(spoolId: string) {
        window.open(this.spoolManagerUrl + '/spool/show/' + spoolId, '_blank')
    }

    mounted() {
        this.refresh()
    }

    refresh() {
        if (this.spoolManagerUrl) {
            this.$store.dispatch('server/spoolman/refreshSpools')
        }
    }

    close() {
        this.$emit('close')
    }

    ejectSpool() {
        if (this.laneData != null) {
            const ejectSpool = `LANE_UNLOAD LANE=${this.laneData.name}`

            this.$nextTick(async () => {
                try {
                    this.$socket.emit(
                        'printer.gcode.script',
                        { script: ejectSpool },
                        { loading: 'macro_' + ejectSpool }
                    )
                } catch (error) {
                    console.error('Failed to send G-code:', error)
                }
            })

            this.clearSpoolmanSpool()
        }
    }

    clearSpoolmanSpool() {
        if (this.laneData != null) {
            const ejectSpoolman = `SET_SPOOL_ID LANE=${this.laneData.name} SPOOL_ID=`

            this.$nextTick(async () => {
                try {
                    this.$socket.emit(
                        'printer.gcode.script',
                        { script: ejectSpoolman },
                        { loading: 'macro_' + ejectSpoolman }
                    )
                } catch (error) {
                    console.error('Failed to send G-code:', error)
                }
            })

            // Spoolman not active manualy clear the spool info
            if (!this.spoolManagerUrl) {
                this.manualyClearSpool()
            }

            this.unloadSpool = false
        }
    }

    refreshSpools() {
        this.$store.dispatch('server/spoolman/refreshSpools')
    }

    customFilter(value: any, search: string, item: ServerSpoolmanStateSpool): boolean {
        if (search.trim().startsWith('web+spoolman:s-')) {
            const spoolId = parseInt(search.split('-')[1] ?? -1)
            return item.id === spoolId
        }

        const querySplits = search.toLowerCase().split(' ')
        const searchArray = [
            item.id.toString(),
            item.comment,
            item.filament.name,
            item.filament.vendor.name,
            item.filament.material,
            item.location,
        ]

        for (const query of querySplits) {
            const result = searchArray.some((q) => q?.toLowerCase().includes(query))

            if (!result) return false
        }

        return true
    }

    setSpool(spool: any) {
        const gcode = `SET_SPOOL_ID LANE=${this.laneData.name} SPOOL_ID=${spool.id}`

        this.$nextTick(async () => {
            try {
                this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'macro_' + gcode })
            } catch (error) {
                console.error('Failed to send G-code:', error)
            }
        })
        this.close()
    }

    initializeFields() {
        if (this.laneData) {
            this.filamentType = this.laneData.spool.material || ''
            this.remainingWeight = this.laneData.spool.weight || 0
            this.spoolColor = this.laneData.spool.color || '#ffffff'
        }
    }

    resetFields() {
        this.filamentType = ''
        this.remainingWeight = 0
        this.spoolColor = '#ffffff'
    }

    @Watch('showDialog')
    onShowDialogChanged(newVal: boolean) {
        if (newVal) {
            if (this.spoolManagerUrl) {
                this.search = ''
            }
        }
    }

    @Watch('laneData', { immediate: true })
    onLaneDataChanged() {
        if (this.showDialog && this.laneData && !this.spoolManagerUrl) {
            this.initializeFields()
        }
    }
}
</script>
<style scoped>
.color-picker-container {
    display: flex;
    flex-direction: column;
    margin: 10px;
}

.color-picker-label {
    font-weight: bold;
    margin-bottom: 8px;
}
</style>
