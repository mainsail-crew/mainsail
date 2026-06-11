<template>
    <panel
        :title="$t('Heightmap.Profiles')"
        card-class="heightmap-profiles-panel"
        :icon="mdiStackOverflow"
        :collapsible="true"
        class="mt-6 mt-md-0">
        <v-card-text v-if="Object.keys(profiles).length" class="px-0 py-3">
            <template v-for="(profile, name, index) in profiles" :key="`profile_${name}`">
                <v-divider v-if="index" class="my-3" />
                <heightmap-profiles-panel-row :profile="profile" :name="name" />
            </template>
        </v-card-text>
        <v-card-text v-else>
            <p class="mb-0">{{ $t('Heightmap.NoProfile') }}</p>
        </v-card-text>
    </panel>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { mdiStackOverflow } from '@mdi/js'
import HeightmapProfilesPanelRow from '@/components/panels/Heightmap/HeightmapProfilesPanelRow.vue'

const store = useStore()

const profiles = computed(() => store.state.printer.bed_mesh?.profiles ?? {})
</script>
