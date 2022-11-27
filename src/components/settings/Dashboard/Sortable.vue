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
                :group="groupname">
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

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import draggable from 'vuedraggable'
import { mdiInformation, mdiLock } from '@mdi/js'
import DashboardMixin from '@/components/mixins/dashboard'
import SettingsDashboardSortableItem from '@/components/settings/Dashboard/SortableItem.vue'

@Component({
    components: { SettingsDashboardSortableItem, draggable },
})
export default class SettingsDashboardSortable extends Mixins(DashboardMixin) {
    /**
     * Icons
     */
    mdiInformation = mdiInformation
    mdiLock = mdiLock

    @Prop({ type: String, required: true }) declare readonly viewportName: string
    @Prop({ type: Number, required: false, default: 1 }) declare readonly column: number

    get layoutname() {
        if (this.column) return `${this.viewportName}Layout${this.column}`

        return `${this.viewportName}Layout`
    }

    get groupname() {
        return `${this.viewportName}Viewport`
    }

    get layout() {
        return this.$store.getters['gui/getPanels'](this.viewportName, this.column)
    }

    set layout(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', { name: `dashboard.${this.layoutname}`, value: newVal })
    }

    changeVisible(name: string, newVal: boolean) {
        const index = this.layout.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.layout[index].visible = newVal
            this.$store.dispatch('gui/saveSetting', {
                name: `dashboard.${this.layoutname}`,
                value: this.layout,
            })
        }
    }
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
