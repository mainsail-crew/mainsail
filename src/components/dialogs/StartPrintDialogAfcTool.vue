<template>
    <v-row :class="{ 'bt-1': borderTop }" class="px-6">
        <v-col class="d-flex align-center shrink pr-0">
            <v-tooltip v-if="warnings.length" top>
                <template #activator="{ on, attrs }">
                    <v-icon color="warning" v-bind="attrs" v-on="on">{{ mdiAlert }}</v-icon>
                </template>
                <span>{{ warnings.join('\n') }}</span>
            </v-tooltip>
            <v-icon v-else color="success">{{ mdiCheckCircle }}</v-icon>
        </v-col>
        <v-col class="d-flex align-center">
            <span class="mr-3 text-subtitle-1 font-weight-bold">{{ toolName }}</span>
            <gcodefiles-panel-table-row-file-metadata-filaments-badge :filament="fileFilament" />
        </v-col>
        <v-col class="d-flex align-center pr-0">
            <gcodefiles-panel-table-row-file-metadata-filaments-badge
                v-if="laneInfo"
                :filament="laneFilamentBadge"
                :details="laneDetails"
                :label="laneName"
                hide-zero-weight />
            <span v-else class="mr-3 text-subtitle-1 font-weight-bold text-uppercase text--disabled">
                {{ $t('Dialogs.StartPrint.Afc.NoLane') }}
            </span>

            <!-- Lane selector dropdown -->
            <v-menu offset-y left>
                <template #activator="{ on, attrs }">
                    <v-btn v-bind="attrs" icon text ripple class="pr-0" v-on="on">
                        <v-icon>{{ mdiChevronDown }}</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item
                        v-for="option in laneOptions"
                        :key="option.lane"
                        :input-value="option.lane === laneName"
                        color="primary"
                        @click="changeToolMapping(option.lane)">
                        <v-list-item-title>
                            <gcodefiles-panel-table-row-file-metadata-filaments-badge
                                :filament="option.badge"
                                :details="option.details"
                                :label="option.lane"
                                hide-zero-weight>
                                <template #append>
                                    <v-icon v-if="option.lane === laneName" small color="primary" class="ml-2">
                                        {{ mdiCheck }}
                                    </v-icon>
                                </template>
                            </gcodefiles-panel-table-row-file-metadata-filaments-badge>
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FilamentBadgeDetails, FileStateGcodefile } from '@/store/files/types'
import AfcMixin, { AfcSpoolLaneInfo } from '@/components/mixins/afc'
import { mdiAlert, mdiCheck, mdiCheckCircle, mdiChevronDown } from '@mdi/js'
import { convertStringToArray, filamentWeightFormat } from '@/plugins/helpers'

interface LaneOption {
    lane: string
    badge: { color: string; name: string; type: string; weight: number }
    details: FilamentBadgeDetails
}

@Component
export default class StartPrintDialogAfcTool extends Mixins(BaseMixin, AfcMixin) {
    mdiAlert = mdiAlert
    mdiCheck = mdiCheck
    mdiCheckCircle = mdiCheckCircle
    mdiChevronDown = mdiChevronDown

    @Prop({ required: true }) declare readonly file: FileStateGcodefile
    @Prop({ required: true }) declare readonly toolIndex: number
    @Prop({ required: false, default: false }) declare readonly borderTop: boolean

    get toolName() {
        return `T${this.toolIndex}`
    }

    get fileFilament() {
        const fileColors = this.file.filament_colors ?? []
        const fileNames = convertStringToArray(this.file.filament_name ?? '')
        const fileTypes = convertStringToArray(this.file.filament_type ?? '')
        const fileWeights = this.file.filament_weights ?? []

        return {
            color: fileColors[this.toolIndex] ?? '#000000',
            name: fileNames[this.toolIndex] ?? '--',
            type: fileTypes[this.toolIndex] ?? '--',
            weight: fileWeights[this.toolIndex] ?? 0,
        }
    }

