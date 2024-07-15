<template>
    <div>
        <v-card flat>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.AliasTab.AliasName') }}</h3>
                <div v-for="objectName in heaterObjects" :key="objectName">
                    <settings-row :title="convertName(objectName)">
                        <v-text-field v-model="aliasNames[objectName]" hide-details outlined dense></v-text-field>
                    </settings-row>
                    <v-divider class="my-2" />
                </div>
                <div v-for="objectName in temperature_sensors" :key="objectName">
                    <settings-row :title="convertName(objectName)">
                        <v-text-field v-model="aliasNames[objectName]" hide-details outlined dense></v-text-field>
                    </settings-row>
                    <v-divider class="my-2" />
                </div>
                <div v-for="object in miscellaneous" :key="object.name">
                    <settings-row :title="convertName(object.name)">
                        <v-text-field v-model="aliasNames[object.name]" hide-details outlined dense></v-text-field>
                    </settings-row>
                    <v-divider class="my-2" />
                </div>
                <div v-for="object in lights" :key="object.name">
                    <settings-row :title="convertName(object.name)">
                        <v-text-field v-model="aliasNames[object.name]" hide-details outlined dense></v-text-field>
                    </settings-row>
                    <v-divider class="my-2" />
                </div>
                <div v-for="object in filamentSensors" :key="object.name">
                    <settings-row :title="convertName(object.name)">
                        <v-text-field v-model="aliasNames[object.name]" hide-details outlined dense></v-text-field>
                    </settings-row>
                    <v-divider class="my-2" />
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { convertName } from '@/plugins/helpers'
import _ from 'lodash'

@Component({
    methods: { convertName },
    components: {},
})
export default class SettingsAliasTab extends Mixins(BaseMixin) {
    private aliasNames = {}

    @Watch('aliasNames', { deep: true })
    onAliasNames(val: any) {
        val = _.omitBy(val, (value)=>value == null || false || _.isEmpty(value))
        this.$store.dispatch('gui/saveSetting', { name: 'aliasNames', value: val })
    }

    mounted(){
        this.aliasNames = this.$store.state.gui.aliasNames
    }

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
                return !this.formatName(fullName).startsWith('_')
            })
            .sort(this.sortObjectName)
    }

    get heaterObjects() {
        return [...this.filteredHeaters, ...this.temperature_fans]
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

    formatName(name: string) {
        const splits = name.split(' ')
        if (splits.length > 1) return splits[1]
        return name
    }

    get filamentSensors() {
        return this.$store.getters['printer/getFilamentSensors'] ?? []
    }

    get miscellaneous() {
        return this.$store.getters['printer/getMiscellaneous'] ?? []
    }

    get lights() {
        return this.$store.getters['printer/getLights'] ?? []
    }
}
</script>
