<template>
    <v-card-text>
        <h3 class="text-h5 mb-3">{{ $t('Settings.TempgroupsTab.EditGroup') }}</h3>
        <settings-row :title="$t('Settings.TempgroupsTab.Name')">
            <v-text-field
                v-model="groupName"
                hide-details="auto"
                :rules="[rules.required, rules.groupUnique]"
                dense
                outlined></v-text-field>
        </settings-row>
        <v-divider class="my-2"></v-divider>
        <settings-row :title="$t('Settings.TempgroupsTab.ShowChart')">
            <v-checkbox v-model="showChart" hide-details class="mt-0"></v-checkbox>
        </settings-row>
        <v-divider class="my-2"></v-divider>
        <h3 class="text-h5 mt-6 mb-3">{{ $t('Settings.TempgroupsTab.GroupSensors') }}</h3>
        <template v-if="sensorsList.length">
            <draggable
                v-model="sensorsList"
                handle=".handle"
                ghost-class="ghost"
                group="sensors"
                :force-fallback="true"
                @end="updateSensorOrder">
                <v-row
                    v-for="(sensor, index) in sensorsList"
                    :key="sensor.name"
                    class="my-2 mx-0"
                    :style="draggableBgStyle">
                    <v-col class="col-auto pr-0 d-flex py-2">
                        <v-icon class="handle">{{ mdiDragVertical }}</v-icon>
                    </v-col>
                    <v-col class="py-2">
                        <settings-row
                            :key="'groupSensor_' + index"
                            :title="sensor.displayName || formatSensorName(sensor.name)"
                            :sub-title="sensor.displayName ? sensor.name : null"
                            :dynamic-slot-width="true">
                            <v-tooltip top>
                                <template #activator="{ on, attrs }">
                                    <v-btn
                                        small
                                        outlined
                                        v-bind="attrs"
                                        class="ml-3 minwidth-0 px-2"
                                        v-on="on"
                                        @click="editSensorDisplayName(sensor)">
                                        <v-icon small>{{ mdiPencil }}</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{ $t('Settings.TempgroupsTab.EditDisplayName') }}</span>
                            </v-tooltip>
                            <v-tooltip top>
                                <template #activator="{ on, attrs }">
                                    <v-btn
                                        small
                                        outlined
                                        v-bind="attrs"
                                        class="ml-3 minwidth-0 px-2"
                                        color="error"
                                        v-on="on"
                                        @click="removeSensor(sensor)">
                                        <v-icon small>{{ mdiDelete }}</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{ $t('Settings.TempgroupsTab.RemoveSensor') }}</span>
                            </v-tooltip>
                        </settings-row>
                    </v-col>
                </v-row>
            </draggable>
        </template>
        <template v-else>
            <v-row>
                <v-col>
                    <p class="mb-0 text-center font-italic">{{ $t('Settings.TempgroupsTab.NoSensorsInGroup') }}</p>
                </v-col>
            </v-row>
        </template>
        <v-row class="mt-6 mb-3 flex-column flex-md-row">
            <v-col class="py-0 align-content-center mb-3 mb-md-0">
                <h3 class="text-h5">{{ $t('Settings.TempgroupsTab.AvailableSensors') }}</h3>
            </v-col>
            <v-col class="py-0">
                <v-text-field
                    v-model="searchSensors"
                    :append-icon="mdiMagnify"
                    :label="$t('Settings.TempgroupsTab.Search')"
                    single-line
                    outlined
                    clearable
                    hide-details
                    dense />
            </v-col>
        </v-row>
        <template v-if="filteredAvailableSensors.length">
            <template v-for="(sensor, index) in filteredAvailableSensors">
                <v-divider v-if="index" :key="'availableSensor_divider_' + index" class="my-2"></v-divider>
                <settings-row
                    :key="'availableSensor_' + index"
                    :title="formatSensorName(sensor)"
                    :sub-title="sensor"
                    :dynamic-slot-width="true">
                    <v-btn small outlined class="ml-3" @click="addSensor(sensor)">
                        <v-icon left small>{{ mdiPlus }}</v-icon>
                        {{ $t('Settings.TempgroupsTab.Add') }}
                    </v-btn>
                </settings-row>
            </template>
        </template>
        <template v-else>
            <v-row>
                <v-col>
                    <p class="mb-0 text-center font-italic">{{ $t('Settings.TempgroupsTab.NoAvailableSensors') }}</p>
                </v-col>
            </v-row>
        </template>
        <v-card-actions class="d-flex justify-end mt-3 px-0">
            <v-btn text @click="close">{{ $t('Buttons.Close') }}</v-btn>
        </v-card-actions>

        <v-dialog v-model="displayNameDialog" max-width="400" persistent>
            <v-card>
                <v-card-title>{{ $t('Settings.TempgroupsTab.EditDisplayName') }}</v-card-title>
                <v-card-text>
                    <v-text-field
                        v-model="editingDisplayName"
                        :label="$t('Settings.TempgroupsTab.DisplayName')"
                        :placeholder="formatSensorName(editingSensorName)"
                        outlined
                        dense
                        hide-details
                        clearable></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="cancelDisplayNameEdit">{{ $t('Buttons.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="saveDisplayName">{{ $t('Buttons.Save') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import ThemeMixin from '@/components/mixins/theme'
import draggable from 'vuedraggable'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { GuiTempgroup, GuiTempgroupSensor } from '@/store/gui/tempgroups/types'
import { mdiDelete, mdiDragVertical, mdiMagnify, mdiPencil, mdiPlus } from '@mdi/js'
import { Debounce } from 'vue-debounce-decorator'

@Component({
    components: { SettingsRow, draggable },
})
export default class SettingsTempgroupsTabEdit extends Mixins(BaseMixin, ThemeMixin) {
    @Prop({ required: true }) readonly groupId!: string | null

    mdiPencil = mdiPencil
    mdiDelete = mdiDelete
    mdiDragVertical = mdiDragVertical
    mdiPlus = mdiPlus
    mdiMagnify = mdiMagnify

    private rules = {
        required: (value: string) => value !== '' || this.$t('Settings.TempgroupsTab.NameRequired'),
        groupUnique: (value: string) => !this.existsGroupName(value) || this.$t('Settings.TempgroupsTab.NameExists'),
    }

    private searchSensors: string = ''
    private displayNameDialog = false
    private editingSensorName: string = ''
    private editingDisplayName: string = ''
    private sensorsList: GuiTempgroupSensor[] = []

    @Watch('groupSensors', { immediate: true })
    onGroupSensorsChanged(newVal: GuiTempgroupSensor[]) {
        this.sensorsList = [...newVal]
    }

    @Watch('group', { immediate: true })
    onGroupChanged(newVal: GuiTempgroup | null) {
        this.localGroupName = newVal?.name ?? ''
    }

    get group(): GuiTempgroup | null {
        if (!this.groupId) return null
        return this.$store.getters['gui/tempgroups/getGroup'](this.groupId)
    }

    private localGroupName: string = ''

    get groupName(): string {
        return this.localGroupName
    }

    set groupName(newVal: string) {
        this.localGroupName = newVal
        this.updateGroupNameDebounced(newVal)
    }

    @Debounce(250)
    updateGroupNameDebounced(newVal: string) {
        if (!this.groupId) return
        if (newVal.trim() === '' || this.existsGroupName(newVal)) return
        this.$store.dispatch('gui/tempgroups/groupUpdate', {
            id: this.groupId,
            values: { name: newVal },
        })
    }

    get showChart(): boolean {
        return this.group?.showChart ?? true
    }

    set showChart(newVal: boolean) {
        if (!this.groupId) return
        this.$store.dispatch('gui/tempgroups/groupUpdate', {
            id: this.groupId,
            values: { showChart: newVal },
        })
    }

    get groupSensors(): GuiTempgroupSensor[] {
        if (!this.group?.sensors) return []
        return [...this.group.sensors].sort((a, b) => a.pos - b.pos)
    }

    get allGroups(): GuiTempgroup[] {
        return this.$store.getters['gui/tempgroups/getSortedGroups'] ?? []
    }

    get allSensors(): string[] {
        const sensors: string[] = []

        const heaters = this.$store.state.printer?.heaters?.available_heaters || []
        sensors.push(...heaters)

        const tempSensors = this.$store.state.printer?.heaters?.available_sensors || []
        tempSensors.forEach((sensor: string) => {
            if (!sensors.includes(sensor)) {
                sensors.push(sensor)
            }
        })

        return sensors
    }

    get usedSensorsInGroup(): string[] {
        return this.sensorsList.map((s) => s.name)
    }

    get availableSensors(): string[] {
        return this.allSensors.filter((sensor) => !this.usedSensorsInGroup.includes(sensor))
    }

    get filteredAvailableSensors(): string[] {
        if (!this.searchSensors) return this.availableSensors

        const search = this.searchSensors.toLowerCase()
        return this.availableSensors.filter(
            (sensor) =>
                sensor.toLowerCase().includes(search) || this.formatSensorName(sensor).toLowerCase().includes(search)
        )
    }

    existsGroupName(name: string): boolean {
        return this.allGroups.some((group) => group.name === name && group.id !== this.groupId)
    }

    formatSensorName(name: string): string {
        let displayName = name

        const prefixes = ['temperature_sensor ', 'temperature_fan ', 'heater_generic ']
        for (const prefix of prefixes) {
            if (displayName.startsWith(prefix)) {
                displayName = displayName.substring(prefix.length)
                break
            }
        }

        return displayName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
    }

    updateSensorOrder() {
        if (!this.groupId) return
        const reorderedSensors = this.sensorsList.map((s, index) => ({
            ...s,
            pos: index,
        }))
        this.$store.dispatch('gui/tempgroups/reorderSensorsInGroup', {
            id: this.groupId,
            sensors: reorderedSensors,
        })
    }

    addSensor(sensorName: string) {
        if (!this.groupId) return
        this.$store.dispatch('gui/tempgroups/addSensorToGroup', {
            id: this.groupId,
            sensorName,
        })
    }

    removeSensor(sensor: GuiTempgroupSensor) {
        if (!this.groupId) return
        this.$store.dispatch('gui/tempgroups/removeSensorFromGroup', {
            id: this.groupId,
            sensorName: sensor.name,
        })
    }

    editSensorDisplayName(sensor: GuiTempgroupSensor) {
        this.editingSensorName = sensor.name
        this.editingDisplayName = sensor.displayName || ''
        this.displayNameDialog = true
    }

    cancelDisplayNameEdit() {
        this.displayNameDialog = false
        this.editingSensorName = ''
        this.editingDisplayName = ''
    }

    saveDisplayName() {
        if (!this.groupId || !this.editingSensorName) return

        this.$store.dispatch('gui/tempgroups/updateSensorInGroup', {
            id: this.groupId,
            sensorName: this.editingSensorName,
            option: 'displayName',
            value: this.editingDisplayName || undefined,
        })

        this.cancelDisplayNameEdit()
    }

    close() {
        this.$emit('close')
    }
}
</script>
