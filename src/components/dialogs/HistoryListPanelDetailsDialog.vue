<template>
    <v-dialog v-model="show" :max-width="600" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.JobDetails').toString()"
            :icon="mdiUpdate"
            card-class="history-detail-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="px-0">
                <overlay-scrollbars style="height: 350px" class="px-6">
                    <v-row>
                        <v-col>{{ $t('History.Filename') }}</v-col>
                        <v-col class="text-right">{{ job.filename }}</v-col>
                    </v-row>
                    <template v-if="'metadata' in job && 'size' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.Filesize') }}</v-col>
                            <v-col class="text-right">{{ formatFilesize(job.metadata.size) }}</v-col>
                        </v-row>
                    </template>
                    <template v-if="'metadata' in job && 'modified' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.LastModified') }}</v-col>
                            <v-col class="text-right">
                                {{ formatDateTime(job.metadata.modified * 1000) }}
                            </v-col>
                        </v-row>
                    </template>
                    <v-divider class="my-3"></v-divider>
                    <v-row>
                        <v-col>{{ $t('History.Status') }}</v-col>
                        <v-col class="text-right">
                            {{
                                $te(`History.StatusValues.${job.status}`, 'en')
                                    ? $t(`History.StatusValues.${job.status}`)
                                    : job.status
                            }}
                        </v-col>
                    </v-row>
                    <v-divider class="my-3"></v-divider>
                    <v-row>
                        <v-col>{{ $t('History.StartTime') }}</v-col>
                        <v-col class="text-right">{{ formatDateTime(job.start_time * 1000) }}</v-col>
                    </v-row>
                    <template v-if="'end_time' in job && job.end_time > 0">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.EndTime') }}</v-col>
                            <v-col class="text-right">
                                {{ formatDateTime(job.end_time * 1000) }}
                            </v-col>
                        </v-row>
                    </template>
                    <template v-if="'metadata' in job && 'estimated_time' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.EstimatedTime') }}</v-col>
                            <v-col class="text-right">
                                {{ formatPrintTime(job.metadata.estimated_time) }}
                            </v-col>
                        </v-row>
                    </template>
                    <template v-if="job.print_duration > 0">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.PrintDuration') }}</v-col>
                            <v-col class="text-right">
                                {{ formatPrintTime(job.print_duration) }}
                            </v-col>
                        </v-row>
                    </template>
                    <template v-if="job.total_duration > 0">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.TotalDuration') }}</v-col>
                            <v-col class="text-right">
                                {{ formatPrintTime(job.total_duration) }}
                            </v-col>
                        </v-row>
                    </template>
                    <template v-if="'metadata' in job && 'filament_total' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.EstimatedFilamentWeight') }}</v-col>
                            <v-col class="text-right">
                                {{ Math.round(job.metadata.filament_weight_total * 100) / 100 }} g
                            </v-col>
                        </v-row>
                    </template>
                    <template v-if="'metadata' in job && 'filament_total' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.EstimatedFilament') }}</v-col>
                            <v-col class="text-right">{{ Math.round(job.metadata.filament_total) }} mm</v-col>
                        </v-row>
                    </template>
                    <template v-if="job.filament_used > 0">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.FilamentUsed') }}</v-col>
                            <v-col class="text-right">{{ Math.round(job.filament_used) }} mm</v-col>
                        </v-row>
                    </template>
                    <template v-if="'metadata' in job && 'first_layer_extr_temp' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.FirstLayerExtTemp') }}</v-col>
                            <v-col class="text-right">{{ job.metadata.first_layer_extr_temp }} °C</v-col>
                        </v-row>
                    </template>
                    <template v-if="'metadata' in job && 'first_layer_bed_temp' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.FirstLayerBedTemp') }}</v-col>
                            <v-col class="text-right">{{ job.metadata.first_layer_bed_temp }} °C</v-col>
                        </v-row>
                    </template>
                    <template v-if="'metadata' in job && 'first_layer_height' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.FirstLayerHeight') }}</v-col>
                            <v-col class="text-right">{{ job.metadata.first_layer_height }} mm</v-col>
                        </v-row>
                    </template>
                    <template v-if="'metadata' in job && 'layer_height' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.LayerHeight') }}</v-col>
                            <v-col class="text-right">{{ job.metadata.layer_height }} mm</v-col>
                        </v-row>
                    </template>
                    <template v-if="'metadata' in job && 'object_height' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.ObjectHeight') }}</v-col>
                            <v-col class="text-right">{{ job.metadata.object_height }} mm</v-col>
                        </v-row>
                    </template>
                    <template v-if="'metadata' in job && 'slicer' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.Slicer') }}</v-col>
                            <v-col class="text-right">{{ job.metadata.slicer }}</v-col>
                        </v-row>
                    </template>
                    <template v-if="'metadata' in job && 'slicer_version' in job.metadata">
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.SlicerVersion') }}</v-col>
                            <v-col class="text-right">{{ job.metadata.slicer_version }}</v-col>
                        </v-row>
                    </template>
                </overlay-scrollbars>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { mdiCloseThick, mdiUpdate } from '@mdi/js'
