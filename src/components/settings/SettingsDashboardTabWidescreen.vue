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
                <v-col class="col-12 col-md-4">
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
                <v-col class="col-12 col-md-4">
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
export default class SettingsDashboardTabWidescreen extends Mixins(BaseMixin) {
    capitalize = capitalize

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