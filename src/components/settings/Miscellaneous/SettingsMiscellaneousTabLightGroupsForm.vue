<template>
    <div>
        <v-card-text>
            <h3 class="text-h5 mb-3">{{ title }}</h3>
            <settings-row :title="$t('Settings.MiscellaneousTab.Name')">
                <v-text-field
                    v-model="groupname"
                    hide-details="auto"
                    :rules="[rules.required, rules.groupUnique]"
                    dense
                    outlined />
            </settings-row>
            <v-divider class="my-2" />
            <settings-row
                :title="$t('Settings.MiscellaneousTab.Start')"
                :sub-title="$t('Settings.MiscellaneousTab.StartDescription')">
                <v-text-field
                    v-model="start"
                    hide-details="auto"
                    type="number"
                    :step="1"
                    :rules="[rules.minStart, rules.max]"
                    dense
                    outlined />
            </settings-row>
            <v-divider class="my-2" />
            <settings-row
                :title="$t('Settings.MiscellaneousTab.End')"
                :sub-title="$t('Settings.MiscellaneousTab.EndDescription')">
                <v-text-field
                    v-model="end"
                    hide-details="auto"
                    type="number"
                    :step="1"
                    :rules="[rules.minEnd, rules.max]"
                    dense
                    outlined />
            </settings-row>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn text @click="close">{{ $t('Settings.Cancel') }}</v-btn>
            <v-btn v-if="groupId !== null" text color="primary" @click="updateGroup">{{ $t('Settings.Update') }}</v-btn>
            <v-btn v-else text color="primary" @click="storeGroup">{{ $t('Settings.Store') }}</v-btn>
        </v-card-actions>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'
import { GuiMiscellaneousStateEntry, GuiMiscellaneousStateEntryLightgroup } from '@/store/gui/miscellaneous/types'

@Component({
    components: { SettingsRow },
})
export default class SettingsMiscellaneousTabLightGroupsForm extends Mixins(BaseMixin) {
    groupname = ''
    start = 1
    end = 1

    rules = {
        required: (value: string) => value !== '' || 'required',
        groupUnique: (value: string) => !this.existsGroupName(value) || 'Name already exists',
        minStart: (value: number) => value > 0 || 'smaller than 1',
        minEnd: (value: number) => value >= this.start || 'smaller than start value',
        max: (value: number) => value <= this.chainCount || 'higher than chain_count',
    }

    @Prop({ type: String, default: null }) declare type: string | null
    @Prop({ type: String, default: null }) declare name: string | null
    @Prop({ type: String, default: null }) declare groupId: string | null

    get title() {
        if (this.groupId) return this.$t('Settings.MiscellaneousTab.EditGroup')

        return this.$t('Settings.MiscellaneousTab.CreateGroup')
    }

    get settings() {
        if (!this.type || !this.name) return null

        const key = `${this.type.toLowerCase()} ${this.name.toLowerCase()}`
        return this.$store.state.printer?.configfile?.settings[key] ?? {}
    }

    get chainCount() {
        return this.settings?.chain_count ?? 1
    }

    get light() {
        if (!this.type || !this.name) return null

        const key = `${this.type} ${this.name}`
        return this.$store.state.printer[key] ?? {}
    }

    get entry(): GuiMiscellaneousStateEntry {
        const entries = this.$store.state.gui.miscellaneous.entries ?? {}

        const key = Object.keys(entries).find((key) => {
            const entry = entries[key]
            return entry.type === this.type && entry.name === this.name
        })

        return entries[key ?? ''] ?? {}
    }

    get groups() {
        if (!this.entry?.lightgroups) return []

        const groups: GuiMiscellaneousStateEntryLightgroup[] = []
        Object.keys(this.entry.lightgroups).forEach((key) => {
            const lightgroup = this.entry.lightgroups[key]

            groups.push({
                id: key,
                name: lightgroup.name,
                start: lightgroup.start,
                end: lightgroup.end,
            })
        })

        return caseInsensitiveSort(groups, 'name')
    }

    get group() {
        if (!this.groupId) return null

        return this.groups.find((group) => group.id === this.groupId) ?? null
    }

    @Watch('group', { immediate: true })
    onGroupChanged() {
        this.groupname = this.group?.name ?? ''
        this.start = this.group?.start ?? 1
        this.end = this.group?.end ?? 1
    }

    close() {
        this.$emit('close')
    }

    storeGroup() {
        this.$store.dispatch('gui/miscellaneous/storeLightgroup', {
            type: this.type,
            name: this.name,
            lightgroup: {
                name: this.groupname,
                // parseInt & toString is just to force a integer
                start: parseInt(this.start.toString(), 10),
                end: parseInt(this.end.toString(), 10),
            },
        })

        this.close()
    }

    updateGroup() {
        this.$store.dispatch('gui/miscellaneous/updateLightgroup', {
            type: this.type,
            name: this.name,
            lightgroupId: this.groupId,
            lightgroup: {
                name: this.groupname,
                // parseInt & toString is just to force a integer
                start: parseInt(this.start.toString(), 10),
                end: parseInt(this.end.toString(), 10),
            },
        })

        this.close()
    }

    existsGroupName(name: string) {
        return (
            this.groups.findIndex(
                (group: GuiMacrosStateMacrogroup) => group.name === name && group.id !== this.groupId
            ) >= 0
        )
    }
}
</script>
