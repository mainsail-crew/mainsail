<template>
    <v-dialog :value="show" :max-width="600" persistent @keydown.esc="close">
        <panel
            :title="$t('History.JobDetails')"
            :icon="mdiUpdate"
            card-class="history-detail-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="px-0">
                <overlay-scrollbars style="height: 350px" class="px-6">
                    <history-details-dialog-entry v-for="field in fields" :key="field.key" :job="job" :field="field" />
                </overlay-scrollbars>
            </v-card-text>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { mdiCloseThick, mdiUpdate } from '@mdi/js'
import { formatFilesize, formatPrintTime } from '@/plugins/helpers'
import { TranslateResult } from 'vue-i18n'

export interface HistoryDetailsField {
    key: string
    label: string | TranslateResult
    metadata?: boolean
    unit?: string
    format?: (value: any) => string | TranslateResult
}

@Component
export default class HistoryDetailsDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiUpdate = mdiUpdate

    @Prop({ type: Boolean, required: true }) show!: boolean
    @Prop({ type: Object, required: true }) job!: ServerHistoryStateJob

    get fields(): HistoryDetailsField[] {
        return [
            {
                key: 'filename',
                label: this.$t('History.Filename'),
            },
            {
                key: 'size',
                label: this.$t('History.Filesize'),
                metadata: true,
                format: (value: number) => formatFilesize(value),
            },
            {
                key: 'modified',
                label: this.$t('History.LastModified'),
                metadata: true,
                format: (value: number) => this.formatDateTime(value * 1000),
            },
            {
                key: 'status',
                label: this.$t('History.Status'),
                format: (value: string) =>
                    this.$te(`History.StatusValues.${value}`, 'en') ? this.$t(`History.StatusValues.${value}`) : value,
            },
            {
                key: 'end_time',
                label: this.$t('History.EndTime'),
                format: (value: number) => this.formatDateTime(value * 1000),
            },
            {
                key: 'estimated_time',
                label: this.$t('History.EstimatedTime'),
                metadata: true,
                format: (value: number) => formatPrintTime(value),
            },
            {
                key: 'print_duration',
                label: this.$t('History.PrintDuration'),
                metadata: true,
                format: (value: number) => formatPrintTime(value),
            },
            {
                key: 'total_duration',
                label: this.$t('History.TotalDuration'),
                metadata: true,
                format: (value: number) => formatPrintTime(value),
            },
            {
                key: 'filament_weight_total',
                label: this.$t('History.EstimatedFilamentWeight'),
                metadata: true,
                unit: 'g',
                format: (value: number) => value?.toFixed(2),
            },
            {
                key: 'filament_total',
                label: this.$t('History.EstimatedFilament'),
                metadata: true,
                unit: 'mm',
                format: (value: number) => value?.toFixed(0),
            },
            {
                key: 'filament_used',
                label: this.$t('History.FilamentUsed'),
                metadata: true,
                unit: 'mm',
                format: (value: number) => value?.toFixed(0),
            },
            {
                key: 'first_layer_extr_temp',
                label: this.$t('History.FirstLayerExtTemp'),
                metadata: true,
                unit: '°C',
            },
            {
                key: 'first_layer_bed_temp',
                label: this.$t('History.FirstLayerBedTemp'),
                metadata: true,
                unit: '°C',
            },
            {
                key: 'first_layer_height',
                label: this.$t('History.FirstLayerHeight'),
                metadata: true,
                unit: 'mm',
            },
            {
                key: 'layer_height',
                label: this.$t('History.LayerHeight'),
                metadata: true,
                unit: 'mm',
            },
            {
                key: 'object_height',
                label: this.$t('History.ObjectHeight'),
                metadata: true,
                unit: 'mm',
            },
            {
                key: 'slicer',
                label: this.$t('History.Slicer'),
                metadata: true,
            },
            {
                key: 'slicer_version',
                label: this.$t('History.SlicerVersion'),
                metadata: true,
            },
        ]
    }

    close() {
        this.$emit('close')
    }
}
</script>
<style scoped>
::v-deep .history-details-dialog-entry + .history-details-dialog-entry {
    margin-top: 1em;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.theme--light ::v-deep .history-details-dialog-entry {
    border-top-color: rgba(0, 0, 0, 0.12);
}
</style>
