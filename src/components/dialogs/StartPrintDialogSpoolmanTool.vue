<template>
    <v-row :class="{ 'bt-1': borderTop }" class="px-6 py-2">
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
            <span v-if="fileFilamentType" class="text-caption text--secondary">{{ fileFilamentType }}</span>
        </v-col>
        <v-col class="d-flex align-center justify-end">
            <span v-if="spoolDetail" class="mr-2">
                <span
                    class="_extruderColorState mr-1"
                    :style="{ 'background-color': '#' + (spoolDetail.filament?.color_hex ?? '000000') }" />
                {{ spoolDetail.filament?.name ?? '--' }}
                ({{ Math.round(spoolDetail.remaining_weight ?? 0) }}g)
            </span>
            <span v-else class="text--disabled mr-2">{{ $t('Panels.SpoolmanPanel.NoSpool') }}</span>
            <v-btn x-small outlined @click="showChangeSpoolDialog = true">
                {{ $t('Panels.SpoolmanPanel.ChangeSpool') }}
            </v-btn>
        </v-col>
        <spoolman-change-spool-dialog v-model="showChangeSpoolDialog" :tool-index="toolIndex" />
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import { convertStringToArray } from '@/plugins/helpers'
import { mdiAlert, mdiCheckCircle } from '@mdi/js'
import SpoolmanChangeSpoolDialog from '@/components/dialogs/SpoolmanChangeSpoolDialog.vue'

@Component({
    components: { SpoolmanChangeSpoolDialog },
})
export default class StartPrintDialogSpoolmanTool extends Mixins(BaseMixin) {
    mdiAlert = mdiAlert
    mdiCheckCircle = mdiCheckCircle

    @Prop({ required: true }) declare readonly file: FileStateGcodefile
    @Prop({ required: true }) declare readonly toolIndex: number
    @Prop({ required: false, default: false }) declare readonly borderTop: boolean

    showChangeSpoolDialog = false

    get toolName() {
        return `T${this.toolIndex}`
    }

    get spoolId(): number | null {
        return this.$store.state.server.spoolman.tool_spools?.[this.toolIndex] ?? null
    }

    get spoolDetail(): ServerSpoolmanStateSpool | null {
        return this.$store.state.server.spoolman.tool_spool_details?.[this.toolIndex] ?? null
    }

    get fileFilamentType(): string {
        const types = convertStringToArray(this.file.filament_type ?? '')
        return types[this.toolIndex] ?? ''
    }

    get fileFilamentWeight(): number {
        const weights = this.file.filament_weights ?? []
        return weights[this.toolIndex] ?? 0
    }

    get warnings(): string[] {
        const warnings: string[] = []

        if (this.spoolId === null) {
            warnings.push(this.$t('Panels.SpoolmanPanel.NoSpoolSelected') as string)
            return warnings
        }

        // Check filament type mismatch
        const fileType = this.fileFilamentType
        const spoolType = this.spoolDetail?.filament?.material ?? ''
        if (fileType !== '' && spoolType !== '' && fileType.toLowerCase() !== spoolType.toLowerCase()) {
            warnings.push(
                this.$t('Panels.SpoolmanPanel.FilamentTypeMismatch', {
                    fileType,
                    spoolType,
                }) as string
            )
        }

        // Check insufficient weight
        const fileWeight = Math.round(this.fileFilamentWeight)
        const spoolWeight = Math.round(this.spoolDetail?.remaining_weight ?? 0)
        if (fileWeight > 0 && spoolWeight < fileWeight) {
            warnings.push(
                this.$t('Panels.SpoolmanPanel.TooLessFilament', {
                    fileWeight,
                    spoolWeight,
                }) as string
            )
        }

        return warnings
    }
}
</script>

<style scoped>
._extruderColorState {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid lightgray;
}
</style>
