<template>
    <panel
        v-if="showPanel"
        :title="$t('Panels.AfcPanel.Headline')"
        :collapsible="true"
        :expanded="true"
        card-class="afc-control-panel">
        <template #icon>
            <AFCLogo class="panel-icon" />
        </template>
        <v-expansion-panels v-model="toolExpandedIndex">
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <strong>
                        {{ $t('Panels.AfcPanel.ExtruderTools') }}
                        <span v-if="toolExpandedIndex !== 0" class="text-caption text--disabled pl-1">
                            ( {{ toolCount }} )
                        </span>
                    </strong>
                </v-expansion-panel-header>
                <v-expansion-panel-content class="panel-content">
                    <afc-extruder-tools :tools="toolData" />
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels v-model="unitExpandedIndex" multiple>
            <afc-units :units="unitsData" />
        </v-expansion-panels>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import AFCLogo from '@/components/ui/AFCLogo.vue'
import { mdiAdjust } from '@mdi/js'
import { Extruder, Unit, System } from '@/store/server/afc/types'

@Component({
    components: {
        Panel,
        AFCLogo,
    },
})
export default class AfcPanel extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust

    intervalId: ReturnType<typeof setInterval> | null = null
    toolExpandedIndex: number | null = null
    unitExpandedIndex: number[] = []
    autoExpand: boolean = false

    get showPanel(): boolean {
        return this.klipperReadyForGui /* && Check if AFC is initialized */
    }

    get toolData(): Extruder[] {
        return this.$store.getters['server/afc/getExtruders']
    }

    get toolCount(): number {
        return Object.keys(this.toolData).length
    }

    get unitsData(): Unit[] {
        return this.$store.getters['server/afc/getUnits']
    }

    get systemData(): System | null {
        return this.$store.getters['server/afc/getSystemInfo']
    }

    async fetchAFCData() {
        await this.$store.dispatch('server/afc/fetchAFCData')
        if (!this.autoExpand) {
            this.configureAutoExpand()
        }
    }

    async mounted() {
        this.fetchAFCData()

        this.intervalId = setInterval(this.fetchAFCData, 100)
    }

    beforeDestroy() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    configureAutoExpand() {
        if (Object.keys(this.toolData).length === 1 && this.toolExpandedIndex === null) {
            this.toolExpandedIndex = 0
        }
        if (Object.keys(this.unitsData).length === 1) {
            this.unitExpandedIndex = [0]
            this.autoExpand = true
        }
    }
}
</script>

<style scoped>
.panel-icon {
    width: 24px;
    height: 24px;
    fill: currentColor;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    user-select: none;
    margin-right: 8px;
}
.panel-content {
    padding: 0 5px 16px;
}
</style>
