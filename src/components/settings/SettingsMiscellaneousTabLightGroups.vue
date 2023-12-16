<template>
    <div>
        <template v-if="boolForm">
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.CreateGroup') }}</h3>
                <settings-row :title="$t('Settings.MiscellaneousTab.Name').toString()">
                    <v-text-field
                        v-model="form.name"
                        hide-details="auto"
                        :rules="[rules.required, rules.groupUnique]"
                        dense
                        outlined></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.MiscellaneousTab.Start').toString()"
                    :sub-title="$t('Settings.MiscellaneousTab.StartDescription').toString()">
                    <v-text-field
                        v-model="form.start"
                        hide-details="auto"
                        type="number"
                        step="1"
                        :rules="[rules.minStart, rules.max]"
                        dense
                        outlined></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.MiscellaneousTab.End').toString()"
                    :sub-title="$t('Settings.MiscellaneousTab.EndDescription').toString()">
                    <v-text-field
                        v-model="form.end"
                        hide-details="auto"
                        type="number"
                        step="1"
                        :rules="[rules.minEnd, rules.max]"
                        dense
                        outlined></v-text-field>
                </settings-row>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="closeForm">{{ $t('Settings.Cancel') }}</v-btn>
                <v-btn v-if="form.id !== null" text color="primary" @click="updateGroup">
                    {{ $t('Settings.Update') }}
                </v-btn>
                <v-btn v-else text color="primary" @click="storeGroup">{{ $t('Settings.Store') }}</v-btn>
            </v-card-actions>
        </template>
        <template v-else>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.LightGroups', { name: light.name }) }}</h3>
                <template v-if="light">
                    <template v-if="groups.length">
                        <div v-for="(group, index) in groups" :key="group.id">
                            <v-divider v-if="index" class="my-2"></v-divider>
                            <settings-row
                                :title="group.name"
                                :sub-title="
                                    $t('Settings.MiscellaneousTab.GroupSubTitle', {
                                        start: group.start,
                                        end: group.end,
                                    }).toString()
                                "
                                :dynamic-slot-width="true">
                                <v-btn small outlined class="ml-3" @click="editGroup(group)">
                                    <v-icon left small>{{ mdiPencil }}</v-icon>
                                    {{ $t('Settings.Edit') }}
                                </v-btn>
                                <v-btn
                                    small
                                    outlined
                                    class="ml-3 minwidth-0 px-2"
                                    color="error"
                                    @click="deleteGroup(group.id)">
                                    <v-icon small>{{ mdiDelete }}</v-icon>
                                </v-btn>
                            </settings-row>
                        </div>
                    </template>
                    <template v-else>
                        <v-row>
                            <v-col>
                                <p class="mb-0 text-center font-italic">
                                    {{ $t('Settings.MiscellaneousTab.NoGroupFound') }}
                                </p>
                            </v-col>
                        </v-row>
                    </template>
                </template>
                <template v-else>
                    <v-row>
                        <v-col>
                            <p class="mb-0 text-center font-italic">
                                {{ $t('Settings.MiscellaneousTab.UnableToLoadLight') }}
                            </p>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="$emit('close')">{{ $t('Settings.Close') }}</v-btn>
                <v-btn text color="primary" @click="createGroup">
                    {{ $t('Settings.MiscellaneousTab.AddGroup') }}
                </v-btn>
            </v-card-actions>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPalette, mdiPencil } from '@mdi/js'
import { caseInsensitiveSort, convertName } from '@/plugins/helpers'
import { PrinterStateLight } from '@/store/printer/types'
import { GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'
import { GuiMiscellaneousStateEntry, GuiMiscellaneousStateEntryLightgroup } from '@/store/gui/miscellaneous/types'

@Component({
    components: {
        SettingsRow,
    },
})
export default class SettingsMiscellaneousTabLightGroups extends Mixins(BaseMixin) {
    mdiDelete = mdiDelete
    mdiPalette = mdiPalette
    mdiPencil = mdiPencil

    convertName = convertName

    private boolForm = false

    private form: {
        id: string | null
        name: string
        start: number
        end: number
    } = {
        id: null,
        name: '',
        start: 1,
        end: 1,
    }

    private rules = {
        required: (value: string) => value !== '' || 'required',
        groupUnique: (value: string) => !this.existsGroupName(value) || 'Name already exists',
        minStart: (value: number) => value > 0 || 'smaller than 1',
        minEnd: (value: number) => value >= this.form.start || 'smaller than start value',
        max: (value: number) => value <= (this.light?.chainCount ?? 1) || 'higher than chain_count',
    }

    @Prop({ type: Object, default: null })
    declare light: PrinterStateLight | null

    get entry() {
        return this.$store.getters['gui/miscellaneous/getEntry']({
            type: this.light?.type,
            name: this.light?.name,
        }) as GuiMiscellaneousStateEntry | null
    }

    get groups() {
        if (!this.entry) return []

        const groups: GuiMiscellaneousStateEntryLightgroup[] = []
        Object.entries(this.entry.lightgroups).forEach(([key, lightgroup]) => {
            groups.push({
                name: lightgroup.name,
                start: lightgroup.start,
                end: lightgroup.end,
                id: key,
            })
        })
        window.console.log('getEntryLightgroups', groups)

        return caseInsensitiveSort(groups, 'name')
    }

    createGroup() {
        this.form.id = null
        this.form.name = ''
        this.form.start = 1
        this.form.end = this.light?.chainCount ?? 1
        this.boolForm = true
    }

    editGroup(group: GuiMiscellaneousStateEntryLightgroup) {
        this.form.id = group.id ?? null
        this.form.name = group.name
        this.form.start = group.start
        this.form.end = group.end
        this.boolForm = true
    }

    closeForm() {
        this.boolForm = false
    }

    storeGroup() {
        this.$store.dispatch('gui/miscellaneous/storeLightgroup', {
            entry: this.light,
            lightgroup: this.form,
        })

        this.boolForm = false
    }

    updateGroup() {
        this.$store.dispatch('gui/miscellaneous/updateLightgroup', {
            entry: this.light,
            lightgroup: this.form,
        })

        this.boolForm = false
    }

    deleteGroup(groupId: string) {
        this.$store.dispatch('gui/miscellaneous/deleteLightgroup', {
            entry: this.light,
            lightgroupId: groupId,
        })
    }

    existsGroupName(name: string) {
        return (
            this.groups.findIndex(
                (group: GuiMacrosStateMacrogroup) => group.name === name && group.id != this.form.id
            ) >= 0
        )
    }
}
</script>

<style scoped></style>
