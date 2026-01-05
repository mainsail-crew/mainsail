<template>
    <div>
        <v-card-text>
            <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.LightGroups', { name }) }}</h3>
            <template v-if="groups.length">
                <div v-for="(group, index) in groups" :key="group.id">
                    <v-divider v-if="index" class="my-2" />
                    <settings-miscellaneous-tab-light-groups-list-entry
                        :type="type"
                        :name="name"
                        :group="group"
                        @edit-group="editGroup" />
                </div>
            </template>
            <p v-else class="mb-0 text-center font-italic">{{ $t('Settings.MiscellaneousTab.NoGroupFound') }}</p>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn text @click="close">{{ $t('Buttons.Close') }}</v-btn>
            <v-btn text color="primary" @click="createGroup">{{ $t('Settings.MiscellaneousTab.AddGroup') }}</v-btn>
        </v-card-actions>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { GuiMiscellaneousStateEntryLightgroup } from '@/store/gui/miscellaneous/types'

@Component({
    components: {
        SettingsRow,
    },
})
export default class SettingsMiscellaneousTabLightGroupsList extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) declare type: string
    @Prop({ type: String, required: true }) declare name: string

    get entry() {
        const entries = this.$store.state.gui.miscellaneous.entries ?? {}
        const key =
            Object.keys(entries).find((key) => {
                const entry = entries[key]
                return entry.type === this.type && entry.name === this.name
            }) ?? ''

        return entries[key] ?? {}
    }

    get groups() {
        if (!this.entry) return []

        const lightgroups = this.entry.lightgroups ?? {}

        const groups: GuiMiscellaneousStateEntryLightgroup[] = []
        Object.keys(lightgroups).forEach((key) => {
            groups.push({
                name: lightgroups[key].name,
                start: lightgroups[key].start,
                end: lightgroups[key].end,
                id: key,
            })
        })

        return caseInsensitiveSort(groups, 'name')
    }

    editGroup(groupId: string) {
        this.$emit('edit-group', groupId)
    }

    close() {
        this.$emit('close')
    }

    createGroup() {
        this.$emit('create-group')
    }
}
</script>
