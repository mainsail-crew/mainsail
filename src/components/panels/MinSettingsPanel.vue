<template>
    <panel
        v-if="klipperState === 'ready' && existsPrinterConfig && missingConfigs.length"
        icon="mdi-alert-circle"
        :title="$t('Panels.MinSettingsPanel.MissingConfiguration')"
        :collapsible="true"
        card-class="min-settings-panel"
        toolbar-color="orange darken-2"
        >
        <v-card-text>
            <v-row>
                <v-col>
                    <ul class="">
                        <li v-for="module in missingConfigs" v-bind:key="module" class="orange--text">
                            <code>{{ module }}</code> {{ $t("Panels.MinSettingsPanel.IsNotDefinedInConfig") }}
                        </li>
                    </ul>
                </v-col>
            </v-row>
        </v-card-text>
        <template v-if="mainsailCfgExists">
            <v-divider></v-divider>
            <v-card-text>
                <v-row>
                    <v-col>
                        <p class="orange--text mb-0">{{ $t("Panels.MinSettingsPanel.IncludeMainsailCfg") }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider class="mb-2"></v-divider>
        </template>
        <v-card-actions class="justify-center pb-3">
            <v-btn small href="https://docs.mainsail.xyz/necessary-configuration" target="_blank"><v-icon small class="mr-1">mdi-information</v-icon>{{ $t("Panels.MinSettingsPanel.MoreInformation") }}</v-btn>
        </v-card-actions>
    </panel>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import {Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
@Component({
    components: {Panel}
})
export default class MinSettingsPanel extends Mixins(BaseMixin) {

    get existsPrinterConfig() {
        return this.$store.getters['printer/existPrinterConfig'] ?? false
    }

    get missingConfigs() {
        return this.$store.getters['printer/checkNecessaryConfig'] ?? []
    }

    get mainsailCfgExists() {
        return this.$store.getters['files/checkConfigFile']('mainsail.cfg') ?? false
    }
}
</script>

<style scoped>
    .content span,
    .content strong {
        padding-left: 8px;
        padding-right: 8px;
        white-space: pre-wrap;
    }
</style>