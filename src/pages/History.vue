<template>
    <div>
        <v-row>
            <v-col>
                <history-statistics-panel />
            </v-col>
        </v-row>
        <v-row class="mt-0">
            <v-col>
                <history-list-panel />
            </v-col>
        </v-row>
    </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import HistoryListPanel from '@/components/panels/HistoryListPanel.vue'
import HistoryStatisticsPanel from '@/components/panels/HistoryStatisticsPanel.vue'
@Component({
    components: {
        HistoryStatisticsPanel,
        HistoryListPanel,
    },
})
export default class PageHistory extends Mixins(BaseMixin) {}
</script>
