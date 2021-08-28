<style scoped>

</style>

<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col class="text-center">
                    <v-btn-toggle v-model="viewport" class="mx-auto">
                        <v-btn value="mobile">
                            <span class="hidden-sm-and-down">{{ $t('Settings.DashboardTab.Mobile') }}</span>
                            <v-icon right class="hidden-sm-and-down">mdi-cellphone</v-icon>
                            <v-icon class="hidden-md-and-up">mdi-cellphone</v-icon>
                        </v-btn>

                        <v-btn value="tablet">
                            <span class="hidden-sm-and-down">{{ $t('Settings.DashboardTab.Tablet') }}</span>
                            <v-icon right class="hidden-sm-and-down">mdi-tablet</v-icon>
                            <v-icon class="hidden-md-and-up">mdi-tablet</v-icon>
                        </v-btn>

                        <v-btn value="desktop">
                            <span class="hidden-sm-and-down">{{ $t('Settings.DashboardTab.Desktop') }}</span>
                            <v-icon right class="hidden-sm-and-down">mdi-monitor-dashboard</v-icon>
                            <v-icon class="hidden-md-and-up">mdi-monitor-dashboard</v-icon>
                        </v-btn>

                        <v-btn value="widescreen">
                            <span class="hidden-sm-and-down">{{ $t('Settings.DashboardTab.Widescreen') }}</span>
                            <v-icon right class="hidden-sm-and-down">mdi-monitor-screenshot</v-icon>
                            <v-icon class="hidden-md-and-up">mdi-monitor-screenshot</v-icon>
                        </v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <component :is="'settings-dashboard-tab-'+viewport"></component>
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

@Component( {
    components: {
        draggable,
        SettingsDashboardTabMobile,
        SettingsDashboardTabTablet,
        SettingsDashboardTabDesktop,
        SettingsDashboardTabWidescreen
    }
}
)
export default class SettingsDashboardTab extends Mixins(BaseMixin) {
    private viewport = 'desktop'

    mounted() {
        if (this.isMobile) this.viewport = 'mobile'
        else if (this.isTablet) this.viewport = 'tablet'
        else if (this.isDesktop) this.viewport = 'desktop'
        else if (this.isWidescreen) this.viewport = 'widescreen'
        else this.viewport = 'desktop'
    }
}
</script>