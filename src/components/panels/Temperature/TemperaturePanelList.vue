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
                        v-for="objectName in tempObjects"
                        :key="objectName"
                        :object-name="objectName" />
                </tbody>
            </v-simple-table>
        </template>
    </responsive>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class TemperaturePanelList extends Mixins(BaseMixin) {
    get available_heaters() {
        return this.$store.state.printer?.heaters?.available_heaters ?? []
    }

    get filteredHeaters() {
        return this.available_heaters
            .filter((fullName: string) => {
                const splits = fullName.split(' ')
                let name = splits[0]
                if (splits.length > 1) name = splits[1]

                return !name.startsWith('_')
            })
            .sort(this.sortObjectName)
    }

    get available_sensors() {
        return this.$store.state.printer?.heaters?.available_sensors ?? []
    }

    get temperature_fans() {
        return this.available_sensors
            .filter((name: string) => name.startsWith('temperature_fan') && !name.startsWith('temperature_fan _'))
            .sort(this.sortObjectName)
    }

    get temperature_sensors() {
        return this.available_sensors
            .filter((fullName: string) => {
                if (this.available_heaters.includes(fullName)) return false
                if (this.temperature_fans.includes(fullName)) return false

                const splits = fullName.split(' ')
                let name = splits[0]
                if (splits.length > 1) name = splits[1]

                return !name.startsWith('_')
            })
            .sort(this.sortObjectName)
    }

    get tempObjects() {
        return [...this.filteredHeaters, ...this.temperature_fans, ...this.temperature_sensors]
    }

    sortObjectName(a: string, b: string) {
        const splitsA = a.split(' ')
        let nameA = splitsA[0]
        if (splitsA.length > 1) nameA = splitsA[1]
        nameA = nameA.toUpperCase()

        const splitsB = b.split(' ')
        let nameB = splitsB[0]
        if (splitsB.length > 1) nameB = splitsB[1]
        nameB = nameB.toUpperCase()

        if (nameA < nameB) return -1
        if (nameA > nameB) return 1

        return 0
    }
}
</script>

<style lang="scss" scoped>
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
