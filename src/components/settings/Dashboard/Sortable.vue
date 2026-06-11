<template>
    <v-card class="mx-auto fill-height" max-width="300" tile>
        <v-list class="fill-height" dense>
            <v-list-item v-if="column < 2">
                <v-row>
                    <v-col class="col-auto pr-0 pl-8">
                        <v-icon>{{ mdiInformation }}</v-icon>
                    </v-col>
                    <v-col class="pr-0 text-truncate">
                        {{ $t('Panels.StatusPanel.Headline') }}
                    </v-col>
                    <v-col class="col-auto pl-0">
                        <v-icon color="grey lighten-1">{{ mdiLock }}</v-icon>
                    </v-col>
                </v-row>
            </v-list-item>
            <draggable
                v-model="layout"
                handle=".handle"
                class="v-list-item-group fill-height"
                ghost-class="ghost"
                :group="groupname"
                :force-fallback="true">
                <transition-group>
                    <settings-dashboard-sortable-item
                        v-for="element in layout"
                        :key="`item-${element.name}`"
                        :name="element.name"
                        :visible="element.visible"
                        @change-visible="changeVisible" />
                </transition-group>
            </draggable>
        </v-list>
    </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import draggable from 'vuedraggable'
import { mdiInformation, mdiLock } from '@mdi/js'
import { useDashboard } from '@/composables/useDashboard'
import SettingsDashboardSortableItem from '@/components/settings/Dashboard/SortableItem.vue'
import { GuiStateLayoutoption } from '@/store/gui/types'

const props = defineProps({
    viewportName: { type: String, required: true },
    column: { type: Number, required: false, default: 1 },
})

const store = useStore()
const { getPanelName, convertPanelnameToIcon } = useDashboard()

const layoutname = computed(() => {
    if (props.column) return `${props.viewportName}Layout${props.column}`
    return `${props.viewportName}Layout`
})

const groupname = computed(() => `${props.viewportName}Viewport`)

const layout = computed({
    get: (): GuiStateLayoutoption[] => store.getters['gui/getPanels'](props.viewportName, props.column) as GuiStateLayoutoption[],
    set: (newVal: Array<GuiStateLayoutoption | undefined>) => {
        const filteredLayout = newVal.filter((element) => element !== undefined)
        store.dispatch('gui/saveSetting', { name: `dashboard.${layoutname.value}`, value: filteredLayout })
    },
})

function changeVisible(name: string, newVal: boolean) {
    const index = layout.value.findIndex((element) => element.name === name)
    if (index === -1) return

    const newLayout = [...layout.value]
    newLayout[index] = { ...newLayout[index], visible: newVal }
    store.dispatch('gui/saveSetting', {
        name: `dashboard.${layoutname.value}`,
        value: newLayout,
    })
}
</script>

<style scoped>
/deep/ .ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

.v-list-item-group > span {
    display: block;
    height: 100%;
}
</style>