import { formatFilesize, formatPrintTime } from '@/plugins/helpers'

@Component({
    components: {
        Panel,
        SettingsRow,
    },
})
export default class HistoryListPanelDetailsDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiUpdate = mdiUpdate

    formatFilesize = formatFilesize
    formatPrintTime = formatPrintTime

    @Prop({ required: true, default: false })
    declare readonly show: boolean

    @Prop({ required: true })
    declare job: ServerHistoryStateJob

    get entries() {
        let entries: { name: string; value: string | null; exists: boolean }[] = [
            {
                name: this.$t('History.Filename').toString(),
                value: this.job.filename,
                exists: true,
            },
            {
                name: this.$t('History.Filesize').toString(),
                value: formatFilesize(this.job.metadata.filesize ?? 0),
                exists: (this.job.metadata?.filesize ?? 0) > 0,
            },
            {
                name: this.$t('History.LastModified').toString(),
                value: this.formatDateTime((this.job.metadata.modified ?? 0) * 1000),
                exists: (this.job.metadata?.modified ?? 0) > 0,
            },
            {
                name: this.$t('History.Status').toString(),
                value: this.$te(`History.StatusValues.${this.job.status}`, 'en')
                    ? this.$t(`History.StatusValues.${this.job.status}`).toString()
                    : this.job.status,
                exists: true,
            },
            {
                name: this.$t('History.StartTime').toString(),
                value: this.formatDateTime(this.job.start_time * 1000),
                exists: true,
            },
            {
                name: this.$t('History.EndTime').toString(),
                value: this.formatDateTime(this.job.end_time * 1000),
                exists: this.job.end_time > 0,
            },
            {
                name: this.$t('History.EstimatedTime').toString(),
                value: this.formatPrintTime(this.job.metadata.estimated_time ?? 0),
                exists: 'estimated_time' in this.job.metadata,
            },
            {
                name: this.$t('History.PrintDuration').toString(),
                value: this.formatPrintTime(this.job.print_duration ?? 0),
                exists: this.job.print_duration > 0,
            },
            {
                name: this.$t('History.TotalDuration').toString(),
                value: this.formatPrintTime(this.job.total_duration ?? 0),
                exists: this.job.total_duration > 0,
            },
            {
                name: this.$t('History.EstimatedFilamentWeight').toString(),
                value: `${Math.round((this.job.metadata.filament_weight_total ?? 0) * 100) / 100} g`,
                exists: 'filament_weight_total' in this.job.metadata,
            },
        ]

        return entries.filter((entry) => entry.exists)
    }

    closeDialog() {
        this.$emit('closeDialog')
    }
}
</script>
