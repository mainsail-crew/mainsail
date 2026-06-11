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

<script setup lang="ts">
import { ref } from 'vue'
import SettingsMiscellaneousTabList from '@/components/settings/Miscellaneous/SettingsMiscellaneousTabList.vue'
import SettingsMiscellaneousTabLightGroups from '@/components/settings/Miscellaneous/SettingsMiscellaneousTabLightGroups.vue'
import SettingsMiscellaneousTabLightPresets from '@/components/settings/Miscellaneous/SettingsMiscellaneousTabLightPresets.vue'
import { useMiscellaneous } from '@/composables/useMiscellaneous'

const {  } = useMiscellaneous()

const page = ref('')
const pageType = ref('')
const pageName = ref('')

function openPage(payload: { page: string; type: string; name: string } = { page: '', type: '', name: '' }) {
    page.value = payload.page
    pageType.value = payload.type
    pageName.value = payload.name
}
</script>
