<template>
    <div>
        <settings-miscellaneous-tab-light-groups
            v-if="page === 'groups'"
            :type="pageType"
            :name="pageName"
            @close="openPage" />
        <settings-miscellaneous-tab-light-presets
            v-else-if="page === 'presets'"
            :type="pageType"
            :name="pageName"
            @close="openPage" />
        <settings-miscellaneous-tab-list v-else @open-page="openPage" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsMiscellaneousTabList from '@/components/settings/Miscellaneous/SettingsMiscellaneousTabList.vue'
import SettingsMiscellaneousTabLightGroups from '@/components/settings/Miscellaneous/SettingsMiscellaneousTabLightGroups.vue'
import SettingsMiscellaneousTabLightPresets from '@/components/settings/Miscellaneous/SettingsMiscellaneousTabLightPresets.vue'
import MiscellaneousMixin from '@/components/mixins/miscellaneous'

@Component({
    components: {
        SettingsMiscellaneousTabList,
        SettingsMiscellaneousTabLightGroups,
        SettingsMiscellaneousTabLightPresets,
    },
})
export default class SettingsMiscellaneousTab extends Mixins(BaseMixin, MiscellaneousMixin) {
    page = ''
    pageType = ''
    pageName = ''

    openPage(payload: { page: string; type: string; name: string } = { page: '', type: '', name: '' }) {
        this.page = payload.page
        this.pageType = payload.type
        this.pageName = payload.name
    }
}
</script>
