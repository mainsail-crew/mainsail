<template>
    <v-card ref="filesGcodeCard" class="filesGcodeCard" flat>
        <v-table class="dashboard-gcodes-table">
            <tbody>
                <tr v-if="!gcodeFiles.length">
                    <td class="text-center">{{ $t('Panels.StatusPanel.EmptyGcodes') }}</td>
                </tr>
                <status-panel-gcodefiles-entry
                    v-for="item in gcodeFiles"
                    :key="item.filename"
                    :content-td-width="contentTdWidth"
                    :item="item" />
            </tbody>
        </v-table>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import type { FileStateGcodefile } from '@/store/files/types'
import Panel from '@/components/ui/Panel.vue'
import StatusPanelGcodefilesEntry from '@/components/panels/Status/GcodefilesEntry.vue'

const { loadings } = useBase()
const store = useStore()

const filesGcodeCard = ref<any>(null)
const contentTdWidth = ref(100)
let resizeObserver: ResizeObserver | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const filesLimit = computed(() => store.state.gui.uiSettings.dashboardFilesLimit ?? 5)
const filesFilter = computed(() => store.state.gui.uiSettings.dashboardFilesFilter ?? [])

const gcodeFiles = computed(() => {
    let gcodes = store.getters['files/getAllGcodes'] ?? []

    if (filesFilter.value.length > 0 && filesFilter.value.length < 3) {
        gcodes = gcodes.filter((file: FileStateGcodefile) => {
            if (filesFilter.value.includes('new') && file.last_status === null) return true
            if (filesFilter.value.includes('completed') && file.last_status === 'completed') return true
            if (
                filesFilter.value.includes('failed') &&
                file.last_status !== null &&
                file.last_status !== 'completed'
            )
                return true
            return false
        })
    }

    gcodes = gcodes
        .sort((a: FileStateGcodefile, b: FileStateGcodefile) => {
            return b.modified.getTime() - a.modified.getTime()
        })
        .slice(0, filesLimit.value)

    const requestItems = gcodes.filter(
        (file: FileStateGcodefile) => !file.metadataRequested && !file.metadataPulled
    )
    store.dispatch(
        'files/requestMetadata',
        requestItems.map((file: FileStateGcodefile) => ({
            filename: 'gcodes/' + file.filename,
        }))
    )
    return gcodes
})

function calcContentTdWidth() {
    const element = filesGcodeCard.value?.$el ?? filesGcodeCard.value
    if (element) {
        contentTdWidth.value = element.clientWidth - 48 - 48 - 32
    }
}

function handleResize() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        nextTick(() => {
            calcContentTdWidth()
        })
    }, 200)
}

onMounted(() => {
    resizeObserver = new ResizeObserver(() => handleResize())
    const element = filesGcodeCard.value?.$el ?? filesGcodeCard.value
    if (element) {
        resizeObserver.observe(element)
    }
    calcContentTdWidth()
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
.filesGcodeCard {
    position: relative;
}
</style>
