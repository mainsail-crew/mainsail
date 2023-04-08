<template>
    <div>
        <v-card-text>
            <h3 class="text-h5 mb-3">{{ $t('Settings.NavigationTab.Navigation') }}</h3>
            <draggable
                v-model="sortableNaviPoints"
                handle=".handle"
                ghost-class="ghost"
                group="macros"
                @change="updateOrder">
                <v-row v-for="(naviPoint, index) in sortableNaviPoints" :key="index" class="dragable-item my-2 mx-0">
                    <v-col class="col-auto pr-0 d-flex py-2">
                        <v-icon class="handle">{{ mdiDragVertical }}</v-icon>
                    </v-col>
                    <v-col class="py-2">
                        <settings-row
                            :key="'groupMacro_macro_' + index"
                            :title="naviPoint.title"
                            :dynamic-slot-width="true">
                            <v-tooltip top>
                                <template #activator="{ on, attrs }">
                                    <v-btn
                                        small
                                        outlined
                                        v-bind="attrs"
                                        class="ml-3 minwidth-0 px-2"
                                        :color="naviPoint.visible ? '' : 'secondary'"
                                        v-on="on">
                                        <v-icon small>{{ mdiPrinter3dNozzle }}</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{ $t('Settings.MacrosTab.ShowInStatePrinting') }}</span>
                            </v-tooltip>
                        </settings-row>
                    </v-col>
                </v-row>
            </draggable>
        </v-card-text>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import NavigationMixin, { NaviPoint } from '@/components/mixins/navigation'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import draggable from 'vuedraggable'
import { mdiDelete, mdiPrinter3dNozzle, mdiDragVertical, mdiPencil } from '@mdi/js'

@Component({
    components: { SettingsRow, draggable },
})
export default class SettingsNavigationTab extends Mixins(NavigationMixin, BaseMixin) {
    /**
     * Icons
     */
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete
    mdiPrinter3dNozzle = mdiPrinter3dNozzle
    mdiDragVertical = mdiDragVertical

    get sortableNaviPoints() {
        return this.naviPoints.filter((naviPoint) => naviPoint.position)
    }

    set sortableNaviPoints(newVal: NaviPoint[]) {
        window.console.log('sortableNaviPoints', newVal)
    }

    updateOrder() {
        console.log('updateOrder')
    }
}
</script>

<style scoped>
.dragable-item {
    background-color: #282828;
}
</style>
