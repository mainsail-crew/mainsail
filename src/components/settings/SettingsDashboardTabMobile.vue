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
                                <v-list-item-action>
                                    <v-icon color="grey lighten-1">mdi-lock</v-icon>
                                </v-list-item-action>
                            </v-list-item>
                            <draggable v-model="mobileLayout" class="v-list-item-group" ghost-class="ghost" group="mobileViewport">
                                <template v-for="(element) in mobileLayout">
                                    <v-list-item :key="'item-mobile-'+element.name" link>
                                        <v-list-item-icon>
                                            <v-icon v-text="convertPanelnameToIcon(element.name)"></v-icon>
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ $t('Panels.'+capitalize(element.name)+'Panel.Headline') }}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                            <v-icon v-if="!element.visable" color="grey lighten-1" @click.stop="changeState(element.name,true)">mdi-checkbox-blank-outline</v-icon>
                                            <v-icon v-else color="primary" @click.stop="changeState(element.name,false)">mdi-checkbox-marked</v-icon>
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
export default class SettingsDashboardTabMobile extends Mixins(BaseMixin) {
    capitalize = capitalize
    convertPanelnameToIcon = convertPanelnameToIcon

    get mobileLayout() {
        return this.$store.state.gui?.dashboard?.mobileLayout?.filter((element: any) => element !== null) ?? []
    }

    set mobileLayout(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.mobileLayout', value: newVal })
    }

    changeState(name: string, newVal: boolean) {
        const index = this.mobileLayout.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.mobileLayout[index].visable = newVal
            this.$store.dispatch('gui/saveSetting', {name: 'dashboard.mobileLayout', value: this.mobileLayout })
        }
    }

    resetLayout() {
        this.$store.dispatch('gui/resetLayout', 'mobileLayout')
    }
}
</script>