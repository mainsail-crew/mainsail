<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col class="col-12 col-md-6">
                    <settings-dashboard-sortable viewport-name="tablet" :column="1" />
                </v-col>
                <v-col class="col-12 col-md-6">
                    <settings-dashboard-sortable viewport-name="tablet" :column="2" />
                </v-col>
            </v-row>
            <v-row>
                <v-col class="text-center">
                    <v-btn color="error" @click="resetLayout">{{ $t('Settings.DashboardTab.ResetLayout') }}</v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import DashboardMixin from '@/components/mixins/dashboard'
import SettingsDashboardSortable from '@/components/settings/Dashboard/Sortable.vue'
@Component({
    components: {
        SettingsDashboardSortable,
    },
})
export default class SettingsDashboardTabTablet extends Mixins(DashboardMixin) {
    resetLayout() {
        this.$store.dispatch('gui/resetLayout', 'tabletLayout1')
        this.$store.dispatch('gui/resetLayout', 'tabletLayout2')
    }
}
</script>

<style scoped></style>
