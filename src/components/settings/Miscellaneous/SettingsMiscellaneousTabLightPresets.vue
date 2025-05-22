<template>
    <settings-miscellaneous-tab-light-presets-form
        v-if="page === 'form'"
        :type="type"
        :name="name"
        :preset-id="presetId"
        @close="openPage('')" />
    <settings-miscellaneous-tab-light-presets-list
        v-else
        :type="type"
        :name="name"
        @create-preset="openPage('form')"
        @edit-preset="editPreset"
        @close="close" />
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class SettingsMiscellaneousTabLightPresets extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) readonly type!: string
    @Prop({ type: String, required: true }) readonly name!: string

    page = ''
    presetId: string | null = null

    editPreset(groupId: string) {
        this.openPage('form')
        this.presetId = groupId
    }

    openPage(name: string) {
        this.page = name
        this.presetId = null
    }

    close() {
        this.$emit('close')
    }
}
</script>
