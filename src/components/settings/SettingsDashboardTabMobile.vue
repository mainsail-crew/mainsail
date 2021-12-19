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
                            <draggable v-model="mobileLayout" :handle="isMobile ? '.handle' : ''" class="v-list-item-group" ghost-class="ghost" group="mobileViewport">
                                <template v-for="(element) in mobileLayout">
                                    <v-list-item :key="'item-mobile-'+element.name" link>
                                        <v-row>
                                            <v-col class="col-auto pr-0">
                                                <v-icon v-if="isMobile" class="handle">mdi-arrow-up-down</v-icon>
                                                <v-icon v-else v-text="convertPanelnameToIcon(element.name)"></v-icon>
                                            </v-col>
                                            <v-col class="pr-0">
                                                {{ getPanelName(element.name) }}
                                            </v-col>
                                            <v-col class="col-auto pl-0">
                                                <v-icon v-if="!element.visible" color="grey lighten-1" @click.stop="changeState(element.name,true)">mdi-checkbox-blank-outline</v-icon>
                                                <v-icon v-else color="primary" @click.stop="changeState(element.name,false)">mdi-checkbox-marked</v-icon>
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
import {capitalize, convertPanelnameToIcon} from '@/plugins/helpers'
@Component( {
    components: {
        draggable
    }
}
)
export default class SettingsDashboardTabMobile extends Mixins(DashboardMixin) {
    capitalize = capitalize
    convertPanelnameToIcon = convertPanelnameToIcon

    get mobileLayout() {
        let panels = this.$store.getters['gui/getPanels']('mobileLayout')
        panels = panels.concat(this.missingPanelsMobile)

        return panels
    }

    set mobileLayout(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.mobileLayout', value: newVal })
    }

    changeState(name: string, newVal: boolean) {
        const index = this.mobileLayout.findIndex((element: any) => element.name === name)
        if (index !== -1) {
            this.mobileLayout[index].visible = newVal
            this.$store.dispatch('gui/saveSetting', {name: 'dashboard.mobileLayout', value: this.mobileLayout })
        }
    }

    resetLayout() {
        this.$store.dispatch('gui/resetLayout', 'mobileLayout')
    }
}
</script>