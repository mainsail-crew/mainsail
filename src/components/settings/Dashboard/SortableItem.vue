<template>
    <v-list-item class="px-0">
        <div class="dashboard-sortable-item">
            <div class="dashboard-sortable-item__leading">
                <v-icon class="handle" :icon="mdiDragVertical" />
                <v-icon :icon="icon" />
            </div>
            <div class="dashboard-sortable-item__title text-truncate">
                {{ panelname }}
            </div>
            <div class="dashboard-sortable-item__action">
                <v-icon
                    :color="checkboxColor"
                    @click.stop="$emit('change-visible', name, !visible)"
                    :icon="checkboxIcon" />
            </div>
        </div>
    </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiDragVertical } from '@mdi/js'
import { useDashboard } from '@/composables/useDashboard'

const props = defineProps({
    name: { type: String, required: true },
    visible: { type: Boolean, required: true },
})

defineEmits<{
    (e: 'change-visible', name: string, visible: boolean): void
}>()

const { getPanelName, convertPanelnameToIcon } = useDashboard()

const panelname = computed(() => getPanelName(props.name))
const icon = computed(() => convertPanelnameToIcon(props.name))

const checkboxColor = computed(() => props.visible ? 'primary' : 'grey lighten-1')
const checkboxIcon = computed(() => props.visible ? mdiCheckboxMarked : mdiCheckboxBlankOutline)
</script>

<style scoped>
.dashboard-sortable-item {
    align-items: center;
    display: flex;
    gap: 12px;
    min-height: 44px;
    width: 100%;
}

.dashboard-sortable-item__leading,
.dashboard-sortable-item__action {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
}

.dashboard-sortable-item__leading {
    gap: 10px;
    min-width: 52px;
}

.dashboard-sortable-item__title {
    flex: 1 1 auto;
    min-width: 0;
}

.handle {
    cursor: move;
}
</style>
