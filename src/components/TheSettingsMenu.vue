<template>
    <div>
        <v-btn icon tile @click="showSettings = true">
            <v-icon>{{ mdiCogs }}</v-icon>
        </v-btn>
        <v-dialog
            v-model="showSettings"
            width="900"
            persistent
            :fullscreen="isMobile"
            scrollable
            @keydown.esc="showSettings = false">
            <panel
                :title="$t('Settings.InterfaceSettings')"
                :icon="mdiCogs"
                card-class="settings-menu-dialog"
                :margin-bottom="false"
                style="overflow: hidden"
                :height="isMobile ? 0 : 548">
                <template #buttons>
                    <v-btn icon tile @click="showSettings = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <template v-if="isMobile">
                    <v-tabs v-model="activeTab" :center-active="true" :show-arrows="true">
                        <v-tab
                            v-for="(tab, index) of tabTitles"
                            :key="index"
                            :value="tab.name"
                            class="justify-start">
                            <v-icon start>{{ tab.icon }}</v-icon>
                            {{ tab.title }}
                        </v-tab>
                    </v-tabs>
                </template>
                <v-row class="flex-row flex-nowrap">
                    <v-col v-if="!isMobile" cols="auto" class="pr-0">
                        <OverlayScrollbarsComponent ref="settingsTabsScroll" class="settings-tabs-bar height500">
                            <v-tabs v-model="activeTab" direction="vertical">
                                <v-tab
                                    v-for="(tab, index) of tabTitles"
                                    :key="index"
                                    :value="tab.name"
                                    class="justify-start"
                                    style="width: 200px">
                                    <v-icon start>{{ tab.icon }}</v-icon>
                                    <span class="text-truncate">{{ tab.title }}</span>
                                </v-tab>
                            </v-tabs>
                        </OverlayScrollbarsComponent>
                    </v-col>
                    <v-col :class="isMobile ? '' : 'pl-0'" style="min-width: 0;">
                        <OverlayScrollbarsComponent
                            ref="settingsScroll"
                            :class="'settings-tabs ' + (isMobile ? '' : 'height500')"
                            :options="{ overflowBehavior: { x: 'hidden' } }">
                            <component :is="tabComponents[activeTab]" @scrollToTop="scrollToTop" />
                        </OverlayScrollbarsComponent>
                    </v-col>
                </v-row>
            </panel>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import SettingsGeneralTab from '@/components/settings/SettingsGeneralTab.vue'
import SettingsWebcamsTab from '@/components/settings/SettingsWebcamsTab.vue'
import SettingsMacrosTab from '@/components/settings/SettingsMacrosTab.vue'
import SettingsControlTab from '@/components/settings/SettingsControlTab.vue'
import SettingsConsoleTab from '@/components/settings/SettingsConsoleTab.vue'
import SettingsRemotePrintersTab from '@/components/settings/SettingsRemotePrintersTab.vue'
import SettingsUiSettingsTab from '@/components/settings/SettingsUiSettingsTab.vue'
import SettingsDashboardTab from '@/components/settings/SettingsDashboardTab.vue'
import SettingsGCodeViewerTab from '@/components/settings/SettingsGCodeViewerTab.vue'
import SettingsEditorTab from '@/components/settings/SettingsEditorTab.vue'
import SettingsNavigationTab from '@/components/settings/SettingsNavigationTab.vue'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiCloseThick,
    mdiCodeTags,
    mdiCog,
    mdiCogs,
    mdiConsoleLine,
    mdiDipSwitch,
    mdiFileDocumentEditOutline,
    mdiMonitorDashboard,
    mdiPalette,
    mdiPrinter3d,
    mdiTune,
    mdiVideo3d,
    mdiWebcam,
    mdiMenu,
} from '@mdi/js'
import SettingsMiscellaneousTab from '@/components/settings/SettingsMiscellaneousTab.vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

const store = useStore()
const { t } = useI18n()
const { isMobile } = useBase()

const settingsScroll = ref<any>(null)

const showSettings = ref(false)
const activeTab = ref('general')

const tabComponents: Record<string, any> = {
    general: SettingsGeneralTab,
    'ui-settings': SettingsUiSettingsTab,
    dashboard: SettingsDashboardTab,
    webcams: SettingsWebcamsTab,
    macros: SettingsMacrosTab,
    control: SettingsControlTab,
    console: SettingsConsoleTab,
    'remote-printers': SettingsRemotePrintersTab,
    'g-code-viewer': SettingsGCodeViewerTab,
    editor: SettingsEditorTab,
    miscellaneous: SettingsMiscellaneousTab,
    navigation: SettingsNavigationTab,
}

const tabTitles = computed(() => {
    const tabs = [
        { icon: mdiCog, name: 'general', title: t('Settings.GeneralTab.General') },
        { icon: mdiPalette, name: 'ui-settings', title: t('Settings.UiSettingsTab.UiSettings') },
        { icon: mdiMonitorDashboard, name: 'dashboard', title: t('Settings.DashboardTab.Dashboard') },
        { icon: mdiWebcam, name: 'webcams', title: t('Settings.WebcamsTab.Webcams') },
        { icon: mdiCodeTags, name: 'macros', title: t('Settings.MacrosTab.Macros') },
        { icon: mdiTune, name: 'control', title: t('Settings.ControlTab.Control') },
        { icon: mdiConsoleLine, name: 'console', title: t('Settings.ConsoleTab.Console') },
        { icon: mdiPrinter3d, name: 'remote-printers', title: t('Settings.RemotePrintersTab.RemotePrinters') },
        { icon: mdiVideo3d, name: 'g-code-viewer', title: t('Settings.GCodeViewerTab.GCodeViewer') },
        { icon: mdiFileDocumentEditOutline, name: 'editor', title: t('Settings.EditorTab.Editor') },
        { icon: mdiDipSwitch, name: 'miscellaneous', title: t('Settings.MiscellaneousTab.Miscellaneous') },
        { icon: mdiMenu, name: 'navigation', title: t('Settings.NavigationTab.Navigation') },
    ]

    return tabs.sort((a, b) => {
        if (a.name === 'general') return -1
        if (b.name === 'general') return 1

        const stringA = a.title.toString().toLowerCase()
        const stringB = b.title.toString().toLowerCase()

        if (stringA < stringB) return -1
        if (stringA > stringB) return 1

        return 0
    })
})

watch(activeTab, async () => {
    await nextTick()
    scrollToTop()
})

function scrollToTop() {
    const viewport = settingsScroll.value?.osInstance()?.elements().viewport

    if (viewport) viewport.scrollTop = 0
}
</script>

<style scoped>
.settings-tabs {
    width: 100%;
    min-height: 100%;
    height: calc(var(--app-height) - 96px);
}

.settings-tabs-bar {
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    display: inline-block;
    height: 100%;
    width: fit-content;
}

html.theme--light .settings-tabs-bar {
    border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.settings-tabs.height500 {
    height: 500px;
    max-height: calc(var(--app-height) - 111px);
}
</style>

<style>
.settings-tabs .v-select__selections input {
    width: 100px;
}
</style>
