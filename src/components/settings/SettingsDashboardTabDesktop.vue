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
                                v-model="desktopLayout1"
                                handle=".handle"
                                class="v-list-item-group"
                                ghost-class="ghost"
                                group="desktopViewport">
                                <template v-for="element in desktopLayout1">
                                    <v-list-item :key="'item-desktop-' + element.name">
                                        <v-row class="d-flex align-center">
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
                                v-model="desktopLayout2"
                                handle=".handle"
                                class="v-list-item-group"
                                ghost-class="ghost"
                                group="desktopViewport">
                                <template v-for="element in desktopLayout2">
                                    <v-list-item :key="'item-desktop-' + element.name">
                                        <v-row class="d-flex align-center">
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
import draggable from 'vuedraggable'
import { convertPanelnameToIcon } from '@/plugins/helpers'
import DashboardMixin from '@/components/mixins/dashboard'
import { mdiInformation, mdiCheckboxMarked, mdiCheckboxBlankOutline, mdiLock, mdiDragVertical } from '@mdi/js'

@Component({
    components: {
        draggable,
    },
})
export default class SettingsDashboardTabDesktop extends Mixins(DashboardMixin) {
    /**
     * Icons
     */
    mdiLock = mdiLock
    mdiInformation = mdiInformation
    mdiDragVertical = mdiDragVertical
    mdiCheckboxMarked = mdiCheckboxMarked
    mdiCheckboxBlankOutline = mdiCheckboxBlankOutline

    convertPanelnameToIcon = convertPanelnameToIcon

    get desktopLayout1() {
        let panels = this.$store.getters['gui/getPanels']('desktopLayout1')
        panels = panels.concat(this.missingPanelsDesktop)
        panels = panels.filter((element: any) => this.allPossiblePanels.includes(element.name))

        return panels
    }

    set desktopLayout1(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.desktopLayout1', value: newVal })
    }

    get desktopLayout2() {
        let panels = this.$store.getters['gui/getPanels']('desktopLayout2')
        panels = panels.filter((element: any) => this.allPossiblePanels.includes(element.name))

        return panels
    }

    set desktopLayout2(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.desktopLayout2', value: newVal })
    }

    changeState1(name: string, newVal: boolean) {
        const index = this.desktopLayout1.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.desktopLayout1[index].visible = newVal
            this.$store.dispatch('gui/saveSetting', { name: 'dashboard.desktopLayout1', value: this.desktopLayout1 })
        }
    }

    changeState2(name: string, newVal: boolean) {
        const index = this.desktopLayout2.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.desktopLayout2[index].visible = newVal
            this.$store.dispatch('gui/saveSetting', { name: 'dashboard.desktopLayout2', value: this.desktopLayout2 })
        }
    }

    resetLayout() {
        this.$store.dispatch('gui/resetLayout', 'desktopLayout1')
        this.$store.dispatch('gui/resetLayout', 'desktopLayout2')
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
