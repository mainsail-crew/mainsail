<style scoped>
    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }
</style>

<template>
    <div>
        <v-card flat>
            <v-card-text class="pa-0">
                <v-tabs v-model="viewport" centered dark background-color="grey darken-2" >
                    <v-tabs-slider></v-tabs-slider>
                    <v-tab href="#tab-viewport-mobile">Mobile</v-tab>
                    <v-tab href="#tab-viewport-tablet">Tablet</v-tab>
                    <v-tab href="#tab-viewport-desktop">Desktop</v-tab>
                    <v-tab href="#tab-viewport-widescreen">Widescreen</v-tab>
                </v-tabs>

                <v-tabs-items v-model="viewport">
                    <v-tab-item value="tab-viewport-mobile">
                        <v-card flat>
                            <v-card-text>
                                <v-row>
                                    <v-col>
                                        <v-card class="mx-auto" max-width="300" tile >
                                            <v-list dense>
                                                <v-list-item>
                                                    <v-list-item-icon>
                                                        <v-icon>mdi-information</v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-content>
                                                        <v-list-item-title>{{ $t('Panels.StatusPanel.Headline') }}</v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                                <draggable v-model="mobileLayout" class="v-list-item-group" ghost-class="ghost" group="mobileViewport">
                                                    <template v-for="(element) in mobileLayout">
                                                        <v-list-item :key="'item-mobile-'+element.name" link>
                                                            <v-list-item-icon>
                                                                <v-icon v-text="convertToIcon(element.name)"></v-icon>
                                                            </v-list-item-icon>
                                                            <v-list-item-content>
                                                                <v-list-item-title>{{ $t('Panels.'+capitalize(element.name)+'Panel.Headline') }}</v-list-item-title>
                                                            </v-list-item-content>
                                                        </v-list-item>
                                                    </template>
                                                </draggable>
                                            </v-list>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item value="tab-viewport-tablet">
                        <v-card flat>
                            <v-card-text>
                                <v-row>
                                    <v-col>
                                        <v-card class="mx-auto" max-width="300" tile >
                                            <v-list dense>
                                                <v-list-item>
                                                    <v-list-item-icon>
                                                        <v-icon>mdi-information</v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-content>
                                                        <v-list-item-title>{{ $t('Panels.StatusPanel.Headline') }}</v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                                <draggable v-model="tabletLayout1" class="v-list-item-group" ghost-class="ghost" group="tabletViewport">
                                                    <template v-for="(element) in tabletLayout1">
                                                        <v-list-item :key="'item-tablet-'+element.name" link>
                                                            <v-list-item-icon>
                                                                <v-icon v-text="convertToIcon(element.name)"></v-icon>
                                                            </v-list-item-icon>
                                                            <v-list-item-content>
                                                                <v-list-item-title>{{ $t('Panels.'+capitalize(element.name)+'Panel.Headline') }}</v-list-item-title>
                                                            </v-list-item-content>
                                                        </v-list-item>
                                                    </template>
                                                </draggable>
                                            </v-list>
                                        </v-card>
                                    </v-col>
                                    <v-col>
                                        <v-card class="mx-auto" max-width="300" tile >
                                            <v-list dense>
                                                <draggable v-model="tabletLayout2" class="v-list-item-group" ghost-class="ghost" group="tabletViewport">
                                                    <template v-for="(element) in tabletLayout2">
                                                        <v-list-item :key="'item-tablet-'+element.name" link>
                                                            <v-list-item-icon>
                                                                <v-icon v-text="convertToIcon(element.name)"></v-icon>
                                                            </v-list-item-icon>
                                                            <v-list-item-content>
                                                                <v-list-item-title>{{ $t('Panels.'+capitalize(element.name)+'Panel.Headline') }}</v-list-item-title>
                                                            </v-list-item-content>
                                                        </v-list-item>
                                                    </template>
                                                </draggable>
                                            </v-list>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item value="tab-viewport-desktop">
                        <v-card flat>
                            <v-card-text>
                                <v-row>
                                    <v-col>
                                        <v-card class="mx-auto" max-width="300" tile >
                                            <v-list dense>
                                                <v-list-item>
                                                    <v-list-item-icon>
                                                        <v-icon>mdi-information</v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-content>
                                                        <v-list-item-title>{{ $t('Panels.StatusPanel.Headline') }}</v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                                <draggable v-model="desktopLayout1" class="v-list-item-group" ghost-class="ghost" group="desktopViewport">
                                                    <template v-for="(element) in desktopLayout1">
                                                        <v-list-item :key="'item-desktop-'+element.name" link>
                                                            <v-list-item-icon>
                                                                <v-icon v-text="convertToIcon(element.name)"></v-icon>
                                                            </v-list-item-icon>
                                                            <v-list-item-content>
                                                                <v-list-item-title>{{ $t('Panels.'+capitalize(element.name)+'Panel.Headline') }}</v-list-item-title>
                                                            </v-list-item-content>
                                                        </v-list-item>
                                                    </template>
                                                </draggable>
                                            </v-list>
                                        </v-card>
                                    </v-col>
                                    <v-col>
                                        <v-card class="mx-auto" max-width="300" tile >
                                            <v-list dense>
                                                <draggable v-model="desktopLayout2" class="v-list-item-group" ghost-class="ghost" group="desktopViewport">
                                                    <template v-for="(element) in desktopLayout2">
                                                        <v-list-item :key="'item-desktop-'+element.name" link>
                                                            <v-list-item-icon>
                                                                <v-icon v-text="convertToIcon(element.name)"></v-icon>
                                                            </v-list-item-icon>
                                                            <v-list-item-content>
                                                                <v-list-item-title>{{ $t('Panels.'+capitalize(element.name)+'Panel.Headline') }}</v-list-item-title>
                                                            </v-list-item-content>
                                                        </v-list-item>
                                                    </template>
                                                </draggable>
                                            </v-list>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item value="tab-viewport-widescreen">
                        <v-card flat>
                            <v-card-text>
                                <v-row>
                                    <v-col>
                                        <v-card class="mx-auto" max-width="300" tile >
                                            <v-list dense>
                                                <v-list-item>
                                                    <v-list-item-icon>
                                                        <v-icon>mdi-information</v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-content>
                                                        <v-list-item-title>{{ $t('Panels.StatusPanel.Headline') }}</v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                                <draggable v-model="widescreenLayout1" class="v-list-item-group" ghost-class="ghost" group="widescreenViewport">
                                                    <template v-for="(element) in widescreenLayout1">
                                                        <v-list-item :key="'item-widescreen-'+element.name" link>
                                                            <v-list-item-icon>
                                                                <v-icon v-text="convertToIcon(element.name)"></v-icon>
                                                            </v-list-item-icon>
                                                            <v-list-item-content>
                                                                <v-list-item-title>{{ $t('Panels.'+capitalize(element.name)+'Panel.Headline') }}</v-list-item-title>
                                                            </v-list-item-content>
                                                        </v-list-item>
                                                    </template>
                                                </draggable>
                                            </v-list>
                                        </v-card>
                                    </v-col>
                                    <v-col>
                                        <v-card class="mx-auto" max-width="300" tile >
                                            <v-list dense>
                                                <draggable v-model="widescreenLayout2" class="v-list-item-group" ghost-class="ghost" group="widescreenViewport">
                                                    <template v-for="(element) in widescreenLayout2">
                                                        <v-list-item :key="'item-widescreen-'+element.name" link>
                                                            <v-list-item-icon>
                                                                <v-icon v-text="convertToIcon(element.name)"></v-icon>
                                                            </v-list-item-icon>
                                                            <v-list-item-content>
                                                                <v-list-item-title>{{ $t('Panels.'+capitalize(element.name)+'Panel.Headline') }}</v-list-item-title>
                                                            </v-list-item-content>
                                                        </v-list-item>
                                                    </template>
                                                </draggable>
                                            </v-list>
                                        </v-card>
                                    </v-col>
                                    <v-col>
                                        <v-card class="mx-auto" max-width="300" tile >
                                            <v-list dense>
                                                <draggable v-model="widescreenLayout3" class="v-list-item-group" ghost-class="ghost" group="widescreenViewport">
                                                    <template v-for="(element) in widescreenLayout3">
                                                        <v-list-item :key="'item-widescreen-'+element.name" link>
                                                            <v-list-item-icon>
                                                                <v-icon v-text="convertToIcon(element.name)"></v-icon>
                                                            </v-list-item-icon>
                                                            <v-list-item-content>
                                                                <v-list-item-title>{{ $t('Panels.'+capitalize(element.name)+'Panel.Headline') }}</v-list-item-title>
                                                            </v-list-item-content>
                                                        </v-list-item>
                                                    </template>
                                                </draggable>
                                            </v-list>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import draggable from 'vuedraggable'
