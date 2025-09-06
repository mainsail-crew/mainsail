<template>
    <settings-row :title="group.name" :sub-title="subTitle" :dynamic-slot-width="true">
        <v-btn small outlined class="ml-3" @click="editGroup">
            <v-icon left small>{{ mdiPencil }}</v-icon>
            {{ $t('Settings.Edit') }}
        </v-btn>
        <v-btn small outlined class="ml-3 minwidth-0 px-2" color="error" @click="deleteGroup">
            <v-icon small>{{ mdiDelete }}</v-icon>
        </v-btn>
    </settings-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPencil } from '@mdi/js'
import { GuiMiscellaneousStateEntryLightgroup } from '@/store/gui/miscellaneous/types'

@Component({
    components: { SettingsRow },
})
export default class SettingsMiscellaneousTabLightGroupsListEntry extends Mixins(BaseMixin) {
    mdiDelete = mdiDelete
    mdiPencil = mdiPencil

    @Prop({ type: String, required: true }) declare type: string
    @Prop({ type: String, required: true }) declare name: string
    @Prop({ type: Object, required: true }) declare group: GuiMiscellaneousStateEntryLightgroup

    get subTitle() {
        return this.$t('Settings.MiscellaneousTab.GroupSubTitle', {
            start: this.group.start,
            end: this.group.end,
        })
    }

    editGroup() {
        this.$emit('edit-group', this.group.id)
    }

    deleteGroup() {
        this.$store.dispatch('gui/miscellaneous/deleteLightgroup', {
            type: this.type,
            name: this.name,
            lightgroupId: this.group.id,
        })
    }
}
</script>

<style scoped></style>
