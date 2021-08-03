<style scoped>
    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }
</style>

<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col class="col-12 col-md-6">
                    <v-card class="mx-auto" max-width="300" tile >
                        <v-list dense>
                            <v-list-item>
                                <v-list-item-icon>
                                    <v-icon>mdi-information</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>{{ $t('Panels.StatusPanel.Headline') }}</v-list-item-title>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-icon color="grey lighten-1">mdi-lock</v-icon>
                                </v-list-item-action>
                            </v-list-item>
                            <draggable v-model="desktopLayout1" class="v-list-item-group" ghost-class="ghost" group="desktopViewport">
                                <template v-for="(element) in desktopLayout1">
                                    <v-list-item :key="'item-desktop-'+element.name" link>
                                        <v-list-item-icon>
                                            <v-icon v-text="convertPanelnameToIcon(element.name)"></v-icon>
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ $t('Panels.'+capitalize(element.name)+'Panel.Headline') }}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                            <v-icon v-if="!element.visable" color="grey lighten-1" @click.stop="changeState1(element.name,true)">mdi-checkbox-blank-outline</v-icon>
                                            <v-icon v-else color="primary" @click.stop="changeState1(element.name,false)">mdi-checkbox-marked</v-icon>
                                        </v-list-item-action>
                                    </v-list-item>
                                </template>
                            </draggable>
                        </v-list>
                    </v-card>
                </v-col>
                <v-col class="col-12 col-md-6">
                    <v-card class="mx-auto" max-width="300" tile >
                        <v-list dense>
                            <draggable v-model="desktopLayout2" class="v-list-item-group" ghost-class="ghost" group="desktopViewport">
                                <template v-for="(element) in desktopLayout2">
                                    <v-list-item :key="'item-desktop-'+element.name" link>
                                        <v-list-item-icon>
                                            <v-icon v-text="convertPanelnameToIcon(element.name)"></v-icon>
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ $t('Panels.'+capitalize(element.name)+'Panel.Headline') }}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                            <v-icon v-if="!element.visable" color="grey lighten-1" @click.stop="changeState2(element.name,true)">mdi-checkbox-blank-outline</v-icon>
                                            <v-icon v-else color="primary" @click.stop="changeState2(element.name,false)">mdi-checkbox-marked</v-icon>
                                        </v-list-item-action>
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
import BaseMixin from '@/components/mixins/base'
import draggable from 'vuedraggable'
import {capitalize, convertPanelnameToIcon} from "@/plugins/helpers";
@Component( {
    components: {
        draggable
    }
}
)
export default class SettingsDashboardTabDesktop extends Mixins(BaseMixin) {
    capitalize = capitalize
    convertPanelnameToIcon = convertPanelnameToIcon

    get desktopLayout1() {
        return this.$store.state.gui?.dashboard?.desktopLayout1?.filter((element: any) => element !== null) ?? []
    }

    set desktopLayout1(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.desktopLayout1', value: newVal })
    }

    get desktopLayout2() {
        return this.$store.state.gui?.dashboard?.desktopLayout2?.filter((element: any) => element !== null) ?? []
    }

    set desktopLayout2(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.desktopLayout2', value: newVal })
    }

    changeState1(name: string, newVal: boolean) {
        const index = this.desktopLayout1.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.desktopLayout1[index].visable = newVal
            this.$store.dispatch('gui/saveSetting', {name: 'dashboard.desktopLayout1', value: this.desktopLayout1 })
        }
    }

    changeState2(name: string, newVal: boolean) {
        const index = this.desktopLayout2.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.desktopLayout2[index].visable = newVal
            this.$store.dispatch('gui/saveSetting', {name: 'dashboard.desktopLayout2', value: this.desktopLayout2 })
        }
    }

    resetLayout() {
        this.$store.dispatch('gui/resetLayout', 'desktopLayout1')
        this.$store.dispatch('gui/resetLayout', 'desktopLayout2')
    }
}
</script>