import {capitalize} from "@/plugins/helpers";
@Component( {
    components: {
        draggable
    }
}
)
export default class SettingsDashboardTab extends Mixins(BaseMixin) {
    capitalize = capitalize
    private viewport = 'desktop'

    get mobileLayout() {
        return this.$store.state.gui?.dashboard?.mobileLayout?.filter((element: any) => element !== null) ?? []
    }

    set mobileLayout(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.mobileLayout', value: newVal })
    }

    get tabletLayout1() {
        return this.$store.state.gui?.dashboard?.tabletLayout1?.filter((element: any) => element !== null) ?? []
    }

    set tabletLayout1(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.tabletLayout1', value: newVal })
    }

    get tabletLayout2() {
        return this.$store.state.gui?.dashboard?.tabletLayout2?.filter((element: any) => element !== null) ?? []
    }

    set tabletLayout2(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.tabletLayout2', value: newVal })
    }

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

    get widescreenLayout1() {
        return this.$store.state.gui?.dashboard?.widescreenLayout1?.filter((element: any) => element !== null) ?? []
    }

    set widescreenLayout1(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.widescreenLayout1', value: newVal })
    }

    get widescreenLayout2() {
        return this.$store.state.gui?.dashboard?.widescreenLayout2?.filter((element: any) => element !== null) ?? []
    }

    set widescreenLayout2(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.widescreenLayout2', value: newVal })
    }

    get widescreenLayout3() {
        return this.$store.state.gui?.dashboard?.widescreenLayout3?.filter((element: any) => element !== null) ?? []
    }

    set widescreenLayout3(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.widescreenLayout3', value: newVal })
    }

    convertToIcon(name: string) {
        switch (name) {
            case 'webcam': return 'mdi-webcam'
            case 'zoffset': return 'mdi-arrow-collapse-vertical'
            case 'control': return 'mdi-gamepad'
            case 'printsettings': return 'mdi-printer-3d'
            case 'miscellaneous': return 'mdi-dip-switch'
            case 'tools': return 'mdi-thermometer-lines'
            case 'miniconsole': return 'mdi-console-line'

            default: return 'mdi-information'
        }
    }
}
</script>