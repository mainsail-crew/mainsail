<template>
    <v-row :class="{ 'bt-1': borderTop }" class="px-6">
        <v-col class="d-flex align-center shrink pr-0">
            <v-tooltip v-if="warnings.length" top max-width="300">
                <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                        <v-icon color="warning">{{ mdiAlert }}</v-icon>
                    </span>
                </template>
                <div v-for="(warning, i) in warnings" :key="i" :class="{ 'mb-1': i < warnings.length - 1 }">
                    {{ warning }}
                </div>
            </v-tooltip>
            <v-icon v-else color="success">{{ mdiCheckCircle }}</v-icon>
        </v-col>
        <v-col class="d-flex align-center">
            <span class="mr-3 text-subtitle-1 font-weight-bold">{{ toolName }}</span>
            <gcodefiles-panel-table-row-file-metadata-filaments-badge :filament="fileFilament" />
        </v-col>
        <v-col class="d-flex align-center pr-0">
            <v-tooltip v-if="laneInfo" :disabled="!hasLaneTooltipContent" top max-width="280">
                <template #activator="{ on, attrs }">
                    <span class="d-flex align-center" v-bind="attrs" v-on="on">
                        <span class="mr-2 text-subtitle-1 font-weight-bold text-uppercase" style="padding-right: 4px">
                            {{ laneName }}
                        </span>
                        <div class="d-flex flex-column align-center mx-1">
                            <v-chip
                                v-if="laneFilamentBadge.color"
                                x-small
                                :color="laneFilamentBadge.color"
                                :style="{ color: laneFilamentBadgeTextColor }">
                                {{ laneFilamentBadge.weight > 0 ? filamentWeightFormat(laneFilamentBadge.weight) : '' }}
                            </v-chip>
                            <small v-if="laneFilamentBadge.type" class="type mt-1">{{ laneFilamentBadge.type }}</small>
                        </div>
                    </span>
                </template>
                <div v-if="laneInfo.spool">
                    <div class="font-weight-bold">
                        #{{ laneInfo.spoolId }} | {{ laneInfo.filamentVendor ?? $t('Dialogs.StartPrint.Afc.Unknown') }}
                    </div>
                    <div>{{ laneInfo.filamentName ?? $t('Dialogs.StartPrint.Afc.Unknown') }}</div>
                    <div v-if="laneInfo.material">{{ laneSpoolMaterialDetails }}</div>
                    <div v-if="laneWeightsOutput !== undefined">{{ laneWeightsOutput }}</div>
                </div>
                <div v-else>
                    <div v-if="laneInfo.material">{{ laneInfo.material }}</div>
                    <div v-if="laneInfo.remainingWeight !== undefined">
                        {{ $t('Panels.AfcPanel.WeightRemaining', { weight: Math.round(laneInfo.remainingWeight) }) }}
                    </div>
                </div>
            </v-tooltip>
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
                        <v-tooltip :disabled="!option.hasContent" top max-width="280">
                            <template #activator="{ on, attrs }">
                                <v-list-item-title class="d-flex align-center" v-bind="attrs" v-on="on">
                                    <span class="mr-2 text-subtitle-1 font-weight-bold text-uppercase">
                                        {{ option.lane }}
                                    </span>
                                    <div class="d-flex flex-column align-center mx-1">
                                        <v-chip
                                            v-if="option.badge.color"
                                            x-small
                                            :color="option.badge.color"
                                            :style="{ color: option.badgeTextColor }">
                                            {{
                                                option.badge.weight > 0 ? filamentWeightFormat(option.badge.weight) : ''
                                            }}
                                        </v-chip>
                                        <small v-if="option.badge.type" class="type mt-1">
                                            {{ option.badge.type }}
                                        </small>
                                    </div>
                                    <v-icon v-if="option.lane === laneName" small color="primary" class="ml-2">
                                        {{ mdiCheck }}
                                    </v-icon>
                                </v-list-item-title>
                            </template>
                            <div v-if="option.spoolId">
                                <div class="font-weight-bold">#{{ option.spoolId }} | {{ option.vendorName }}</div>
                                <div>{{ option.filamentName }}</div>
                                <div v-if="option.materialDetails">{{ option.materialDetails }}</div>
                                <div v-if="option.weightsOutput">{{ option.weightsOutput }}</div>
                            </div>
                            <div v-else>
                                <div v-if="option.material">{{ option.material }}</div>
                                <div v-if="option.remainingWeight !== undefined">
                                    {{
                                        $t('Panels.AfcPanel.WeightRemaining', {
                                            weight: Math.round(option.remainingWeight),
                                        })
                                    }}
                                </div>
                            </div>
                        </v-tooltip>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import AfcMixin, { AfcSpoolLaneInfo } from '@/components/mixins/afc'
