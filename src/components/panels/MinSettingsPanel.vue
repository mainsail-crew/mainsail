<template>
    <v-card class="mb-6" v-if="klipperState === 'ready' && existsPrinterConfig && missingConfigs.length">
        <v-toolbar flat dense color="orange darken-2">
            <v-toolbar-title>
                <span class="subheading">
                    <v-icon class="mdi mdi-alert-circle" left></v-icon>{{ $t("Panels.MinSettingsPanel.MissingConfiguration") }}
                </span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-layout wrap class=" text-center">
                <v-flex col class="text-left">
                    <ul class="mb-5">
                        <li v-for="module in missingConfigs" v-bind:key="module" class="orange--text">
                            <code>{{ module }}</code> {{ $t("Panels.MinSettingsPanel.IsNotDefinedInConfig") }}
                        </li>
                    </ul>
                    <div class="text-center">
                        <v-btn href="https://docs.mainsail.xyz/necessary-configuration" target="_blank" color="white" outlined small><v-icon small class="mr-1">mdi-information</v-icon>{{ $t("Panels.MinSettingsPanel.MoreInformation") }}</v-btn>
                    </div>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Mixins} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";

@Component
export default class MinSettingsPanel extends Mixins(BaseMixin) {

    get existsPrinterConfig() {
        return this.$store.getters["printer/existPrinterConfig"] ?? false
    }

    get missingConfigs() {
        return this.$store.getters["printer/checkNecessaryConfig"] ?? []
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