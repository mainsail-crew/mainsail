<template>
    <v-card class="mx-auto" max-width="300" tile>
        <v-list dense>
            <v-list-item v-if="column === 1">
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
                :list="layout"
                handle=".handle"
                class="v-list-item-group"
                ghost-class="ghost"
                :group="groupname"
                @change="update">
                <v-list-item v-for="element in layout" :key="`item-${viewportName}-${element.name}`">
                    <settings-dashboard-sortable-item
                        :name="element.name"
                        :visible="element.visible"
                        @change-visible="changeVisible" />
                </v-list-item>
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
import SettingsDashboardSortableItem from '@/components/inputs/SettingsDashboardSortableItem.vue'

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
        return `${this.viewportName}Layout${this.column}`
    }

    get groupname() {
        return `${this.viewportName}Viewport`
    }

    get layout() {
        let panels = this.$store.getters['gui/getPanels'](this.layoutname)
        panels = panels.filter((element: any) => this.allPossiblePanels.includes(element.name))

        return panels
    }

    set layout(_) {}

    /*set layout(newVal) {
        window.console.log(this.layoutname, newVal)
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', { name: `dashboard.${this.layoutname}`, value: newVal })
    }*/

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

    update(event: any) {
        window.console.log('update', event)

        if ('added' in event) {
            window.console.log('added')
        }

        if ('removed' in event) {
            window.console.log('removed')
        }

        if ('moved' in event) {
            window.console.log('moved', event.moved.element.name, event.moved.oldIndex, event.moved.newIndex)
        }
    }
}
</script>

<style scoped>
/deep/ .ghost {
    opacity: 0.5;
    background: #c8ebfb;
}
</style>
