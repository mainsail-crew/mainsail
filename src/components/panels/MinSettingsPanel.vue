<template>
    <v-card class="mb-6" v-if="klipperState === 'ready' && existsPrinterConfig && missingConfigs.length">
        <v-toolbar flat dense color="orange darken-2">
            <v-toolbar-title>
                <span class="subheading">
                    <v-icon class="mdi mdi-alert-circle" left></v-icon>{{ $t("Panels.MinSettingsPanel.MissingConfiguration") }}
                </span>
            </v-toolbar-title>
        </v-toolbar>
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
            <v-btn href="https://docs.mainsail.xyz/necessary-configuration" target="_blank" color="white" outlined small><v-icon small class="mr-1">mdi-information</v-icon>{{ $t("Panels.MinSettingsPanel.MoreInformation") }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import {Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
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