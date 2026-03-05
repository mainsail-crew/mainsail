<template>
    <div>
        <settings-tempgroups-tab-edit v-if="boolFormEdit" :group-id="editGroupId" @close="closeEdit" />
        <v-card v-else flat>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.TempgroupsTab.General') }}</h3>
                <settings-row :title="$t('Settings.TempgroupsTab.ShowAllTab')">
                    <v-checkbox v-model="showAllTab" hide-details class="mt-0"></v-checkbox>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <h3 class="text-h5 mt-6 mb-3">{{ $t('Settings.TempgroupsTab.Groups') }}</h3>
                <template v-if="groups.length">
                    <draggable
                        v-model="groupsList"
                        handle=".handle"
                        ghost-class="ghost"
                        :force-fallback="true"
                        @end="onGroupsReordered">
                        <div v-for="(group, index) in groupsList" :key="group.id">
                            <v-divider v-if="index" class="my-2"></v-divider>
                            <v-row class="my-2 mx-0" :style="draggableBgStyle">
                                <v-col class="col-auto pr-0 d-flex py-2">
                                    <v-icon class="handle">{{ mdiDragVertical }}</v-icon>
                                </v-col>
                                <v-col class="py-2">
                                    <settings-row
                                        :title="
                                            group.name !== ''
                                                ? group.name
                                                : '<' + $t('Settings.TempgroupsTab.UnknownGroup') + '>'
                                        "
                                        :sub-title="
                                            $tc(
                                                'Settings.TempgroupsTab.CountSensors',
                                                group.sensors ? group.sensors.length : 0,
                                                {
                                                    count: group.sensors ? group.sensors.length : 0,
                                                }
                                            )
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
                                </v-col>
                            </v-row>
                        </div>
                    </draggable>
                </template>
                <template v-else>
                    <v-row>
                        <v-col>
                            <p class="mb-0 text-center font-italic">{{ $t('Settings.TempgroupsTab.NoGroups') }}</p>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text color="primary" @click="addGroup">{{ $t('Settings.TempgroupsTab.AddGroup') }}</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import ThemeMixin from '@/components/mixins/theme'
import draggable from 'vuedraggable'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import SettingsTempgroupsTabEdit from '@/components/settings/SettingsTempgroupsTabEdit.vue'
import { GuiTempgroup } from '@/store/gui/tempgroups/types'
import { mdiDelete, mdiDragVertical, mdiPencil } from '@mdi/js'

@Component({
    components: { SettingsRow, SettingsTempgroupsTabEdit, draggable },
})
export default class SettingsTempgroupsTab extends Mixins(BaseMixin, ThemeMixin) {
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete
    mdiDragVertical = mdiDragVertical

    private boolFormEdit = false
    private editGroupId: string | null = null
    private groupsList: GuiTempgroup[] = []

    @Watch('groups', { immediate: true })
    onGroupsChanged(newVal: GuiTempgroup[]) {
        this.groupsList = [...newVal]
    }

    get showAllTab(): boolean {
        return this.$store.state.gui?.tempgroups?.showAllTab ?? true
    }

    set showAllTab(newVal: boolean) {
        this.$store.dispatch('gui/tempgroups/setShowAllTab', newVal)
    }

    get groups(): GuiTempgroup[] {
        return this.$store.getters['gui/tempgroups/getSortedGroups'] ?? []
    }

    onGroupsReordered() {
        const orderedIds = this.groupsList.map((g) => g.id)
        this.$store.dispatch('gui/tempgroups/reorderGroups', orderedIds)
    }

    async addGroup() {
        this.editGroupId = await this.$store.dispatch('gui/tempgroups/groupStore', {
            values: {
                name: '',
                showChart: true,
            },
        })
        this.boolFormEdit = true
    }

    editGroup(group: GuiTempgroup) {
        this.editGroupId = group.id
        this.boolFormEdit = true
    }

    deleteGroup(id: string) {
        this.$store.dispatch('gui/tempgroups/groupDelete', id)
    }

    closeEdit() {
        this.boolFormEdit = false
        this.editGroupId = null
        this.$emit('scrollToTop')
    }
}
</script>
