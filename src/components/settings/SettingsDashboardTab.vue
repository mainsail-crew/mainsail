<style scoped></style>

<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col class="text-center">
                    <v-btn-toggle v-model="currentViewport" class="mx-auto">
                        <v-btn value="mobile">
                            <span class="hidden-sm-and-down">{{ $t('Settings.DashboardTab.Mobile') }}</span>
                            <v-icon right class="hidden-sm-and-down">{{ mdiCellphone }}</v-icon>
                            <v-icon class="hidden-md-and-up">{{ mdiCellphone }}</v-icon>
                        </v-btn>

                        <v-btn value="tablet">
                            <span class="hidden-sm-and-down">{{ $t('Settings.DashboardTab.Tablet') }}</span>
                            <v-icon right class="hidden-sm-and-down">{{ mdiTablet }}</v-icon>
                            <v-icon class="hidden-md-and-up">{{ mdiTablet }}</v-icon>
                        </v-btn>

                        <v-btn value="desktop">
                            <span class="hidden-sm-and-down">{{ $t('Settings.DashboardTab.Desktop') }}</span>
                            <v-icon right class="hidden-sm-and-down">{{ mdiMonitorDashboard }}</v-icon>
                            <v-icon class="hidden-md-and-up">{{ mdiMonitorDashboard }}</v-icon>
                        </v-btn>

                        <v-btn value="widescreen">
                            <span class="hidden-sm-and-down">{{ $t('Settings.DashboardTab.Widescreen') }}</span>
                            <v-icon right class="hidden-sm-and-down">{{ mdiMonitorScreenshot }}</v-icon>
                            <v-icon class="hidden-md-and-up">{{ mdiMonitorScreenshot }}</v-icon>
                        </v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <component :is="currentTab"></component>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import draggable from 'vuedraggable'
import SettingsDashboardTabMobile from '@/components/settings/SettingsDashboardTabMobile.vue'
import SettingsDashboardTabTablet from '@/components/settings/SettingsDashboardTabTablet.vue'
import SettingsDashboardTabDesktop from '@/components/settings/SettingsDashboardTabDesktop.vue'
import SettingsDashboardTabWidescreen from '@/components/settings/SettingsDashboardTabWidescreen.vue'
import { mdiCellphone, mdiMonitorScreenshot, mdiMonitorDashboard, mdiTablet } from '@mdi/js'

@Component({
    components: {
        draggable,
        SettingsDashboardTabMobile,
        SettingsDashboardTabTablet,
        SettingsDashboardTabDesktop,
        SettingsDashboardTabWidescreen,
    },
})
export default class SettingsDashboardTab extends Mixins(BaseMixin) {
    mdiCellphone = mdiCellphone
    mdiTablet = mdiTablet
    mdiMonitorDashboard = mdiMonitorDashboard
    mdiMonitorScreenshot = mdiMonitorScreenshot

    private currentViewport = 'desktop'

    mounted() {
        if (this.isMobile) this.currentViewport = 'mobile'
        else if (this.isTablet) this.currentViewport = 'tablet'
        else if (this.isDesktop) this.currentViewport = 'desktop'
        else if (this.isWidescreen) this.currentViewport = 'widescreen'
        else this.currentViewport = 'desktop'
    }

    get currentTab() {
        return 'settings-dashboard-tab-' + this.currentViewport
    }
}
</script>
