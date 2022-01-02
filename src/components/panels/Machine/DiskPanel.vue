<style scoped>
    .cursor--pointer {
        cursor: pointer;
    }
</style>

<template>
    <panel :title="$t('Machine.DiskPanel.DiskUsage')" icon="mdi-harddisk" card-class="machine-diskuseage-panel" :collapsible="true" v-if="sdInfo !== null">
        <v-card-text class="px-0 py-2">
            <v-row class="mt-0">
                <v-col class="px-6">
                    <v-progress-linear :value="percent" :height="10"></v-progress-linear>
                </v-col>
            </v-row>
            <v-row class="mt-0 mb-0">
                <v-col class="pl-6 pr-0 pt-1">
                    {{ $t('Machine.DiskPanel.UsedSize', { used: formatUsed }) }}
                </v-col>
                <v-col class="pl-0 pr-6 pt-1 text-right">
                    {{ $t('Machine.DiskPanel.FreeSize', { used: formatFree }) }}
                </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row>
                <v-col class="pl-6 pr-0 py-5">
                    {{ $t('Machine.DiskPanel.Manufacturer') }}
                </v-col>
                <v-col class="pl-0 pr-6 py-5 text-right">
                    {{ manufacturer }}
                </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row>
                <v-col class="pl-6 pr-0 py-5">
                    {{ $t('Machine.DiskPanel.Capacity') }}
                </v-col>
                <v-col class="pl-0 pr-6 py-5 text-right">
                    {{ capacity }}
                </v-col>
            </v-row>
        </v-card-text>
    </panel>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import {formatFilesize} from '@/plugins/helpers'
@Component({
    components: {Panel}
})
export default class DiskPanel extends Mixins(BaseMixin) {

    get sdInfo() {
        return this.$store.state.server?.system_info?.sd_info ?? null
    }

    get directory() {
        return this.$store.getters['files/getDirectory']('gcodes')
    }

    get disk_usage() {
        return this.directory?.disk_usage ?? { used: 0, free: 0, total: 0}
    }

    get percent() {
        return this.disk_usage.total ? 100 / this.disk_usage.total * this.disk_usage.used : 0
    }

    get formatUsed() {
        return formatFilesize(this.disk_usage.used)
    }

    get formatFree() {
        return formatFilesize(this.disk_usage.free)
    }

    get manufacturer() {
        return this.sdInfo?.manufacturer ?? this.$t('Machine.DiskPanel.Unknown')
    }

    get capacity() {
        return this.sdInfo?.capacity ?? this.$t('Machine.DiskPanel.Unknown')
    }


}
</script>