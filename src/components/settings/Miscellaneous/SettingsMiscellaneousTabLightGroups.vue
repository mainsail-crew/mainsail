<template>
    <settings-miscellaneous-tab-light-groups-form
        v-if="page === 'form'"
        :type="type"
        :name="name"
        :group-id="groupId"
        @close="openPage('')" />
    <settings-miscellaneous-tab-light-groups-list
        v-else
        :type="type"
        :name="name"
        @create-group="openPage('form')"
        @edit-group="editGroup"
        @close="close" />
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class SettingsMiscellaneousTabLightGroups extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) readonly type!: string
    @Prop({ type: String, required: true }) readonly name!: string

    page = ''
    groupId: string | null = null

    editGroup(groupId: string) {
        this.openPage('form')
        this.groupId = groupId
    }

    openPage(name: string) {
        this.page = name
        this.groupId = null
    }

    close() {
        this.$emit('close')
    }
}
</script>
