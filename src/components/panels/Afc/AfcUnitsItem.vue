<template>
    <v-expansion-panel>
        <v-expansion-panel-header>
            <div class="unit-header" style="display: flex; align-items: center; gap: 10px">
                <BoxTurtleIcon v-if="unit.system.type === 'Box_Turtle'" class="box-turtle-icon" />
                <h2 class="unit-title" style="margin: 0">{{ String(unitName).replace(/_/g, ' ') }} |</h2>
                <span class="hub-container">
                    <strong>{{ $t('Panels.AfcPanel.Hub') }}</strong>
                    <span
                        :class="{
                            'status-light': true,
                            success: getHubStatus({ unitName }),
                            error: !getHubStatus({ unitName }),
                        }"></span>
                </span>
            </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
            <div class="spool-container">
                <afc-units-item-lane
                    v-for="(spool, index) in unit.spools"
                    :key="index"
                    :spool="spool"
                    :unit="unit"
                    class="spool-card rounded-lg shadow-md overflow-hidden" />
            </div>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcUnitsItemLane from '@/components/panels/Afc/AfcUnitsItemLane.vue'
import BoxTurtleIcon from '@/components/ui/BoxTurtleIcon.vue'

@Component({
    components: { AfcUnitsItemLane, BoxTurtleIcon },
})
export default class AfcUnitsItem extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly unit!: Record<string, any>
    @Prop({ type: String, required: true }) readonly unitName!: string

    getHubStatus({ unitName }: { unitName: any }) {
        if (this.unit?.system?.hub_loaded !== undefined) {
            return this.unit.system.hub_loaded
        }
    }
}
</script>

<style scoped>
.spool-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    padding-top: 0px;
}

.hub-container {
    text-align: left;
    margin: 20px 0;
}

.hub-container strong {
    margin-right: 5px;
}

.unit-title {
    font-size: 1.5em;
    margin-bottom: 16px;
    text-align: left;
}

.spool-card {
    transition: background-color 0.3s ease;
    padding-top: 0px;
    max-width: 150px;
    min-width: 110px;
    min-height: 150px;
    flex: 1 1 110px;
    position: relative;
    text-align: right;
    width: 100%;
}

.theme--dark .spool-card {
    background-color: #2e2e2e;
}

.theme--light .spool-card {
    background-color: #ebebeb;
}

.status-light {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
    margin-left: 5px;
}

.box-turtle-icon {
    width: 70px;
    height: 70px;
    margin-left: 10px;
}

.lane-status {
    margin-right: 10px;
    margin-left: 5px;
}
</style>
