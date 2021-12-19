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
                <v-col class="col-12 col-md-4">
                    <v-card class="mx-auto" max-width="300" tile >
                        <v-list dense>
                            <v-list-item>
                                <v-row>
                                    <v-col class="col-auto pr-0">
                                        <v-icon>mdi-information</v-icon>
                                    </v-col>
                                    <v-col>
                                        {{ $t('Panels.StatusPanel.Headline') }}
                                    </v-col>
                                    <v-col class="col-auto">
                                        <v-icon color="grey lighten-1">mdi-lock</v-icon>
                                    </v-col>
                                </v-row>
                            </v-list-item>
                            <draggable v-model="widescreenLayout1" :handle="isMobile ? '.handle' : ''" class="v-list-item-group" ghost-class="ghost" group="widescreenViewport">
                                <template v-for="(element) in widescreenLayout1">
                                    <v-list-item :key="'item-widescreen-'+element.name" link>
                                        <v-row>
                                            <v-col class="col-auto pr-0">
                                                <v-icon v-if="isMobile" class="handle">mdi-arrow-up-down</v-icon>
                                                <v-icon v-else v-text="convertPanelnameToIcon(element.name)"></v-icon>
                                            </v-col>
                                            <v-col class="pr-0">
                                                {{ getPanelName(element.name) }}
                                            </v-col>
                                            <v-col class="col-auto pl-0">
                                                <v-icon v-if="!element.visible" color="grey lighten-1" @click.stop="changeState1(element.name,true)">mdi-checkbox-blank-outline</v-icon>
                                                <v-icon v-else color="primary" @click.stop="changeState1(element.name,false)">mdi-checkbox-marked</v-icon>
                                            </v-col>
                                        </v-row>
                                    </v-list-item>
                                </template>
                            </draggable>
                        </v-list>
                    </v-card>
                </v-col>
                <v-col class="col-12 col-md-4">
                    <v-card class="mx-auto" max-width="300" tile >
                        <v-list dense>
                            <draggable v-model="widescreenLayout2" :handle="isMobile ? '.handle' : ''" class="v-list-item-group" ghost-class="ghost" group="widescreenViewport">
                                <template v-for="(element) in widescreenLayout2">
                                    <v-list-item :key="'item-widescreen-'+element.name" link>
                                        <v-row>
                                            <v-col class="col-auto pr-0">
                                                <v-icon v-if="isMobile" class="handle">mdi-arrow-up-down</v-icon>
                                                <v-icon v-else v-text="convertPanelnameToIcon(element.name)"></v-icon>
                                            </v-col>
                                            <v-col class="pr-0">
                                                {{ getPanelName(element.name) }}
                                            </v-col>
                                            <v-col class="col-auto pl-0">
                                                <v-icon v-if="!element.visible" color="grey lighten-1" @click.stop="changeState2(element.name,true)">mdi-checkbox-blank-outline</v-icon>
                                                <v-icon v-else color="primary" @click.stop="changeState2(element.name,false)">mdi-checkbox-marked</v-icon>
                                            </v-col>
                                        </v-row>
                                    </v-list-item>
                                </template>
                            </draggable>
                        </v-list>
                    </v-card>
                </v-col>
                <v-col class="col-12 col-md-4">
                    <v-card class="mx-auto" max-width="300" tile >
                        <v-list dense>
                            <draggable v-model="widescreenLayout3" :handle="isMobile ? '.handle' : ''" class="v-list-item-group" ghost-class="ghost" group="widescreenViewport">
                                <template v-for="(element) in widescreenLayout3">
                                    <v-list-item :key="'item-widescreen-'+element.name" link>
                                        <v-row>
                                            <v-col class="col-auto pr-0">
                                                <v-icon v-if="isMobile" class="handle">mdi-arrow-up-down</v-icon>
                                                <v-icon v-else v-text="convertPanelnameToIcon(element.name)"></v-icon>
                                            </v-col>
                                            <v-col class="pr-0">
                                                {{ getPanelName(element.name) }}
                                            </v-col>
                                            <v-col class="col-auto pl-0">
                                                <v-icon v-if="!element.visible" color="grey lighten-1" @click.stop="changeState3(element.name,true)">mdi-checkbox-blank-outline</v-icon>
                                                <v-icon v-else color="primary" @click.stop="changeState3(element.name,false)">mdi-checkbox-marked</v-icon>
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
import {capitalize, convertPanelnameToIcon} from '@/plugins/helpers'
import DashboardMixin from '@/components/mixins/dashboard'
@Component( {
    components: {
        draggable
    }
}
)
export default class SettingsDashboardTabWidescreen extends Mixins(DashboardMixin) {
    capitalize = capitalize
    convertPanelnameToIcon = convertPanelnameToIcon

    get widescreenLayout1() {
        let panels = this.$store.getters['gui/getPanels']('widescreenLayout1')
        panels = panels.concat(this.missingPanelsWidescreen)

        return panels
    }

    set widescreenLayout1(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.widescreenLayout1', value: newVal })
    }

    get widescreenLayout2() {
        return this.$store.getters['gui/getPanels']('widescreenLayout2')
    }

    set widescreenLayout2(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.widescreenLayout2', value: newVal })
    }

    get widescreenLayout3() {
        return this.$store.getters['gui/getPanels']('widescreenLayout3')
    }

    set widescreenLayout3(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.widescreenLayout3', value: newVal })
    }

    changeState1(name: string, newVal: boolean) {
        const index = this.widescreenLayout1.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.widescreenLayout1[index].visible = newVal
            this.$store.dispatch('gui/saveSetting', {name: 'dashboard.widescreenLayout1', value: this.widescreenLayout1 })
        }
    }

    changeState2(name: string, newVal: boolean) {
        const index = this.widescreenLayout2.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.widescreenLayout2[index].visible = newVal
            this.$store.dispatch('gui/saveSetting', {name: 'dashboard.widescreenLayout2', value: this.widescreenLayout2 })
        }
    }

    changeState3(name: string, newVal: boolean) {
        const index = this.widescreenLayout3.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.widescreenLayout3[index].visible = newVal
            this.$store.dispatch('gui/saveSetting', {name: 'dashboard.widescreenLayout3', value: this.widescreenLayout3 })
        }
    }

    resetLayout() {
        this.$store.dispatch('gui/resetLayout', 'widescreenLayout1')
        this.$store.dispatch('gui/resetLayout', 'widescreenLayout2')
        this.$store.dispatch('gui/resetLayout', 'widescreenLayout3')
    }
}
</script>