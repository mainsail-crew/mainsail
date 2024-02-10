<template>
    <v-row class="rowProfile">
        <v-col class="pl-6">
            <span
                :class="{ 'font-weight-bold': is_active, currentMeshName: is_active, 'cursor-pointer': true }"
                @click="clickOnName">
                {{ name }}
            </span>
        </v-col>
        <v-col class="col-auto text-center d-flex align-center justify-center pr-6">
            <v-tooltip top color="rgba(0,0,0,0.8)">
                <template #activator="{ on, attrs }">
                    <small v-bind="attrs" v-on="on">{{ variance }}</small>
                </template>
                <span>
                    max: {{ max }}
                    <br />
                    min: {{ min }}
                </span>
            </v-tooltip>
        </v-col>
        <v-col class="col-auto py-0 d-flex flex-row align-center justify-end">
            <v-btn
                v-if="!is_active"
                text
                tile
                class="px-2 minwidth-0"
                :loading="isLoadingLoad"
                style="height: 48px; width: 48px"
                @click="loadProfile">
                <v-icon>{{ mdiProgressUpload }}</v-icon>
            </v-btn>
            <v-btn
                v-else
                text
                tile
                class="px-2 minwidth-0"
                :loading="isLoadingLoad"
                style="height: 48px; width: 48px"
                @click="showRename = true">
                <v-icon>{{ mdiPencil }}</v-icon>
            </v-btn>
            <v-btn
                text
                tile
                class="px-2 minwidth-0"
                style="height: 48px; width: 48px"
                :loading="isLoadingRemove"
                :title="$t('Heightmap.DeleteBedMeshProfile')"
                @click="showRemove = true">
                <v-icon>{{ mdiDelete }}</v-icon>
            </v-btn>
        </v-col>
        <heightmap-remove-profile-dialog :show="showRemove" :name="name" @close="showRemove = false" />
        <heightmap-rename-profile-dialog :show="showRename" :name="name" @close="showRename = false" />
    </v-row>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { mdiDelete, mdiPencil, mdiProgressUpload } from '@mdi/js'
import BaseMixin from '@/components/mixins/base'
import { PrinterStateBedMeshProfile } from '@/store/printer/types'
import HeightmapRenameProfileDialog from '@/components/dialogs/HeightmapRenameProfileDialog.vue'
import HeightmapRemoveProfileDialog from '@/components/dialogs/HeightmapRemoveProfileDialog.vue'

@Component({
    components: { HeightmapRenameProfileDialog, HeightmapRemoveProfileDialog },
})
export default class HeightmapProfilesPanelRow extends Mixins(BaseMixin) {
    mdiDelete = mdiDelete
    mdiPencil = mdiPencil
    mdiProgressUpload = mdiProgressUpload

    @Prop({ type: String, required: true }) name!: string
    @Prop({ type: Object, required: true }) profile!: PrinterStateBedMeshProfile

    showRemove = false
    showRename = false

    get points() {
        const points: number[] = []

        for (let i = 0; i < this.profile.points.length; i++) {
            for (let j = 0; j < this.profile.points[i].length; j++) {
                points.push(this.profile.points[i][j])
            }
        }

        return points
    }

    get min() {
        return Math.round(Math.min(...this.points) * 1000) / 1000
    }

    get max() {
        return Math.round(Math.max(...this.points) * 1000) / 1000
    }

    get variance() {
        return Math.abs(this.min - this.max).toFixed(3)
    }

    get is_active() {
        const currentProfile = this.$store.state.printer.bed_mesh?.profile_name ?? ''

        return currentProfile === this.name
    }

    get loadingNameLoad() {
        return `bedMeshLoad_${this.name}`
    }

    get loadingNameRemove() {
        return `bedMeshRemove_${this.name}`
    }

    get isLoadingLoad() {
        return this.loadings.includes(this.loadingNameLoad)
    }

    get isLoadingRemove() {
        return this.loadings.includes(this.loadingNameRemove)
    }

    clickOnName() {
        if (this.is_active) {
            this.showRename = true
            return
        }

        this.loadProfile()
    }

    loadProfile(): void {
        const gcode = `BED_MESH_PROFILE LOAD="${this.name}"`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: this.loadingNameLoad })
    }
}
</script>

<style scoped>
.currentMeshName {
    color: var(--v-primary-base);
}
</style>
