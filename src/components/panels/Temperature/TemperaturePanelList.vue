<template>
    <responsive
        :breakpoints="{
            mobile: (el) => el.width <= 395,
        }">
        <template #default="{ el }">
            <v-simple-table class="temperature-panel-table">
                <thead>
                    <tr>
                        <th class="icon">&nbsp;</th>
                        <th class="name">{{ $t('Panels.TemperaturePanel.Name') }}</th>
                        <th v-if="!el.is.mobile" class="state">
                            {{ $t('Panels.TemperaturePanel.State') }}
                        </th>
                        <th class="current">
                            {{ $t('Panels.TemperaturePanel.Current') }}
                        </th>
                        <th class="target">
                            {{ $t('Panels.TemperaturePanel.Target') }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <temperature-panel-list-item
                        v-for="objectName in heaterObjects"
                        :key="objectName"
                        :object-name="objectName"
                        :is-responsive-mobile="el.is.mobile ?? false" />
                    <temperature-panel-list-item-nevermore
                        v-for="objectName in nevermoreObjects"
                        :key="objectName"
                        :object-name="objectName"
                        :is-responsive-mobile="el.is.mobile ?? false" />
                    <temperature-panel-list-item
                        v-for="objectName in temperature_sensors"
                        :key="objectName"
                        :object-name="objectName"
                        :is-responsive-mobile="el.is.mobile ?? false" />
                    <template v-if="!hideMonitors">
                        <temperature-panel-list-item
                            v-for="objectName in monitors"
                            :key="objectName"
                            :object-name="objectName"
                            :is-responsive-mobile="el.is.mobile ?? false" />
                    </template>
                </tbody>
            </v-simple-table>
        </template>
    </responsive>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import TemperaturePanelListItemNevermore from '@/components/panels/Temperature/TemperaturePanelListItemNevermore.vue'

@Component({
    components: { TemperaturePanelListItemNevermore },
})
export default class TemperaturePanelList extends Mixins(BaseMixin) {
    get available_heaters() {
        return this.$store.state.printer?.heaters?.available_heaters ?? []
    }

    get filteredHeaters() {
        return this.filterNamesAndSort(this.available_heaters)
    }

    get available_sensors() {
        return this.$store.state.printer?.heaters?.available_sensors ?? []
    }

    get available_monitors() {
        return this.$store.state.printer?.heaters?.available_monitors ?? []
    }

    get available_nevermores() {
        return Object.keys(this.$store.state.printer).filter((name) => name.startsWith('nevermore'))
    }

    get monitors() {
        return this.available_monitors.sort(this.sortObjectName)
    }

    get temperature_fans() {
        return this.available_sensors
            .filter((name: string) => name.startsWith('temperature_fan') && !name.startsWith('temperature_fan _'))
            .sort(this.sortObjectName)
    }

    get hideMcuHostSensors(): boolean {
        return this.$store.state.gui.view.tempchart.hideMcuHostSensors ?? false
    }

    get hideMonitors(): boolean {
        return this.$store.state.gui.view.tempchart.hideMonitors ?? false
    }

    get temperature_sensors() {
        return this.filterNamesAndSort(this.available_sensors).filter((fullName: string) => {
            if (this.available_heaters.includes(fullName)) return false
            if (this.temperature_fans.includes(fullName)) return false

            // hide MCU & Host sensors, if the function is enabled
            if (this.hideMcuHostSensors && this.checkMcuHostSensor(fullName)) return false

            return true
        })
    }

    get heaterObjects() {
        return [...this.filteredHeaters, ...this.temperature_fans]
    }

    get nevermoreObjects() {
        return this.filterNamesAndSort(this.available_nevermores)
    }

    get settings() {
        return this.$store.state.printer?.configfile?.settings ?? {}
    }

    checkMcuHostSensor(fullName: string) {
        const settingsObject = this.settings[fullName.toLowerCase()] ?? {}
        const sensor_type = settingsObject.sensor_type ?? ''

        return ['temperature_mcu', 'temperature_host'].includes(sensor_type)
    }

    filterNamesAndSort(fullNames: string[]) {
        return fullNames.filter(this.isVisibleName).sort(this.sortObjectName)
    }

    isVisibleName(fullName: string) {
        return !this.shortName(fullName).startsWith('_')
    }

    sortObjectName(a: string, b: string) {
        const nameA = this.shortName(a).toUpperCase()
        const nameB = this.shortName(b).toUpperCase()

        if (nameA < nameB) return -1
        if (nameA > nameB) return 1

        return 0
    }

    shortName(fullName: string) {
        const splits = fullName.split(' ')
        return splits.length == 1 ? splits[0] : splits[1]
    }
}
</script>

<style scoped>
.temperature-panel-table th,
.temperature-panel-table ::v-deep td {
    padding-top: 5px !important;
    padding-bottom: 5px !important;
    height: auto !important;
}

.temperature-panel-table ::v-deep tr:hover {
    background: none !important;
}

.temperature-panel-table ::v-deep .icon {
    width: 24px;
    padding-right: 0 !important;
    text-align: center;
}

.temperature-panel-table ::v-deep .state {
    width: 100px;
    text-align: right !important;
}

.temperature-panel-table ::v-deep .current {
    width: 100px;
    text-align: right !important;
}

.temperature-panel-table ::v-deep .target {
    width: 140px;
}
</style>
