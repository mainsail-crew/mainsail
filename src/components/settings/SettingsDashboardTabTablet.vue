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
                            <draggable v-model="tabletLayout1" class="v-list-item-group" ghost-class="ghost" group="tabletViewport">
                                <template v-for="(element) in tabletLayout1">
                                    <v-list-item :key="'item-tablet-'+element.name" link>
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
                            <draggable v-model="tabletLayout2" class="v-list-item-group" ghost-class="ghost" group="tabletViewport">
                                <template v-for="(element) in tabletLayout2">
                                    <v-list-item :key="'item-tablet-'+element.name" link>
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
                    <v-btn color="error" @click="resetLayout">reset layout</v-btn>
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
export default class SettingsDashboardTabTablet extends Mixins(BaseMixin) {
    capitalize = capitalize
    convertPanelnameToIcon = convertPanelnameToIcon

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

    changeState1(name: string, newVal: boolean) {
        const index = this.tabletLayout1.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.tabletLayout1[index].visable = newVal
            this.$store.dispatch('gui/saveSetting', {name: 'dashboard.tabletLayout1', value: this.tabletLayout1 })
        }
    }

    changeState2(name: string, newVal: boolean) {
        const index = this.tabletLayout2.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.tabletLayout2[index].visable = newVal
            this.$store.dispatch('gui/saveSetting', {name: 'dashboard.tabletLayout2', value: this.tabletLayout2 })
        }
    }

    resetLayout() {
        this.$store.dispatch('gui/resetLayout', 'tabletLayout1')
        this.$store.dispatch('gui/resetLayout', 'tabletLayout2')
    }
}
</script>