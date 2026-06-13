<template>
    <panel
        v-if="klipperState === 'ready' && existsPrinterConfig && missingConfigs.length"
        :icon="mdiAlertCircle"
        :title="$t('Panels.MinSettingsPanel.MissingConfiguration')"
        :collapsible="true"
        card-class="min-settings-panel"
        toolbar-color="orange darken-2">
        <v-card-text>
            <v-row>
                <v-col>
                    <ul class="">
                        <li v-for="module in missingConfigs" :key="module" class="text-orange">
                            <code>{{ module }}</code>
                            {{ $t('Panels.MinSettingsPanel.IsNotDefinedInConfig') }}
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
                        <p class="text-orange mb-0">{{ $t('Panels.MinSettingsPanel.IncludeMainsailCfg') }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider class="mb-2"></v-divider>
        </template>
        <v-card-actions class="justify-center pb-3">
 <v-btn size="small" href="https://docs.mainsail.xyz/setup/configuration" target="_blank">
                <v-icon size="small" class="mr-1">{{ mdiInformation }}</v-icon>
                {{ $t('Panels.MinSettingsPanel.MoreInformation') }}
            </v-btn>
        </v-card-actions>
    </panel>
</template>

<script setup lang="ts">
import { useBase } from '@/composables/useBase'
import Panel from '@/components/ui/Panel.vue'
import { mdiInformation, mdiAlertCircle } from '@mdi/js'

const { klipperState, existsPrinterConfig, missingConfigs, mainsailCfgExists } = useBase()
</script>
