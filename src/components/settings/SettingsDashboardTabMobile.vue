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
export default class SettingsDashboardTabMobile extends Mixins(BaseMixin) {
    capitalize = capitalize

    get mobileLayout() {
        return this.$store.state.gui?.dashboard?.mobileLayout?.filter((element: any) => element !== null) ?? []
    }

    set mobileLayout(newVal) {
        newVal = newVal.filter((element: any) => element !== undefined)

        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.mobileLayout', value: newVal })
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