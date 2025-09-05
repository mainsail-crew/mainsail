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
            <span class="mr-3 text-subtitle-1 font-weight-bold text-uppercase">{{ laneName }}</span>
            <gcodefiles-panel-table-row-file-metadata-filaments-badge :filament="laneFilament" />
            <v-menu offset-y left>
                <template #activator="{ on, attrs }">
                    <v-btn v-bind="attrs" icon text ripple class="pr-0" v-on="on">
                        <v-icon>{{ mdiChevronDown }}</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item
                        v-for="lane in afcLanes"
                        :key="lane"
                        :disabled="lane === laneName"
                        @click="changeToolMapping(lane)">
                        <span class="mr-3 text-subtitle-1 font-weight-bold text-uppercase">{{ lane }}</span>
                        <gcodefiles-panel-table-row-file-metadata-filaments-badge
                            :filament="getAfcLaneFilament(lane)" />
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
import AfcMixin from '@/components/mixins/afc'
import { mdiAlert, mdiCheckCircle, mdiChevronDown } from '@mdi/js'
import { filamentWeightFormat } from '@/plugins/helpers'

@Component
export default class StartPrintDialogAfc extends Mixins(BaseMixin, AfcMixin) {
    mdiAlert = mdiAlert
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
        const fileNames = (this.file.filament_name ?? '').replace(/"/g, '').split(';')
        const fileTypes = (this.file.filament_type ?? '').split(';')
        const fileWeights = this.file.filament_weights ?? []

        return {
            color: fileColors[this.toolIndex] ?? '#000000',
            name: fileNames[this.toolIndex] ?? '--',
            type: fileTypes[this.toolIndex] ?? '--',
            weight: fileWeights[this.toolIndex],
        }
    }

    get laneName() {
        const lanes = this.afc?.lanes ?? []

        return lanes.find((lane: string) => {
            const laneObject = this.getAfcLaneObject(lane)
            const mappedTool = laneObject?.map?.toLowerCase()

            return mappedTool === this.toolName.toLowerCase()
        })
    }

    get laneFilament() {
        return this.getAfcLaneFilament(this.laneName ?? '')
    }

    get isFilamentTypeValid() {
        return this.fileFilament?.type?.toLowerCase() === this.laneFilament?.type?.toLowerCase()
    }

    get isFilamentWeightValid() {
        return this.fileFilament.weight < this.laneFilament.weight
    }

    get warnings() {
        const warnings: string[] = []

        if (!this.isFilamentTypeValid) {
            warnings.push(
                this.$t('Dialogs.StartPrint.Afc.FilamentTypeMismatch', {
                    file: this.fileFilament?.type ?? '--',
                    lane: this.laneFilament?.type ?? '--',
                }) as string
            )
        }

        if (!this.isFilamentWeightValid) {
            warnings.push(
                this.$t('Dialogs.StartPrint.Afc.FilamentWeightNotEnough', {
                    lane: this.laneName ?? '--',
                    required: filamentWeightFormat(this.fileFilament?.weight ?? 0),
                    available: filamentWeightFormat(this.laneFilament?.weight ?? 0),
                }) as string
            )
        }

        return warnings
    }

    changeToolMapping(lane: string) {
        const gcode = `SET_MAP LANE=${lane} MAP=${this.toolName}`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
