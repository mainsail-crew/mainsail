<template>
    <panel
        :title="$t('Heightmap.Profiles')"
        card-class="heightmap-profiles-panel"
        :icon="mdiStackOverflow"
        :collapsible="true"
        class="mt-6 mt-md-0">
        <v-card-text v-if="Object.keys(profiles).length" class="px-0 py-3">
            <template v-for="(profile, name, index) in profiles">
                <v-divider v-if="index" :key="`deliver_${name}`" class="my-3" />
                <heightmap-profiles-panel-row :key="`profile_${name}`" :profile="profile" :name="name" />
            </template>
        </v-card-text>
        <v-card-text v-else>
            <p class="mb-0">{{ $t('Heightmap.NoProfile') }}</p>
        </v-card-text>
    </panel>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiStackOverflow } from '@mdi/js'
import HeightmapProfilesPanelRow from '@/components/panels/Heightmap/HeightmapProfilesPanelRow.vue'

@Component({
    components: { HeightmapProfilesPanelRow },
})
export default class HeightmapProfilesPanel extends Mixins(BaseMixin) {
    mdiStackOverflow = mdiStackOverflow

    get profiles() {
        return this.$store.state.printer.bed_mesh?.profiles ?? {}
    }
}
</script>
