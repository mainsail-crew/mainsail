<template>
    <v-expansion-panel>
        <v-expansion-panel-header>
            <div class="unit-header">
                <img
                    v-if="showUnitIcons && validUnitIcon"
                    :src="IconUrl"
                    class="unit-icon"
                    @error="validUnitIcon = false" />
                <div v-else class="pl-10" />
                <h2 class="unit-title">{{ formattedUnitName }}</h2>
                <span v-if="unit.hubs.length > 0" class="hub-container">
                    <strong>{{ $t('Panels.AfcPanel.Hub') }}</strong>
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <span
                                v-bind="attrs"
                                :class="{
                                    'status-light': true,
                                    success: currentHubState,
                                    error: !currentHubState,
                                }"
                                v-on="on"></span>
                        </template>
                        <span>{{ hubStatus }}</span>
                    </v-tooltip>
                </span>
            </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
            <div class="lanes-container">
                <afc-units-item-lane
                    v-for="(lane, index) in unit.lanes"
                    :key="index"
                    :lane="lane"
                    class="lane-card rounded-lg shadow-md overflow-hidden" />
            </div>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import AfcUnitsItemLane from '@/components/panels/Afc/AfcUnitsItemLane.vue'
import { Unit, Hub } from '@/store/server/afc/types'

@Component({
    components: { AfcUnitsItemLane },
})
export default class AfcUnitsItem extends Mixins(AfcMixin, BaseMixin) {
    @Prop({ type: Object, required: true }) readonly unit!: Unit

    currentHubState = false
    validUnitIcon = true
    IconUrl = ''

    get formattedUnitName(): string {
        return String(this.unit.name).replace(/_/g, ' ')
    }

    get hubStatus(): string {
        if (this.currentLoad && this.unit.hubs.some((hub) => hub === this.currentLoad.hub)) {
            this.hubStatusBool(this.currentLoad.hub)
            return this.hubStatusString(this.currentLoad.hub)
        } else if (this.currentLane && this.unit.hubs.some((hub) => hub === this.currentLane.hub)) {
            this.hubStatusBool(this.currentLane.hub)
            return this.hubStatusString(this.currentLane.hub)
        } else {
            this.hubStatusBool(this.unit.hubs[0])
            return this.hubStatusString(this.unit.hubs[0])
        }
    }

    hubStatusString(hub: Hub): string {
        const status = hub.state ? this.$t('Panels.AfcPanel.Detected') : this.$t('Panels.AfcPanel.Empty')
        return `${this.$t('Panels.AfcPanel.HubStatus', { unit: this.formattedUnitName })} - ${status}`
    }

    hubStatusBool(hub: Hub) {
        this.currentHubState = hub.state
    }

    mounted() {
        this.IconUrl = this.unitIcon(this.unit.type)
    }
}
</script>

<style scoped>
.lanes-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    padding-top: 0px;
}

.hub-container {
    text-align: left;
    margin: 20px 0;
    padding-left: 10px;
}

.hub-container strong {
    margin-right: 5px;
}

.unit-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.unit-title {
    font-size: 1.5em;
    margin: 0 0 5px 0;
    text-align: left;
}

.lane-card {
    transition: background-color 0.3s ease;
    padding-top: 0px;
    max-width: 150px;
    min-width: 110px;
    flex: 1 1 110px;
    position: relative;
    text-align: right;
    width: 100%;
}

.theme--dark .lane-card {
    background-color: #2e2e2e;
}

.theme--light .lane-card {
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

.unit-icon {
    max-width: 70px;
    max-height: 70px;
    width: auto;
    height: auto;
    margin-left: 10px;
    object-fit: contain;
}
</style>
