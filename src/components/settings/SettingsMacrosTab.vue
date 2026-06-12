<template>
    <v-card flat class="settings-macros-tab">
        <v-card-text v-if="showGeneral">
            <h3 class="text-h5 mb-3">{{ $t('Settings.MacrosTab.General') }}</h3>
            <settings-row :title="$t('Settings.MacrosTab.Management')">
                <v-select v-model="mode" :items="modes" item-title="text" item-value="value" outlined dense hide-details attach></v-select>
            </settings-row>
            <v-divider class="my-2"></v-divider>
        </v-card-text>
        <template v-if="mode === 'expert'">
            <settings-macros-tab-expert
                @update:showGeneral="updateShowGeneral"
                @scrollToTop="scrollToTop"></settings-macros-tab-expert>
        </template>
        <template v-else>
            <settings-macros-tab-simple></settings-macros-tab-simple>
        </template>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import SettingsMacrosTabSimple from '@/components/settings/SettingsMacrosTabSimple.vue'
import SettingsMacrosTabExpert from '@/components/settings/SettingsMacrosTabExpert.vue'

const emit = defineEmits<{
    (e: 'scrollToTop'): void
}>()

const store = useStore()
const { t } = useI18n()

const showGeneral = ref(true)

const modes = computed(() => [
    {
        text: t('Settings.MacrosTab.Simple'),
        value: 'simple',
    },
    {
        text: t('Settings.MacrosTab.Expert'),
        value: 'expert',
    },
])

const mode = computed({
    get: () => store.state.gui?.macros?.mode ?? 'simple',
    set: (newVal) => {
        store.dispatch('gui/macros/saveSetting', { name: 'mode', value: newVal })
    },
})

function updateShowGeneral(newVal: boolean) {
    showGeneral.value = newVal
}

function scrollToTop() {
    emit('scrollToTop')
}
</script>

<style scoped>
.settings-macros-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}
</style>
