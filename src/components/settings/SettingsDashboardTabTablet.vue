<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col class="col-12 col-md-6">
                    <v-card class="mx-auto" max-width="300" tile>
                        <v-list dense>
                            <v-list-item>
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
                                v-model="tabletLayout1"
                                handle=".handle"
                                class="v-list-item-group"
                                ghost-class="ghost"
                                group="tabletViewport">
                                <template v-for="element in tabletLayout1">
                                    <v-list-item :key="'item-tablet-' + element.name">
                                        <v-row>
                                            <v-col class="col-auto px-0">
                                                <v-icon class="handle pr-2">{{ mdiDragVertical }}</v-icon>
                                                <v-icon v-text="convertPanelnameToIcon(element.name)"></v-icon>
                                            </v-col>
                                            <v-col class="pr-0 text-truncate">
                                                {{ getPanelName(element.name) }}
                                            </v-col>
                                            <v-col class="col-auto pl-2">
                                                <v-icon
                                                    v-if="!element.visible"
                                                    color="grey lighten-1"
                                                    @click.stop="changeState1(element.name, true)">
                                                    {{ mdiCheckboxBlankOutline }}
                                                </v-icon>
                                                <v-icon
                                                    v-else
                                                    color="primary"
                                                    @click.stop="changeState1(element.name, false)">
                                                    {{ mdiCheckboxMarked }}
                                                </v-icon>
                                            </v-col>
                                        </v-row>
                                    </v-list-item>
                                </template>
                            </draggable>
                        </v-list>
                    </v-card>
                </v-col>
                <v-col class="col-12 col-md-6">
                    <v-card class="mx-auto" max-width="300" tile>
                        <v-list dense>
                            <draggable
                                v-model="tabletLayout2"
                                handle=".handle"
                                class="v-list-item-group"
                                ghost-class="ghost"
                                group="tabletViewport">
                                <template v-for="element in tabletLayout2">
                                    <v-list-item :key="'item-tablet-' + element.name">
                                        <v-row>
                                            <v-col class="col-auto px-0">
                                                <v-icon class="handle pr-2">{{ mdiDragVertical }}</v-icon>
                                                <v-icon v-text="convertPanelnameToIcon(element.name)"></v-icon>
                                            </v-col>
                                            <v-col class="pr-0 text-truncate">
                                                {{ getPanelName(element.name) }}
                                            </v-col>
                                            <v-col class="col-auto pl-2">
                                                <v-icon
                                                    v-if="!element.visible"
                                                    color="grey lighten-1"
                                                    @click.stop="changeState2(element.name, true)">
                                                    {{ mdiCheckboxBlankOutline }}
                                                </v-icon>
                                                <v-icon
                                                    v-else
                                                    color="primary"
                                                    @click.stop="changeState2(element.name, false)">
                                                    {{ mdiCheckboxMarked }}
                                                </v-icon>
                                            </v-col>
                                        </v-row>
                                    </v-list-item>
                                </template>
                            </draggable>
                        </v-list>
                    </v-card>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="text-center">
                    <v-btn color="error" @click="resetLayout">{{ $t('Settings.DashboardTab.ResetLayout') }}</v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import DashboardMixin from '@/components/mixins/dashboard'
import draggable from 'vuedraggable'
import { convertPanelnameToIcon } from '@/plugins/helpers'
import { mdiLock, mdiInformation, mdiDragVertical, mdiCheckboxMarked, mdiCheckboxBlankOutline } from '@mdi/js'
@Component({
    components: {
        draggable,
    },
})
export default class SettingsDashboardTabTablet extends Mixins(DashboardMixin) {
    /**
     * Icons
     */
    mdiLock = mdiLock
    mdiInformation = mdiInformation
    mdiDragVertical = mdiDragVertical
    mdiCheckboxMarked = mdiCheckboxMarked
    mdiCheckboxBlankOutline = mdiCheckboxBlankOutline

    convertPanelnameToIcon = convertPanelnameToIcon

    get tabletLayout1() {
        let panels = this.$store.getters['gui/getPanels']('tabletLayout1')
        panels = panels.concat(this.missingPanelsTablet)
        panels = panels.filter((element: any) => this.allPossiblePanels.includes(element.name))

        return panels
    }

    set tabletLayout1(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.tabletLayout1', value: newVal })
    }

    get tabletLayout2() {
        let panels = this.$store.getters['gui/getPanels']('tabletLayout2')
        panels = panels.filter((element: any) => this.allPossiblePanels.includes(element.name))

        return panels
    }

    set tabletLayout2(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.tabletLayout2', value: newVal })
    }

    changeState1(name: string, newVal: boolean) {
        const index = this.tabletLayout1.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.tabletLayout1[index].visible = newVal
            this.$store.dispatch('gui/saveSetting', { name: 'dashboard.tabletLayout1', value: this.tabletLayout1 })
        }
    }

    changeState2(name: string, newVal: boolean) {
        const index = this.tabletLayout2.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.tabletLayout2[index].visible = newVal
            this.$store.dispatch('gui/saveSetting', { name: 'dashboard.tabletLayout2', value: this.tabletLayout2 })
        }
    }

    resetLayout() {
        this.$store.dispatch('gui/resetLayout', 'tabletLayout1')
        this.$store.dispatch('gui/resetLayout', 'tabletLayout2')
    }
}
</script>

<style scoped>
.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

.handle {
    cursor: move;
}
</style>