    get laneName(): string | undefined {
        return this.afcLanes.find((lane: string) => {
            const laneObj = this.getAfcLaneObject(lane)
            const mappedTool = laneObj?.map

            if (Array.isArray(mappedTool)) {
                return mappedTool.some((t: string) => t.toLowerCase() === this.toolName.toLowerCase())
            }

            return mappedTool?.toLowerCase() === this.toolName.toLowerCase()
        })
    }

    get laneInfo(): AfcSpoolLaneInfo | undefined {
        if (!this.laneName) return undefined

        return this.getAfcLaneInfo(this.laneName)
    }

    get laneFilamentBadge() {
        if (!this.laneInfo) return { color: '', name: '--', type: '--', weight: 0 }

        return {
            color: this.laneInfo.color,
            name: this.laneInfo.filamentName ?? '--',
            type: this.laneInfo.material || '--',
            weight: this.laneInfo.remainingWeight ?? 0,
        }
    }

    get laneDetails(): FilamentBadgeDetails | undefined {
        if (!this.laneInfo) return undefined

        return this.buildLaneDetails(this.laneInfo)
    }

    buildLaneDetails(info: AfcSpoolLaneInfo): FilamentBadgeDetails {
        return {
            spoolId: info.spool ? info.spoolId : undefined,
            vendorName: info.filamentVendor ?? (this.$t('Dialogs.StartPrint.Afc.Unknown') as string),
            filamentName: info.filamentName ?? (this.$t('Dialogs.StartPrint.Afc.Unknown') as string),
            materialDetails: info.spool ? this.buildAfcMaterialDetails(info) : undefined,
            weightsOutput: this.buildAfcWeightsOutput(info),
            material: info.material || undefined,
            remainingWeight: info.remainingWeight,
        }
    }

    get isFilamentTypeValid(): boolean {
        if (!this.laneInfo) return false
        const fileType = this.fileFilament.type.toLowerCase()
        const laneType = (this.laneInfo.material || '--').toLowerCase()

        if (fileType === '--' || laneType === '--') return true

        return laneType.includes(fileType)
    }

    get isFilamentWeightValid(): boolean {
        if (!this.laneInfo) return false
        const fileWeight = this.fileFilament.weight ?? 0
        const laneWeight = this.laneInfo.remainingWeight ?? 0

        if (fileWeight === 0 || laneWeight === 0) return true

        return fileWeight < laneWeight
    }

    get warnings(): string[] {
        const warnings: string[] = []

        if (!this.laneName) {
            warnings.push(
                this.$t('Dialogs.StartPrint.Afc.NoLaneMapped', {
                    tool: this.toolName,
                }) as string
            )
            return warnings
        }

        if (!this.laneInfo?.filamentLoaded) {
            warnings.push(
                this.$t('Dialogs.StartPrint.Afc.LaneNotLoaded', {
                    lane: this.laneName,
                }) as string
            )
            return warnings
        }

        if (!this.isFilamentTypeValid) {
            warnings.push(
                this.$t('Dialogs.StartPrint.Afc.FilamentTypeMismatch', {
                    file: this.fileFilament?.type ?? '--',
                    lane: this.laneInfo?.material || '--',
                }) as string
            )
        }

        if (!this.isFilamentWeightValid) {
            warnings.push(
                this.$t('Dialogs.StartPrint.Afc.FilamentWeightNotEnough', {
                    lane: this.laneName ?? '--',
                    required: filamentWeightFormat(this.fileFilament?.weight ?? 0),
                    available: filamentWeightFormat(this.laneInfo?.remainingWeight ?? 0),
                }) as string
            )
        }

        return warnings
    }

    get laneOptions(): LaneOption[] {
        return this.afcLanes.map((lane: string) => {
            const info = this.getAfcLaneInfo(lane)

            return {
                lane,
                badge: {
                    color: info.color,
                    name: info.filamentName ?? '--',
                    type: info.material || '--',
                    weight: info.remainingWeight ?? 0,
                },
                details: this.buildLaneDetails(info),
            }
        })
    }

    changeToolMapping(lane: string) {
        if (lane === this.laneName) return

        const gcode = `SET_MAP LANE=${lane} MAP=${this.toolName}`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
