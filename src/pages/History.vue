<style scoped></style>

<template>
    <div>
        <v-row>
            <v-col>
                <history-statistics-panel></history-statistics-panel>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <history-reminders-panel></history-reminders-panel>
            </v-col>
        </v-row>
        <v-row class="mt-0">
            <v-col>
                <history-list-panel></history-list-panel>
            </v-col>
        </v-row>
    </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import HistoryListPanel from '@/components/panels/HistoryListPanel.vue'
import HistoryStatisticsPanel from '@/components/panels/HistoryStatisticsPanel.vue'
import HistoryRemindersPanel from '@/components/panels/HistoryRemindersPanel.vue'
@Component({
    components: {
        HistoryStatisticsPanel,
        HistoryListPanel,
        HistoryRemindersPanel,
    },
})
export default class PageHistory extends Mixins(BaseMixin) {}
</script>
