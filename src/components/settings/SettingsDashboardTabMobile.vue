<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col>
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
                                v-model="mobileLayout"
                                handle=".handle"
                                class="v-list-item-group"
                                ghost-class="ghost"
                                group="mobileViewport">
                                <template v-for="element in mobileLayout">
                                    <v-list-item :key="'item-mobile-' + element.name">
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
                                                    @click.stop="changeState(element.name, true)">
                                                    {{ mdiCheckboxBlankOutline }}
                                                </v-icon>
                                                <v-icon
                                                    v-else
                                                    color="primary"
                                                    @click.stop="changeState(element.name, false)">
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
import { mdiDragVertical, mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiInformation, mdiLock } from '@mdi/js'
@Component({
    components: {
        draggable,
    },
})
export default class SettingsDashboardTabMobile extends Mixins(DashboardMixin) {
    /**
     * Icons
     */
    mdiLock = mdiLock
    mdiInformation = mdiInformation
    mdiDragVertical = mdiDragVertical
    mdiCheckboxMarked = mdiCheckboxMarked
    mdiCheckboxBlankOutline = mdiCheckboxBlankOutline

    get mobileLayout() {
        let panels = this.$store.getters['gui/getPanels']('mobileLayout')
        panels = panels.concat(this.missingPanelsMobile)
        panels = panels.filter((element: any) => this.allPossiblePanels.includes(element.name))

        return panels
    }

    set mobileLayout(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.mobileLayout', value: newVal })
    }

    changeState(name: string, newVal: boolean) {
        const index = this.mobileLayout.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.mobileLayout[index].visible = newVal
            this.$store.dispatch('gui/saveSetting', { name: 'dashboard.mobileLayout', value: this.mobileLayout })
        }
    }

    resetLayout() {
        this.$store.dispatch('gui/resetLayout', 'mobileLayout')
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