import { mdiAlert, mdiCheck, mdiCheckCircle, mdiChevronDown } from '@mdi/js'
import { convertStringToArray, filamentTextColor, filamentWeightFormat } from '@/plugins/helpers'

interface LaneOption {
    lane: string
    spoolId: number | null
    badge: { color: string; name: string; type: string; weight: number }
    badgeTextColor: string
    material: string
    vendorName: string
    filamentName: string
    materialDetails: string
    weightsOutput: string | undefined
    remainingWeight: number | undefined
    hasContent: boolean
}

@Component
export default class StartPrintDialogAfcTool extends Mixins(BaseMixin, AfcMixin) {
    mdiAlert = mdiAlert
    mdiCheck = mdiCheck
    mdiCheckCircle = mdiCheckCircle
    mdiChevronDown = mdiChevronDown
    filamentWeightFormat = filamentWeightFormat

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

    get laneFilamentBadgeTextColor(): string {
        return this.laneFilamentBadge.color ? filamentTextColor(this.laneFilamentBadge.color) : ''
    }

    get hasLaneTooltipContent(): boolean {
        if (!this.laneInfo) return false
        if (this.laneInfo.spool) return true

        return !!this.laneInfo.material || this.laneInfo.remainingWeight !== undefined
    }

    get laneSpoolMaterialDetails(): string {
        if (!this.laneInfo) return '--'

        const parts = [this.laneInfo.material || '--']
        if (this.laneInfo.extruderTemp !== undefined) parts.push(`${this.laneInfo.extruderTemp}°C`)
        if (this.laneInfo.bedTemp !== undefined) parts.push(`${this.laneInfo.bedTemp}°C`)

        return parts.join(' | ')
    }

    get laneWeightsOutput(): string | undefined {
        if (!this.laneInfo || this.laneInfo.remainingWeight === undefined) return undefined

        const parts = [
            this.$t('Panels.AfcPanel.WeightRemaining', {
                weight: Math.round(this.laneInfo.remainingWeight),
            }).toString(),
        ]

        if (this.laneInfo.usedWeight !== undefined) {
            parts.push(
                this.$t('Panels.AfcPanel.WeightUsed', {
                    weight: Math.round(this.laneInfo.usedWeight),
                }).toString()
            )
        }

        return parts.join(' | ')
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
            const material = info.material || ''
            const remainingWeight = info.remainingWeight
            const hasContent = info.spool != null || !!material || remainingWeight !== undefined
            const badgeColor = info.color

            const materialParts = [material || '--']
            if (info.extruderTemp !== undefined) materialParts.push(`${info.extruderTemp}°C`)
            if (info.bedTemp !== undefined) materialParts.push(`${info.bedTemp}°C`)

            const weightParts: string[] = []
            if (remainingWeight !== undefined) {
                weightParts.push(
                    this.$t('Panels.AfcPanel.WeightRemaining', {
                        weight: Math.round(remainingWeight),
                    }).toString()
                )
            }
            if (info.usedWeight !== undefined) {
                weightParts.push(
                    this.$t('Panels.AfcPanel.WeightUsed', {
                        weight: Math.round(info.usedWeight),
                    }).toString()
                )
            }

            return {
                lane,
                spoolId: info.spoolId ?? null,
                badge: {
                    color: badgeColor,
                    name: info.filamentName ?? '--',
                    type: material || '--',
                    weight: remainingWeight ?? 0,
                },
                badgeTextColor: badgeColor ? filamentTextColor(badgeColor) : '',
                material,
                vendorName: info.filamentVendor ?? (this.$t('Dialogs.StartPrint.Afc.Unknown') as string),
                filamentName: info.filamentName ?? (this.$t('Dialogs.StartPrint.Afc.Unknown') as string),
                materialDetails: info.spool ? materialParts.join(' | ') : '',
                weightsOutput: weightParts.length > 0 ? weightParts.join(' | ') : undefined,
                remainingWeight,
                hasContent,
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

<style scoped>
.type {
    font-size: 0.7rem;
    line-height: 1;
}
</style>
