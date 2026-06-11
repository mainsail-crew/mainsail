<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col>
                    <settings-dashboard-sortable viewport-name="mobile" :column="0" />
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

<script setup lang="ts">
import { useStore } from 'vuex'
import SettingsDashboardSortable from '@/components/settings/Dashboard/Sortable.vue'

const store = useStore()

function resetLayout() {
    store.dispatch('gui/resetLayout', 'mobileLayout')
}
</script>

<style scoped></style>
