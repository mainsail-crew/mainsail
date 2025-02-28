<template>
    <div>
        <v-divider class="mt-3 mb-0" />
        <v-card-text class="py-0 px-2">
            <afc-start-print :file="file" @lanes-match-info="matchData" />
        </v-card-text>
        <v-alert v-for="alert in alerts" :key="alert.text" text :color="alert.color" class="mt-4 mx-3">
            {{ alert.text }}
        </v-alert>
        <v-divider :class="classSecondDivider" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { FileStateGcodefile } from '@/store/files/types'
import AfcStartPrint from '@/components/panels/Afc/AfcStartPrint.vue'

@Component({
    components: { AfcStartPrint },
})
export default class StartPrintDialogAfc extends Mixins(AfcMixin, BaseMixin) {
    @Prop({ required: true }) readonly file!: FileStateGcodefile
    materialMismatches: string[] = []
    weightMismatches: string[] = []
    notLoaded: string[] = []

    get classSecondDivider() {
        const classes = ['mt-4']

        classes.push(this.moonrakerComponents.includes('timelapse') ? 'mb-2' : 'mb-0')

        return classes
    }

    get toolCount() {
        return this.file.filament_weights?.length ?? 0
    }

    matchData(
        lanesMatchInfo: {
            tool: string
            load: boolean
            isTypeMatch: boolean
            isWeightSufficient: boolean
            disabled: boolean
        }[]
    ) {
        const enabledLanes = lanesMatchInfo.filter((info) => !info.disabled)
        this.materialMismatches = enabledLanes.filter((info) => !info.isTypeMatch).map((info) => info.tool)
        this.weightMismatches = enabledLanes.filter((info) => !info.isWeightSufficient).map((info) => info.tool)
        this.notLoaded = enabledLanes.filter((info) => !info.load).map((info) => info.tool)

        this.$emit('tool-count', this.toolCount <= this.lanesData.length)
    }

    get alerts() {
        let alerts = []

        if (this.toolCount > this.lanesData.length) {
            alerts.push({
                text: this.$t('Panels.AfcPanel.NotEnoughTools', {
                    required: this.toolCount,
                    available: this.lanesData.length,
                }),
                color: 'error',
            })
        }

        if (this.notLoaded.length > 0) {
            alerts.push({
                text: this.$t('Panels.AfcPanel.ToolNotLoaded', {
                    lanes: this.notLoaded.join(', '),
                }),
                color: this.file.filament_weights ? 'error' : 'warning',
            })
        }

        if (this.materialMismatches.length > 0) {
            alerts.push({
                text: this.$t('Panels.AfcPanel.FilamentTypeMismatch', {
                    lanes: this.materialMismatches.join(', '),
                }),
                color: 'warning',
            })
        }

        if (this.weightMismatches.length > 0) {
            alerts.push({
                text: this.$t('Panels.AfcPanel.FilamentWeightMismatch', {
                    lanes: this.weightMismatches.join(', '),
                }),
                color: 'warning',
            })
        }

        return alerts
    }
}
</script>
