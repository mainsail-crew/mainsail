<template>
    <panel
        v-if="is_active"
        :title="$t('Heightmap.CurrentMesh.Headline')"
        card-class="heightmap-current-mesh-panel"
        :icon="mdiInformation"
        :collapsible="true"
        class="mt-0">
        <v-card-text class="py-3 px-0">
            <v-row class="px-3">
                <v-col>{{ $t('Heightmap.CurrentMesh.Name') }}</v-col>
                <v-col class="text-right">
                    <span
                        v-if="!name.startsWith('adaptive-')"
                        class="currentMeshName cursor-pointer font-weight-bold"
                        @click="showRename = true">
                        <v-icon left small color="primary">{{ mdiPencil }}</v-icon>
                        {{ name }}
                    </span>
                    <span v-else class="font-weight-bold">{{ name }}</span>
                </v-col>
            </v-row>
            <v-divider class="my-3" />
            <v-row class="px-3">
                <v-col>{{ $t('Heightmap.CurrentMesh.Size') }}</v-col>
                <v-col class="text-right">{{ x_count }}x{{ y_count }}</v-col>
            </v-row>
            <v-divider class="my-3" />
            <v-row v-if="index_max > -1" class="px-3">
                <v-col>
                    {{ $t('Heightmap.CurrentMesh.Max') }} [{{ position_max_x.toFixed(1) }},
                    {{ position_max_y.toFixed(1) }}]
                </v-col>
                <v-col class="text-right">{{ max.toFixed(3) }} mm</v-col>
            </v-row>
            <v-divider class="my-3" />
            <v-row class="px-3">
                <v-col>
                    {{ $t('Heightmap.CurrentMesh.Min') }} [{{ position_min_x.toFixed(1) }},
                    {{ position_min_y.toFixed(1) }}]
                </v-col>
                <v-col class="text-right">{{ min.toFixed(3) }} mm</v-col>
            </v-row>
            <v-divider class="my-3" />
            <v-row class="px-3">
                <v-col>{{ $t('Heightmap.CurrentMesh.Range') }}</v-col>
                <v-col class="text-right">{{ variance }} mm</v-col>
            </v-row>
        </v-card-text>
        <heightmap-rename-profile-dialog v-model="showRename" :name="name" />
    </panel>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBedMesh } from '@/composables/useBedMesh'
import { mdiInformation, mdiPencil } from '@mdi/js'
import HeightmapRenameProfileDialog from '@/components/dialogs/HeightmapRenameProfileDialog.vue'

const { is_active, bed_mesh, name, min, max, variance, mesh_min, mesh_max, points } = useBedMesh()

const showRename = ref(false)

const x_count = computed(() => bed_mesh.value.probed_matrix?.[0]?.length ?? 0)
const y_count = computed(() => bed_mesh.value.probed_matrix?.length ?? 0)

const x_step_size = computed(() => {
    if (x_count.value < 1) return 0
    return (mesh_max.value[0] - mesh_min.value[0]) / (x_count.value - 1)
})

const y_step_size = computed(() => {
    if (y_count.value < 1) return 0
    return (mesh_max.value[1] - mesh_min.value[1]) / (y_count.value - 1)
})

const index_max = computed(() => points.value.indexOf(max.value))

const index_max_y = computed(() => Math.trunc(index_max.value / x_count.value))
const index_max_x = computed(() => index_max.value % x_count.value)

const position_max_x = computed(() => mesh_min.value[0] + index_max_x.value * x_step_size.value)
const position_max_y = computed(() => mesh_min.value[1] + index_max_y.value * y_step_size.value)

const index_min = computed(() => points.value.indexOf(min.value))
const index_min_y = computed(() => Math.trunc(index_min.value / x_count.value))
const index_min_x = computed(() => index_min.value % x_count.value)

const position_min_x = computed(() => mesh_min.value[0] + index_min_x.value * x_step_size.value)
const position_min_y = computed(() => mesh_min.value[1] + index_min_y.value * y_step_size.value)
</script>

<style scoped lang="scss">
.currentMeshName {
    color: var(--v-primary-base);

    .v-icon {
        opacity: 0;
    }

    &:hover .v-icon {
        opacity: 1;
    }
}
</style>
