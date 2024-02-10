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
        <heightmap-rename-profile-dialog :show="showRename" :name="name" @close="showRename = false" />
    </panel>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiInformation, mdiPencil } from '@mdi/js'
import BedmeshMixin from '@/components/mixins/bedmesh'

@Component({
    components: {},
})
export default class HeightmapCurrentProfilePanel extends Mixins(BaseMixin, BedmeshMixin) {
    mdiInformation = mdiInformation
    mdiPencil = mdiPencil

    showRename = false

    get x_count() {
        return this.bed_mesh.probed_matrix[0]?.length ?? 0
    }

    get y_count() {
        return this.bed_mesh.probed_matrix?.length ?? 0
    }

    get x_step_size() {
        if (this.x_count < 1) return 0

        return (this.mesh_max[0] - this.mesh_min[0]) / (this.x_count - 1)
    }

    get y_step_size() {
        if (this.y_count < 1) return 0

        return (this.mesh_max[1] - this.mesh_min[1]) / (this.y_count - 1)
    }

    get index_max() {
        return this.points.indexOf(this.max)
    }

    get index_max_y() {
        return Math.trunc(this.index_max / this.x_count)
    }

    get index_max_x() {
        return this.index_max % this.y_count
    }

    get position_max_x() {
        return this.mesh_min[0] + this.index_max_x * this.x_step_size
    }

    get position_max_y() {
        return this.mesh_min[1] + this.index_max_y * this.y_step_size
    }

    get index_min() {
        return this.points.indexOf(this.min)
    }

    get index_min_y() {
        return Math.trunc(this.index_min / this.x_count)
    }

    get index_min_x() {
        return this.index_min % this.y_count
    }

    get position_min_x() {
        return this.mesh_min[0] + this.index_min_x * this.x_step_size
    }

    get position_min_y() {
        return this.mesh_min[1] + this.index_min_y * this.y_step_size
    }
}
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
