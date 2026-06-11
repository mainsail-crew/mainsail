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
        <confirmation-dialog
            v-model="showRemove"
            :icon="mdiGrid"
            :title="$t('Heightmap.BedMeshRemove')"
            :text="$t('Heightmap.DoYouReallyWantToDelete', { name })"
            :action-button-text="$t('Buttons.Delete')"
            :cancel-button-text="$t('Buttons.Cancel')"
            @action="removeProfile" />
        <heightmap-rename-profile-dialog v-model="showRename" :name="name" />
    </v-row>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useSocket } from '@/composables/useSocket'
import { PrinterStateBedMeshProfile } from '@/store/printer/types'
import { mdiDelete, mdiGrid, mdiPencil, mdiProgressUpload } from '@mdi/js'
import HeightmapRenameProfileDialog from '@/components/dialogs/HeightmapRenameProfileDialog.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

const props = defineProps<{
    name: string
    profile: PrinterStateBedMeshProfile
}>()

const { loadings } = useBase()
const socket = useSocket()
const store = useStore()

const showRemove = ref(false)
const showRename = ref(false)

const points = computed(() => {
    const result: number[] = []
    for (let i = 0; i < props.profile.points.length; i++) {
        for (let j = 0; j < props.profile.points[i].length; j++) {
            result.push(props.profile.points[i][j])
        }
    }
    return result
})

const min = computed(() => Math.round(Math.min(...points.value) * 1000) / 1000)
const max = computed(() => Math.round(Math.max(...points.value) * 1000) / 1000)
const variance = computed(() => Math.abs(min.value - max.value).toFixed(3))

const is_active = computed(() => {
    const currentProfile = store.state.printer.bed_mesh?.profile_name ?? ''
    return currentProfile === props.name
})

const loadingNameLoad = computed(() => `bedMeshLoad_${props.name}`)
const loadingNameRemove = computed(() => `bedMeshRemove_${props.name}`)
const isLoadingLoad = computed(() => loadings.value.includes(loadingNameLoad.value))
const isLoadingRemove = computed(() => loadings.value.includes(loadingNameRemove.value))

function clickOnName() {
    if (is_active.value) {
        showRename.value = true
        return
    }
    loadProfile()
}

function loadProfile() {
    const gcode = `BED_MESH_PROFILE LOAD="${props.name}"`
    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode }, { loading: loadingNameLoad.value })
}

function removeProfile() {
    const gcode = `BED_MESH_PROFILE REMOVE="${props.name}"`
    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode }, { loading: loadingNameRemove.value })
}
</script>

<style scoped>
.currentMeshName {
    color: var(--v-primary-base);
}
</style>
