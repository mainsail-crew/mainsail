<template>
    <div>
        <div style="width: 100%">
            <v-checkbox
                v-if="lanesMatchInfo.some((lane) => lane.disabled)"
                v-model="showUnusedTools"
                :label="$t('Panels.AfcPanel.ShowUnusedTools')"
                dense
                hide-details
                class="mb-2" />
            <v-divider class="mt-0 mb-0" />
            <div class="header-row pb-2 pt-2 d-flex align-center">
                <span class="align-left pl-10 ml-7">{{ $t('Panels.AfcPanel.File') }}</span>
                <span class="spacer" style="min-width: 100px"></span>
                <span class="align-right pr-10 mr-6">{{ $t('Panels.AfcPanel.Tools') }}</span>
            </div>
            <v-divider class="mt-0 mb-0" />
            <div :class="{ 'lanes-container': lanesData.length > 4 }">
                <afc-start-print-item
                    v-for="(lane, index) in lanesData"
                    :key="index"
                    :lane="lane"
                    :file="file"
                    :show-unused-tools="showUnusedTools"
                    @tool-clicked="handleToolClicked"
                    @match-info="updateLaneMatchInfo" />
            </div>
        </div>
        <afc-change-spool-dialog
            v-if="selectedLane"
            :show-dialog="showChangeSpoolDialog"
            :index="selectedLane.name"
            :lane-data="selectedLane"
            @close="showChangeSpoolDialog = false" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import { Lane } from '@/store/server/afc/types'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import AfcStartPrintItem from '@/components/panels/Afc/AfcStartPrintItem.vue'
import AfcChangeSpoolDialog from '@/components/dialogs/AfcChangeSpoolDialog.vue'

@Component({
    components: { AfcChangeSpoolDialog, AfcStartPrintItem },
})
export default class AfcStartPrint extends Mixins(AfcMixin, BaseMixin) {
    @Prop({ type: Object, required: true }) readonly file!: File
    showChangeSpoolDialog = false
    selectedLane: Lane | null = null
    lanesMatchInfo: {
        tool: string
        load: boolean
        disabled: boolean
        isTypeMatch: boolean
        isWeightSufficient: boolean
    }[] = []
    showUnusedTools = false

    handleToolClicked(lane: Lane) {
        this.selectedLane = lane
        this.showChangeSpoolDialog = true
    }

    updateLaneMatchInfo(data: {
        tool: string
        load: boolean
        disabled: boolean
        isTypeMatch: boolean
        isWeightSufficient: boolean
    }) {
        const index = this.lanesMatchInfo.findIndex((item) => item.tool === data.tool)
        if (data.isTypeMatch && data.isWeightSufficient && !data.disabled) {
            // Remove the lane from the list if it no longer has a mismatch
            if (index !== -1) {
                this.lanesMatchInfo.splice(index, 1)
            }
        } else {
            // Update the lane info if it has a mismatch
            if (index !== -1) {
                this.lanesMatchInfo.splice(index, 1, data)
            } else {
                this.lanesMatchInfo.push(data)
            }
        }
        this.$emit('lanes-match-info', this.lanesMatchInfo)
    }
}
</script>

<style scoped>
.header-row {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
}

.header-column {
    flex: 1;
    text-align: center;
}

.lanes-container {
    max-height: 330px;
    overflow-y: auto;
}
</style>
