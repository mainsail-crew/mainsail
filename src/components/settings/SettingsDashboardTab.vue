<style scoped>
    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }
</style>

<template>
    <div>
        <v-card flat>
            <v-card-text>
                <v-row>
                    <v-col class="text-center">
                        <v-btn-toggle v-model="viewport" class="mx-auto">
                            <v-btn value="mobile">
                                <span class="hidden-sm-and-down">Mobile</span>
                                <v-icon right class="hidden-sm-and-down">mdi-cellphone</v-icon>
                                <v-icon class="hidden-md-and-up">mdi-cellphone</v-icon>
                            </v-btn>

                            <v-btn value="tablet">
                                <span class="hidden-sm-and-down">Tablet</span>
                                <v-icon right class="hidden-sm-and-down">mdi-tablet</v-icon>
                                <v-icon class="hidden-md-and-up">mdi-tablet</v-icon>
                            </v-btn>

                            <v-btn value="desktop">
                                <span class="hidden-sm-and-down">Desktop</span>
                                <v-icon right class="hidden-sm-and-down">mdi-monitor-dashboard</v-icon>
                                <v-icon class="hidden-md-and-up">mdi-monitor-dashboard</v-icon>
                            </v-btn>

                            <v-btn value="widescreen">
                                <span class="hidden-sm-and-down">Widescreen</span>
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
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import draggable from 'vuedraggable'
import {capitalize} from "@/plugins/helpers";
import SettingsDashboardTabMobile from "@/components/settings/SettingsDashboardTabMobile.vue";
import SettingsDashboardTabTablet from "@/components/settings/SettingsDashboardTabTablet.vue";
import SettingsDashboardTabDesktop from "@/components/settings/SettingsDashboardTabDesktop.vue";
import SettingsDashboardTabWidescreen from "@/components/settings/SettingsDashboardTabWidescreen.vue";

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
    capitalize = capitalize
    private viewport = 'desktop'
}
</script>